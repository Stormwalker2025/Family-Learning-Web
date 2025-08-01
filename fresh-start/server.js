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

    // User progress
    db.run(`CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        word_id INTEGER,
        learned BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(word_id) REFERENCES words(id)
    )`);

    // Insert sample words
    db.get("SELECT COUNT(*) as count FROM words", (err, row) => {
        if (row.count === 0) {
            const words = [
                ['apple', 'A red or green fruit', 'I eat an apple every day.'],
                ['book', 'Something you read', 'This is a good book.'],
                ['cat', 'A small pet animal', 'The cat is sleeping.'],
                ['dog', 'A friendly pet animal', 'My dog likes to play.'],
                ['house', 'A place where people live', 'We live in a big house.']
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

app.post('/api/learn', (req, res) => {
    const { userId, wordId } = req.body;
    
    db.run(
        "INSERT OR REPLACE INTO progress (user_id, word_id, learned) VALUES (?, ?, 1)",
        [userId, wordId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true });
        }
    );
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