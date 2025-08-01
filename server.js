const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database
const db = new sqlite3.Database('vocab.db');

// Initialize database
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    // Words table
    db.run(`CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        meaning TEXT NOT NULL,
        example TEXT
    )`);

    // User progress with spaced repetition
    db.run(`CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        word_id INTEGER,
        learned BOOLEAN DEFAULT 0,
        learning_level INTEGER DEFAULT 0,
        last_studied DATE,
        next_review DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(word_id) REFERENCES words(id),
        UNIQUE(user_id, word_id)
    )`);

    // Insert sample words
    db.get("SELECT COUNT(*) as count FROM words", (err, row) => {
        if (row.count === 0) {
            const words = [
                ['apple', 'A red or green fruit', 'I eat an apple every day.'],
                ['book', 'Something you read', 'This is a good book.'],
                ['cat', 'A small pet animal', 'The cat is sleeping.'],
                ['dog', 'A friendly pet animal', 'My dog likes to play.'],
                ['house', 'A place where people live', 'We live in a big house.'],
                ['water', 'A clear liquid that we drink', 'Please give me a glass of water.'],
                ['friend', 'Someone you like and know well', 'She is my best friend.'],
                ['school', 'A place where children learn', 'I go to school every day.'],
                ['happy', 'Feeling good and pleased', 'I am happy to see you.'],
                ['beautiful', 'Very pretty or attractive', 'The flowers are beautiful.'],
                ['important', 'Having great value or meaning', 'Education is very important.'],
                ['different', 'Not the same as another', 'These two books are different.'],
                ['wonderful', 'Extremely good', 'We had a wonderful time.'],
                ['delicious', 'Having a very pleasant taste', 'This cake is delicious.'],
                ['interesting', 'Holding attention', 'This movie is very interesting.']
            ];
            
            const stmt = db.prepare("INSERT INTO words (word, meaning, example) VALUES (?, ?, ?)");
            words.forEach(word => stmt.run(word));
            stmt.finalize();
            console.log('✅ Sample words added');
        }
    });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/login', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    db.get("SELECT * FROM users WHERE name = ?", [name], (err, user) => {
        if (user) {
            res.json({ success: true, user: { id: user.id, name: user.name } });
        } else {
            db.run("INSERT INTO users (name) VALUES (?)", [name], function(err) {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ success: true, user: { id: this.lastID, name } });
            });
        }
    });
});

app.get('/api/words', (req, res) => {
    db.all("SELECT * FROM words", (err, words) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(words);
    });
});

app.get('/api/progress/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT w.*, p.learned
        FROM words w
        LEFT JOIN progress p ON w.id = p.word_id AND p.user_id = ?
    `;
    
    db.all(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// Get words for learning (new words)
app.get('/api/learning/:userId', (req, res) => {
    const { userId } = req.params;
    const limit = req.query.limit || 10;
    
    const query = `
        SELECT w.* FROM words w
        LEFT JOIN progress p ON w.id = p.word_id AND p.user_id = ?
        WHERE p.id IS NULL
        ORDER BY w.id
        LIMIT ?
    `;
    
    db.all(query, [userId, limit], (err, words) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(words);
    });
});

// Get words for review (due for review)
app.get('/api/review/:userId', (req, res) => {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const query = `
        SELECT w.*, p.learning_level, p.last_studied
        FROM words w
        JOIN progress p ON w.id = p.word_id
        WHERE p.user_id = ? AND p.next_review <= ? AND p.learned = 0
        ORDER BY p.next_review
    `;
    
    db.all(query, [userId, today], (err, words) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(words);
    });
});

// Study a word (spaced repetition)
app.post('/api/study', (req, res) => {
    const { userId, wordId, correct } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Spaced repetition intervals (days)
    const intervals = [1, 3, 7, 14, 30, 90, 180];
    
    // Get current progress
    db.get(
        "SELECT * FROM progress WHERE user_id = ? AND word_id = ?",
        [userId, wordId],
        (err, progress) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            let newLevel, nextReview, learned = 0;
            
            if (!progress) {
                // First time studying this word
                newLevel = correct ? 1 : 0;
            } else {
                // Update existing progress
                if (correct) {
                    newLevel = Math.min(progress.learning_level + 1, intervals.length - 1);
                    if (newLevel >= 3) learned = 1; // Mark as learned after level 3
                } else {
                    newLevel = Math.max(0, progress.learning_level - 1);
                }
            }
            
            // Calculate next review date
            const reviewDate = new Date();
            reviewDate.setDate(reviewDate.getDate() + intervals[newLevel]);
            nextReview = reviewDate.toISOString().split('T')[0];
            
            db.run(
                `INSERT OR REPLACE INTO progress 
                 (user_id, word_id, learning_level, last_studied, next_review, learned) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, wordId, newLevel, today, nextReview, learned],
                (err) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    res.json({ 
                        success: true, 
                        level: newLevel, 
                        nextReview, 
                        learned: learned === 1 
                    });
                }
            );
        }
    );
});

// Get user statistics
app.get('/api/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const queries = {
        total: "SELECT COUNT(*) as count FROM words",
        learned: "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND learned = 1",
        studying: "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND learned = 0",
        dueToday: "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND next_review <= ? AND learned = 0"
    };
    
    const stats = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
        const params = key === 'total' ? [] : 
                     key === 'dueToday' ? [userId, today] : [userId];
                     
        db.get(query, params, (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats[key] = result.count;
            completed++;
            
            if (completed === total) {
                res.json(stats);
            }
        });
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Vocabulary App running on port ${PORT}`);
});

// Cleanup
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});