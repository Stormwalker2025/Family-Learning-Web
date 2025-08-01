// Simple English Vocabulary Learning System Server
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting Simple Vocabulary Server...');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes
app.use(express.static('public'));

// Database initialization
const db = new sqlite3.Database('vocabulary.db');

// Create tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Words table
    db.run(`CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        definition TEXT,
        example TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User progress table
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word_id INTEGER NOT NULL,
        learned BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (word_id) REFERENCES words (id),
        UNIQUE(user_id, word_id)
    )`);

    // Insert sample words
    insertSampleWords();
});

// Insert sample words
function insertSampleWords() {
    const sampleWords = [
        { word: 'apple', definition: 'A round fruit with red or green skin', example: 'I eat an apple every day.' },
        { word: 'book', definition: 'A set of written or printed pages', example: 'I read a good book yesterday.' },
        { word: 'cat', definition: 'A small domesticated carnivorous mammal', example: 'The cat is sleeping on the sofa.' },
        { word: 'dog', definition: 'A domesticated carnivorous mammal', example: 'My dog loves to play fetch.' },
        { word: 'house', definition: 'A building for human habitation', example: 'We live in a big house.' }
    ];

    db.get("SELECT COUNT(*) as count FROM words", (err, row) => {
        if (err) {
            console.error('Error checking word count:', err);
            return;
        }
        
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO words (word, definition, example) VALUES (?, ?, ?)");
            
            sampleWords.forEach(wordData => {
                stmt.run([wordData.word, wordData.definition, wordData.example]);
            });
            
            stmt.finalize();
            console.log('✅ Sample words inserted');
        }
    });
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// User login/register (simplified - no password)
app.post('/api/auth/login', (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    console.log('Login request for:', username);
    
    // Check if user exists
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (user) {
            // User exists
            res.json({ user: { id: user.id, username: user.username } });
        } else {
            // Create new user
            db.run("INSERT INTO users (username) VALUES (?)", [username], function(err) {
                if (err) {
                    console.error('Failed to create user:', err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                res.json({ user: { id: this.lastID, username } });
            });
        }
    });
});

// Get all words
app.get('/api/words', (req, res) => {
    db.all("SELECT * FROM words ORDER BY word", (err, words) => {
        if (err) {
            console.error('Error getting words:', err);
            return res.status(500).json({ error: 'Failed to get words' });
        }
        res.json(words);
    });
});

// Get user progress
app.get('/api/progress/:userId', (req, res) => {
    const { userId } = req.params;
    
    const query = `
        SELECT w.*, up.learned
        FROM words w
        LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
        ORDER BY w.word
    `;
    
    db.all(query, [userId], (err, words) => {
        if (err) {
            console.error('Error getting progress:', err);
            return res.status(500).json({ error: 'Failed to get progress' });
        }
        res.json(words);
    });
});

// Mark word as learned
app.post('/api/learn', (req, res) => {
    const { userId, wordId } = req.body;
    
    if (!userId || !wordId) {
        return res.status(400).json({ error: 'Missing userId or wordId' });
    }
    
    db.run(
        "INSERT OR REPLACE INTO user_progress (user_id, word_id, learned) VALUES (?, ?, 1)",
        [userId, wordId],
        function(err) {
            if (err) {
                console.error('Error marking word as learned:', err);
                return res.status(500).json({ error: 'Failed to mark word as learned' });
            }
            res.json({ success: true });
        }
    );
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-simple.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Simple Vocabulary Server running on port ${PORT}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
            process.exit(0);
        });
    });
});

module.exports = app;