const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const upload = multer({ 
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only CSV files
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Database
const db = new sqlite3.Database('vocab.db');

// Initialize database
db.serialize(() => {
    // Enhanced Users table with roles
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT,
        role TEXT DEFAULT 'student',
        grade_level INTEGER,
        daily_target INTEGER DEFAULT 20,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Parent-Student relationships
    db.run(`CREATE TABLE IF NOT EXISTS student_parent (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        parent_id INTEGER,
        FOREIGN KEY(student_id) REFERENCES users(id),
        FOREIGN KEY(parent_id) REFERENCES users(id),
        UNIQUE(student_id, parent_id)
    )`);

    // Enhanced Words table
    db.run(`CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        meaning TEXT NOT NULL,
        example TEXT,
        image_url TEXT,
        audio_url TEXT,
        difficulty_level INTEGER DEFAULT 1,
        grade_level INTEGER DEFAULT 1,
        subject TEXT DEFAULT 'english',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Assignments table for homework
    db.run(`CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        creator_id INTEGER,
        target_students TEXT,
        due_date DATETIME,
        max_score INTEGER DEFAULT 100,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(creator_id) REFERENCES users(id)
    )`);

    // Questions table for homework and practice
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        options TEXT,
        points INTEGER DEFAULT 1,
        explanation TEXT,
        math_formula TEXT,
        tolerance REAL DEFAULT 0.01,
        case_sensitive BOOLEAN DEFAULT 0,
        exact_match BOOLEAN DEFAULT 0,
        FOREIGN KEY(assignment_id) REFERENCES assignments(id)
    )`);

    // Student submissions for assignments
    db.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER,
        student_id INTEGER,
        answers TEXT,
        score INTEGER,
        max_score INTEGER,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        graded_at DATETIME,
        graded_by INTEGER,
        FOREIGN KEY(assignment_id) REFERENCES assignments(id),
        FOREIGN KEY(student_id) REFERENCES users(id),
        FOREIGN KEY(graded_by) REFERENCES users(id),
        UNIQUE(assignment_id, student_id)
    )`);

    // Wrong answers for error notebook
    db.run(`CREATE TABLE IF NOT EXISTS wrong_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        question_id INTEGER,
        word_id INTEGER,
        incorrect_answer TEXT,
        correct_answer TEXT,
        mastered BOOLEAN DEFAULT 0,
        attempts INTEGER DEFAULT 1,
        last_attempted DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id),
        FOREIGN KEY(question_id) REFERENCES questions(id),
        FOREIGN KEY(word_id) REFERENCES words(id)
    )`);

    // Enhanced User progress with spaced repetition
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

    // iPad App Rewards table
    db.run(`CREATE TABLE IF NOT EXISTS ipad_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        app_store_id TEXT,
        category TEXT DEFAULT 'educational',
        unlock_requirement TEXT NOT NULL,
        unlock_value INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User App Unlocks table
    db.run(`CREATE TABLE IF NOT EXISTS user_app_unlocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        app_id INTEGER,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        access_duration INTEGER DEFAULT 30,
        expires_at DATETIME,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(app_id) REFERENCES ipad_apps(id),
        UNIQUE(user_id, app_id)
    )`);

    // Achievements table
    db.run(`CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        category TEXT DEFAULT 'learning',
        requirement_type TEXT NOT NULL,
        requirement_value INTEGER NOT NULL,
        reward_type TEXT DEFAULT 'app_unlock',
        reward_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User Achievements table
    db.run(`CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        achievement_id INTEGER,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        progress INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(achievement_id) REFERENCES achievements(id),
        UNIQUE(user_id, achievement_id)
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

    // Insert sample iPad apps
    db.get("SELECT COUNT(*) as count FROM ipad_apps", (err, row) => {
        if (row.count === 0) {
            const apps = [
                ['Minecraft Education', 'Build and learn with blocks', '🎮', 'minecraft_edu', 'creative', 'words_learned', 10],
                ['Swift Playgrounds', 'Learn coding with Swift', '💻', 'swift_playgrounds', 'programming', 'words_learned', 25],
                ['GarageBand', 'Create music and sounds', '🎵', 'garageband', 'creative', 'daily_streak', 7],
                ['Procreate', 'Digital art and illustration', '🎨', 'procreate', 'creative', 'assignments_completed', 3],
                ['Khan Academy Kids', 'Educational games and videos', '📚', 'khan_academy_kids', 'educational', 'words_learned', 50],
                ['Duolingo', 'Language learning games', '🦜', 'duolingo', 'educational', 'perfect_scores', 5],
                ['Scratch Jr', 'Programming for kids', '🐱', 'scratchjr', 'programming', 'words_learned', 15],
                ['Toca Boca World', 'Creative play and storytelling', '🏠', 'toca_boca_world', 'creative', 'daily_streak', 5]
            ];
            
            const stmt = db.prepare("INSERT INTO ipad_apps (name, description, icon_url, app_store_id, category, unlock_requirement, unlock_value) VALUES (?, ?, ?, ?, ?, ?, ?)");
            apps.forEach(app => stmt.run(app));
            stmt.finalize();
            console.log('✅ Sample iPad apps added');
        }
    });

    // Insert sample achievements
    db.get("SELECT COUNT(*) as count FROM achievements", (err, row) => {
        if (row.count === 0) {
            const achievements = [
                ['First Steps', 'Learn your first 5 words', '🌟', 'learning', 'words_learned', 5, 'app_unlock', '7'],
                ['Word Master', 'Master 25 vocabulary words', '👑', 'learning', 'words_learned', 25, 'app_unlock', '1'],
                ['Streak Champion', 'Study for 7 consecutive days', '🔥', 'consistency', 'daily_streak', 7, 'app_unlock', '3'],
                ['Perfect Student', 'Score 100% on 5 assignments', '💯', 'performance', 'perfect_scores', 5, 'app_unlock', '6'],
                ['Vocabulary Scholar', 'Learn 50 words total', '📖', 'learning', 'words_learned', 50, 'app_unlock', '5'],
                ['Homework Hero', 'Complete 10 assignments', '📝', 'assignments', 'assignments_completed', 10, 'app_unlock', '2'],
                ['Speed Learner', 'Learn 10 words in one day', '⚡', 'learning', 'words_per_day', 10, 'app_unlock', '8'],
                ['Consistency King', 'Study for 30 consecutive days', '🏆', 'consistency', 'daily_streak', 30, 'app_unlock', '4']
            ];
            
            const stmt = db.prepare("INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, reward_type, reward_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            achievements.forEach(achievement => stmt.run(achievement));
            stmt.finalize();
            console.log('✅ Sample achievements added');
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

// Predefined accounts with enhanced roles
const ACCOUNTS = {
    'Michael': { 
        password: '123456', 
        role: 'student', 
        gradeLevel: 8, 
        dailyTarget: 20,
        email: 'michael@example.com'
    },
    'August': { 
        password: '654321', 
        role: 'student', 
        gradeLevel: 6, 
        dailyTarget: 15,
        email: 'august@example.com'
    },
    'Dan': { 
        password: 'Kappa2004', 
        role: 'parent_admin', 
        gradeLevel: null, 
        dailyTarget: 0,
        email: 'dan@example.com'
    },
    'Grace': { 
        password: 'Kappa2025', 
        role: 'parent', 
        gradeLevel: null, 
        dailyTarget: 0,
        email: 'grace@example.com'
    }
};

// Define parent-student relationships
const FAMILY_RELATIONSHIPS = {
    'Grace': ['Michael'],  // Grace is parent of Michael
    'Dan': ['August']      // Dan is parent of August and also admin
};

app.post('/api/login', (req, res) => {
    const { name, password } = req.body;
    
    if (!name || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    // Check if account exists and password matches
    if (!ACCOUNTS[name] || ACCOUNTS[name].password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const accountInfo = ACCOUNTS[name];

    // Check if user exists in database
    db.get("SELECT * FROM users WHERE name = ?", [name], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (user) {
            // Get related students if user is a parent
            if (accountInfo.role === 'parent' || accountInfo.role === 'parent_admin') {
                const children = FAMILY_RELATIONSHIPS[name] || [];
                const childrenIds = [];
                
                // Get children IDs
                let completed = 0;
                if (children.length === 0) {
                    sendResponse();
                } else {
                    children.forEach(childName => {
                        db.get("SELECT id, name FROM users WHERE name = ?", [childName], (err, child) => {
                            if (child) {
                                childrenIds.push({ id: child.id, name: child.name });
                            }
                            completed++;
                            if (completed === children.length) {
                                sendResponse();
                            }
                        });
                    });
                }
                
                function sendResponse() {
                    res.json({ 
                        success: true, 
                        user: { 
                            id: user.id, 
                            name: user.name,
                            role: user.role || accountInfo.role,
                            gradeLevel: user.grade_level,
                            dailyTarget: user.daily_target || accountInfo.dailyTarget,
                            email: user.email || accountInfo.email,
                            children: childrenIds
                        } 
                    });
                }
            } else {
                res.json({ 
                    success: true, 
                    user: { 
                        id: user.id, 
                        name: user.name,
                        role: user.role || accountInfo.role,
                        gradeLevel: user.grade_level,
                        dailyTarget: user.daily_target || accountInfo.dailyTarget,
                        email: user.email || accountInfo.email
                    } 
                });
            }
        } else {
            // Create new user in database
            db.run(`INSERT INTO users (name, role, grade_level, daily_target, email) VALUES (?, ?, ?, ?, ?)`, 
                [name, accountInfo.role, accountInfo.gradeLevel, accountInfo.dailyTarget, accountInfo.email], 
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    // Insert family relationships if this is a student
                    if (accountInfo.role === 'student') {
                        const parentName = Object.keys(FAMILY_RELATIONSHIPS).find(parent => 
                            FAMILY_RELATIONSHIPS[parent].includes(name)
                        );
                        
                        if (parentName) {
                            db.get("SELECT id FROM users WHERE name = ?", [parentName], (err, parent) => {
                                if (parent) {
                                    db.run("INSERT OR IGNORE INTO student_parent (student_id, parent_id) VALUES (?, ?)", 
                                        [this.lastID, parent.id]);
                                }
                            });
                        }
                    }
                    
                    res.json({ 
                        success: true, 
                        user: { 
                            id: this.lastID, 
                            name,
                            role: accountInfo.role,
                            gradeLevel: accountInfo.gradeLevel,
                            dailyTarget: accountInfo.dailyTarget,
                            email: accountInfo.email
                        } 
                    });
                }
            );
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
                    
                    const result = { 
                        success: true, 
                        level: newLevel, 
                        nextReview, 
                        learned: learned === 1 
                    };
                    
                    // Check for achievements after successful study
                    checkAndUnlockAchievements(userId, (error, newAchievements) => {
                        if (!error && newAchievements.length > 0) {
                            result.newAchievements = newAchievements;
                        }
                        res.json(result);
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
        dueToday: "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND next_review <= ? AND learned = 0",
        todayStudied: "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND DATE(last_studied) = ?"
    };
    
    const stats = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
        let params;
        if (key === 'total') {
            params = [];
        } else if (key === 'dueToday' || key === 'todayStudied') {
            params = [userId, today];
        } else {
            params = [userId];
        }
                     
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

// Assignment Management APIs

// Create assignment (for parents/teachers)
app.post('/api/assignments', (req, res) => {
    const { title, description, questions, targetStudents, dueDate, creatorId } = req.body;
    
    if (!title || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Title and questions are required' });
    }
    
    // Insert assignment
    db.run(`INSERT INTO assignments (title, description, creator_id, target_students, due_date) VALUES (?, ?, ?, ?, ?)`,
        [title, description, creatorId, JSON.stringify(targetStudents), dueDate],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error creating assignment' });
            }
            
            const assignmentId = this.lastID;
            
            // Insert questions
            let questionCount = 0;
            questions.forEach((question, index) => {
                db.run(`INSERT INTO questions (assignment_id, question_text, question_type, correct_answer, options, points, explanation, math_formula, tolerance, case_sensitive, exact_match) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [assignmentId, question.text, question.type, question.correctAnswer, 
                     JSON.stringify(question.options), question.points || 1, question.explanation,
                     question.mathFormula || '', question.tolerance || 0.01, 
                     question.caseSensitive ? 1 : 0, question.exactMatch ? 1 : 0],
                    (err) => {
                        if (err) console.error('Error inserting question:', err);
                        questionCount++;
                        if (questionCount === questions.length) {
                            res.json({ success: true, assignmentId: assignmentId });
                        }
                    }
                );
            });
        }
    );
});

// Get assignments for a student
app.get('/api/assignments/student/:studentId', (req, res) => {
    const { studentId } = req.params;
    
    db.all(`SELECT a.*, 
                (SELECT COUNT(*) FROM questions WHERE assignment_id = a.id) as question_count,
                s.score, s.submitted_at
            FROM assignments a
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
            WHERE a.target_students LIKE ? OR a.target_students = '[]'
            ORDER BY a.created_at DESC`,
        [studentId, `%"${studentId}"%`],
        (err, assignments) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(assignments.map(a => ({
                ...a,
                target_students: JSON.parse(a.target_students || '[]'),
                isCompleted: a.submitted_at !== null
            })));
        }
    );
});

// Get assignments created by a parent/teacher
app.get('/api/assignments/creator/:creatorId', (req, res) => {
    const { creatorId } = req.params;
    
    db.all(`SELECT a.*, 
                (SELECT COUNT(*) FROM questions WHERE assignment_id = a.id) as question_count,
                (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
            FROM assignments a
            WHERE a.creator_id = ?
            ORDER BY a.created_at DESC`,
        [creatorId],
        (err, assignments) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(assignments.map(a => ({
                ...a,
                target_students: JSON.parse(a.target_students || '[]')
            })));
        }
    );
});

// Get assignment details with questions
app.get('/api/assignments/:assignmentId', (req, res) => {
    const { assignmentId } = req.params;
    
    db.get(`SELECT * FROM assignments WHERE id = ?`, [assignmentId], (err, assignment) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        
        db.all(`SELECT * FROM questions WHERE assignment_id = ? ORDER BY id`, [assignmentId], (err, questions) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            res.json({
                ...assignment,
                target_students: JSON.parse(assignment.target_students || '[]'),
                questions: questions.map(q => ({
                    ...q,
                    options: JSON.parse(q.options || '[]')
                }))
            });
        });
    });
});

// Submit assignment
app.post('/api/assignments/:assignmentId/submit', (req, res) => {
    const { assignmentId } = req.params;
    const { studentId, answers } = req.body;
    
    // Get assignment questions
    db.all(`SELECT * FROM questions WHERE assignment_id = ?`, [assignmentId], (err, questions) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        // Calculate score with enhanced grading system
        let score = 0;
        let maxScore = 0;
        const wrongAnswers = [];
        
        questions.forEach((question, index) => {
            maxScore += question.points;
            const studentAnswer = answers[index];
            const correctAnswer = question.correct_answer;
            const isCorrect = evaluateAnswer(question, studentAnswer, correctAnswer);
            
            if (isCorrect) {
                score += question.points;
            } else {
                wrongAnswers.push({
                    questionId: question.id,
                    studentAnswer,
                    correctAnswer,
                    questionText: question.question_text
                });
            }
        });
        
        // Insert submission
        db.run(`INSERT OR REPLACE INTO submissions (assignment_id, student_id, answers, score, max_score) 
                VALUES (?, ?, ?, ?, ?)`,
            [assignmentId, studentId, JSON.stringify(answers), score, maxScore],
            function(err) {
                if (err) return res.status(500).json({ error: 'Database error' });
                
                // Insert wrong answers into error notebook
                wrongAnswers.forEach(wa => {
                    db.run(`INSERT OR REPLACE INTO wrong_answers 
                            (student_id, question_id, incorrect_answer, correct_answer) 
                            VALUES (?, ?, ?, ?)`,
                        [studentId, wa.questionId, wa.studentAnswer, wa.correctAnswer]
                    );
                });
                
                res.json({ 
                    success: true, 
                    score: score, 
                    maxScore: maxScore,
                    percentage: Math.round((score / maxScore) * 100),
                    wrongAnswers: wrongAnswers
                });
            }
        );
    });
});

// Error notebook APIs

// Get student's wrong answers
app.get('/api/errors/:studentId', (req, res) => {
    const { studentId } = req.params;
    
    db.all(`SELECT wa.*, q.question_text, q.question_type, q.options
            FROM wrong_answers wa
            LEFT JOIN questions q ON wa.question_id = q.id
            WHERE wa.student_id = ? AND wa.mastered = 0
            ORDER BY wa.last_attempted DESC`,
        [studentId],
        (err, errors) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(errors.map(e => ({
                ...e,
                options: e.options ? JSON.parse(e.options) : []
            })));
        }
    );
});

// Practice wrong answers
app.post('/api/errors/practice', (req, res) => {
    const { studentId, answers } = req.body;
    
    let processed = 0;
    const results = [];
    
    Object.keys(answers).forEach(errorId => {
        const studentAnswer = answers[errorId];
        
        db.get(`SELECT * FROM wrong_answers WHERE id = ?`, [errorId], (err, error) => {
            if (err) {
                processed++;
                return;
            }
            
            const isCorrect = studentAnswer.toLowerCase().trim() === error.correct_answer.toLowerCase().trim();
            
            if (isCorrect) {
                // Mark as mastered if correct
                db.run(`UPDATE wrong_answers SET mastered = 1, attempts = attempts + 1, last_attempted = CURRENT_TIMESTAMP WHERE id = ?`, 
                    [errorId]);
            } else {
                // Update attempts
                db.run(`UPDATE wrong_answers SET attempts = attempts + 1, last_attempted = CURRENT_TIMESTAMP WHERE id = ?`, 
                    [errorId]);
            }
            
            results.push({
                errorId: errorId,
                correct: isCorrect,
                correctAnswer: error.correct_answer
            });
            
            processed++;
            if (processed === Object.keys(answers).length) {
                res.json({ success: true, results: results });
            }
        });
    });
});

// CSV Import APIs

// Import vocabulary from CSV
app.post('/api/import/vocabulary', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const filePath = req.file.path;
    
    try {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const rows = csvData.split('\n').map(row => row.trim()).filter(row => row);
        
        if (rows.length < 2) {
            return res.status(400).json({ error: 'CSV file must contain at least a header row and one data row' });
        }
        
        const header = rows[0].split(',').map(col => col.trim().toLowerCase());
        const requiredColumns = ['word', 'meaning'];
        const missingColumns = requiredColumns.filter(col => !header.includes(col));
        
        if (missingColumns.length > 0) {
            return res.status(400).json({ 
                error: `Missing required columns: ${missingColumns.join(', ')}. Required: word, meaning. Optional: example, difficulty_level, grade_level, subject` 
            });
        }
        
        const wordIndex = header.indexOf('word');
        const meaningIndex = header.indexOf('meaning');
        const exampleIndex = header.indexOf('example');
        const difficultyIndex = header.indexOf('difficulty_level');
        const gradeLevelIndex = header.indexOf('grade_level');
        const subjectIndex = header.indexOf('subject');
        
        let importedCount = 0;
        let errors = [];
        
        // Process each data row
        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',').map(col => col.trim().replace(/^"|"$/g, '')); // Remove quotes
            
            if (columns.length < requiredColumns.length) {
                errors.push(`Row ${i + 1}: Insufficient columns`);
                continue;
            }
            
            const word = columns[wordIndex];
            const meaning = columns[meaningIndex];
            const example = exampleIndex >= 0 ? columns[exampleIndex] : '';
            const difficultyLevel = difficultyIndex >= 0 ? parseInt(columns[difficultyIndex]) || 1 : 1;
            const gradeLevel = gradeLevelIndex >= 0 ? parseInt(columns[gradeLevelIndex]) || 1 : 1;
            const subject = subjectIndex >= 0 ? columns[subjectIndex] : 'english';
            
            if (!word || !meaning) {
                errors.push(`Row ${i + 1}: Word and meaning are required`);
                continue;
            }
            
            try {
                db.run(
                    `INSERT OR REPLACE INTO words (word, meaning, example, difficulty_level, grade_level, subject) VALUES (?, ?, ?, ?, ?, ?)`,
                    [word, meaning, example, difficultyLevel, gradeLevel, subject],
                    function(err) {
                        if (err) {
                            errors.push(`Row ${i + 1}: Database error - ${err.message}`);
                        } else {
                            importedCount++;
                        }
                    }
                );
            } catch (error) {
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        setTimeout(() => {
            res.json({
                success: true,
                imported: importedCount,
                total: rows.length - 1,
                errors: errors
            });
        }, 500); // Give database operations time to complete
        
    } catch (error) {
        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.status(500).json({ error: 'Failed to process CSV file: ' + error.message });
    }
});

// Import questions/assignments from CSV
app.post('/api/import/questions', upload.single('csvFile'), (req, res) => {
    const { assignmentId } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
    }
    
    if (!assignmentId) {
        return res.status(400).json({ error: 'Assignment ID is required' });
    }

    const filePath = req.file.path;
    
    try {
        const csvData = fs.readFileSync(filePath, 'utf8');
        const rows = csvData.split('\n').map(row => row.trim()).filter(row => row);
        
        if (rows.length < 2) {
            return res.status(400).json({ error: 'CSV file must contain at least a header row and one data row' });
        }
        
        const header = rows[0].split(',').map(col => col.trim().toLowerCase());
        const requiredColumns = ['question_text', 'question_type', 'correct_answer'];
        const missingColumns = requiredColumns.filter(col => !header.includes(col));
        
        if (missingColumns.length > 0) {
            return res.status(400).json({ 
                error: `Missing required columns: ${missingColumns.join(', ')}. Required: question_text, question_type, correct_answer. Optional: options, points, explanation, math_formula, tolerance` 
            });
        }
        
        const questionTextIndex = header.indexOf('question_text');
        const questionTypeIndex = header.indexOf('question_type');
        const correctAnswerIndex = header.indexOf('correct_answer');
        const optionsIndex = header.indexOf('options');
        const pointsIndex = header.indexOf('points');
        const explanationIndex = header.indexOf('explanation');
        const mathFormulaIndex = header.indexOf('math_formula');
        const toleranceIndex = header.indexOf('tolerance');
        
        let importedCount = 0;
        let errors = [];
        
        // Process each data row
        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',').map(col => col.trim().replace(/^"|"$/g, '')); // Remove quotes
            
            if (columns.length < requiredColumns.length) {
                errors.push(`Row ${i + 1}: Insufficient columns`);
                continue;
            }
            
            const questionText = columns[questionTextIndex];
            const questionType = columns[questionTypeIndex];
            const correctAnswer = columns[correctAnswerIndex];
            const options = optionsIndex >= 0 ? columns[optionsIndex] : '';
            const points = pointsIndex >= 0 ? parseInt(columns[pointsIndex]) || 1 : 1;
            const explanation = explanationIndex >= 0 ? columns[explanationIndex] : '';
            const mathFormula = mathFormulaIndex >= 0 ? columns[mathFormulaIndex] : '';
            const tolerance = toleranceIndex >= 0 ? parseFloat(columns[toleranceIndex]) || 0.01 : 0.01;
            
            if (!questionText || !questionType || !correctAnswer) {
                errors.push(`Row ${i + 1}: Question text, type, and correct answer are required`);
                continue;
            }
            
            // Parse options if provided
            let parsedOptions = [];
            if (options) {
                parsedOptions = options.split('|').map(opt => opt.trim()).filter(opt => opt);
            }
            
            try {
                db.run(
                    `INSERT INTO questions (assignment_id, question_text, question_type, correct_answer, options, points, explanation, math_formula, tolerance) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [assignmentId, questionText, questionType, correctAnswer, JSON.stringify(parsedOptions), points, explanation, mathFormula, tolerance],
                    function(err) {
                        if (err) {
                            errors.push(`Row ${i + 1}: Database error - ${err.message}`);
                        } else {
                            importedCount++;
                        }
                    }
                );
            } catch (error) {
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        setTimeout(() => {
            res.json({
                success: true,
                imported: importedCount,
                total: rows.length - 1,
                errors: errors
            });
        }, 500); // Give database operations time to complete
        
    } catch (error) {
        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.status(500).json({ error: 'Failed to process CSV file: ' + error.message });
    }
});

// Get sample CSV templates
app.get('/api/csv-templates/:type', (req, res) => {
    const { type } = req.params;
    
    let csvContent = '';
    let filename = '';
    
    if (type === 'vocabulary') {
        csvContent = `word,meaning,example,difficulty_level,grade_level,subject
apple,A red or green fruit,I eat an apple every day.,1,1,english
beautiful,Very pretty or attractive,The flowers are beautiful.,2,3,english
mathematics,The study of numbers and calculations,Mathematics is my favorite subject.,3,8,math`;
        filename = 'vocabulary_template.csv';
    } else if (type === 'questions') {
        csvContent = `question_text,question_type,correct_answer,options,points,explanation,math_formula,tolerance
What is the capital of France?,multiple_choice,Paris,London|Paris|Berlin|Madrid,1,Paris is the capital and largest city of France.,,
Solve: 2 + 3 = ?,numeric,5,,1,Basic addition problem,,0.01
What is the past tense of 'go'?,fill_blank,went,,1,The past tense of 'go' is 'went',,
Evaluate: x² when x = 3,math_expression,9,,2,Substitute x = 3 into x²,x²,0.01`;
        filename = 'questions_template.csv';
    } else {
        return res.status(400).json({ error: 'Invalid template type. Use "vocabulary" or "questions".' });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
});

// iPad App Rewards APIs

// Get available apps and user unlocks
app.get('/api/rewards/apps/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.all(`
        SELECT a.*, 
               ua.unlocked_at, 
               ua.expires_at,
               CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as is_unlocked,
               CASE WHEN ua.expires_at IS NULL OR ua.expires_at > datetime('now') THEN 1 ELSE 0 END as is_active
        FROM ipad_apps a
        LEFT JOIN user_app_unlocks ua ON a.id = ua.app_id AND ua.user_id = ?
        ORDER BY a.category, a.name
    `, [userId], (err, apps) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(apps);
    });
});

// Get user achievements
app.get('/api/rewards/achievements/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.all(`
        SELECT a.*, 
               ua.earned_at, 
               ua.progress,
               CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as is_earned
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY a.category, a.requirement_value
    `, [userId], (err, achievements) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(achievements);
    });
});

// Check and unlock achievements
app.post('/api/rewards/check-achievements', (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    checkAndUnlockAchievements(userId, (error, unlockedAchievements) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to check achievements' });
        }
        res.json({ 
            success: true, 
            newAchievements: unlockedAchievements,
            count: unlockedAchievements.length 
        });
    });
});

// Unlock app access
app.post('/api/rewards/unlock-app', (req, res) => {
    const { userId, appId, duration = 30 } = req.body;
    
    if (!userId || !appId) {
        return res.status(400).json({ error: 'User ID and App ID are required' });
    }
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + duration);
    
    db.run(`
        INSERT OR REPLACE INTO user_app_unlocks (user_id, app_id, access_duration, expires_at)
        VALUES (?, ?, ?, ?)
    `, [userId, appId, duration, expiresAt.toISOString()], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        res.json({ 
            success: true, 
            unlockId: this.lastID,
            expiresAt: expiresAt.toISOString()
        });
    });
});

// Get app unlock status
app.get('/api/rewards/unlock-status/:userId/:appId', (req, res) => {
    const { userId, appId } = req.params;
    
    db.get(`
        SELECT *, 
               CASE WHEN expires_at IS NULL OR expires_at > datetime('now') THEN 1 ELSE 0 END as is_active,
               CASE WHEN expires_at IS NOT NULL THEN 
                   CAST((julianday(expires_at) - julianday('now')) * 24 * 60 AS INTEGER)
               ELSE NULL END as minutes_remaining
        FROM user_app_unlocks 
        WHERE user_id = ? AND app_id = ?
    `, [userId, appId], (err, unlock) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (!unlock) {
            return res.json({ unlocked: false });
        }
        
        res.json({
            unlocked: true,
            active: unlock.is_active === 1,
            expiresAt: unlock.expires_at,
            minutesRemaining: unlock.minutes_remaining
        });
    });
});

// Data Analytics APIs

// Get comprehensive user analytics
app.get('/api/analytics/user/:userId', (req, res) => {
    const { userId } = req.params;
    const { period = '30' } = req.query; // days
    
    const analytics = {};
    let completed = 0;
    const totalQueries = 7;
    
    // Learning progress over time
    db.all(`
        SELECT DATE(created_at) as date, COUNT(*) as words_learned
        FROM progress 
        WHERE user_id = ? AND created_at >= DATE('now', '-${period} days')
        GROUP BY DATE(created_at)
        ORDER BY date
    `, [userId], (err, learningProgress) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        analytics.learningProgress = learningProgress;
        completed++;
        if (completed === totalQueries) res.json(analytics);
    });
    
    // Study sessions per day
    db.all(`
        SELECT DATE(last_studied) as date, COUNT(*) as sessions
        FROM progress 
        WHERE user_id = ? AND last_studied >= DATE('now', '-${period} days')
        GROUP BY DATE(last_studied)
        ORDER BY date
    `, [userId], (err, studySessions) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        analytics.studySessions = studySessions;
        completed++;
        if (completed === totalQueries) res.json(analytics);
    });
    
    // Assignment performance
    db.all(`
        SELECT s.*, a.title, a.max_score,
               ROUND((s.score * 100.0 / s.max_score), 2) as percentage
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        WHERE s.student_id = ? AND s.submitted_at >= DATE('now', '-${period} days')
        ORDER BY s.submitted_at DESC
    `, [userId], (err, assignmentPerformance) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        analytics.assignmentPerformance = assignmentPerformance;
        completed++;
        if (completed === totalQueries) res.json(analytics);
    });
    
    // Most difficult words (frequently wrong)
    db.all(`
        SELECT w.word, w.meaning, COUNT(*) as error_count
        FROM wrong_answers wa
        JOIN words w ON wa.word_id = w.id
        WHERE wa.student_id = ? AND wa.last_attempted >= DATE('now', '-${period} days')
        GROUP BY w.id
        ORDER BY error_count DESC
        LIMIT 10
    `, [userId], (err, difficultWords) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        analytics.difficultWords = difficultWords;
        completed++;
        if (completed === totalQueries) res.json(analytics);
    });
    
    // Learning streak calculation
    db.all(`
        SELECT DISTINCT DATE(last_studied) as study_date
        FROM progress 
        WHERE user_id = ? AND last_studied IS NOT NULL
        ORDER BY study_date DESC
        LIMIT 30
    `, [userId], (err, streakData) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        // Calculate streak
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        
        if (streakData.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            let checkDate = new Date(today);
            
            for (let i = 0; i < streakData.length; i++) {
                const studyDate = streakData[i].study_date;
                const expectedDate = checkDate.toISOString().split('T')[0];
                
                if (studyDate === expectedDate) {
                    tempStreak++;
                    if (i === 0) currentStreak = tempStreak;
                    maxStreak = Math.max(maxStreak, tempStreak);
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    if (i === 0) currentStreak = 0;
                    tempStreak = 0;
                    break;
                }
            }
        }
        
        analytics.streakInfo = {
            currentStreak,
            maxStreak,
            totalStudyDays: streakData.length
        };
        completed++;
        if (completed === totalQueries) res.json(analytics);
    });
    
    // Subject/category performance
    db.all(`
        SELECT w.subject, 
               COUNT(*) as total_words,
               SUM(CASE WHEN p.learned = 1 THEN 1 ELSE 0 END) as mastered_words,
               AVG(p.learning_level) as avg_level
        FROM words w
        LEFT JOIN progress p ON w.id = p.word_id AND p.user_id = ?
        GROUP BY w.subject
    `, [userId], (err, subjectPerformance) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        analytics.subjectPerformance = subjectPerformance;
        completed++;
        if (completed === totalQueries) res.json(analytics);
    });
    
    // Time-based learning patterns
    db.all(`
        SELECT 
            strftime('%H', last_studied) as hour,
            COUNT(*) as study_count
        FROM progress 
        WHERE user_id = ? AND last_studied >= DATE('now', '-${period} days')
        GROUP BY strftime('%H', last_studied)
        ORDER BY hour
    `, [userId], (err, timePatterns) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        analytics.timePatterns = timePatterns;
        completed++;
        if (completed === totalQueries) res.json(analytics);
    });
});

// Get class/group analytics (for teachers)
app.get('/api/analytics/class/:teacherId', (req, res) => {
    const { teacherId } = req.params;
    
    // Get all students taught by this teacher (through assignments)
    db.all(`
        SELECT DISTINCT s.student_id, u.name
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN users u ON s.student_id = u.id
        WHERE a.creator_id = ?
    `, [teacherId], (err, students) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (students.length === 0) {
            return res.json({ students: [], classPerformance: [] });
        }
        
        const studentIds = students.map(s => s.student_id);
        const placeholders = studentIds.map(() => '?').join(',');
        
        // Get class performance summary
        db.all(`
            SELECT u.name, u.grade_level,
                   COUNT(DISTINCT p.word_id) as words_learned,
                   AVG(s.score * 100.0 / s.max_score) as avg_score,
                   COUNT(DISTINCT s.assignment_id) as assignments_completed
            FROM users u
            LEFT JOIN progress p ON u.id = p.user_id AND p.learned = 1
            LEFT JOIN submissions s ON u.id = s.student_id
            WHERE u.id IN (${placeholders})
            GROUP BY u.id, u.name, u.grade_level
            ORDER BY u.name
        `, studentIds, (err, classPerformance) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            res.json({
                students: students,
                classPerformance: classPerformance
            });
        });
    });
});

// Generate detailed report
app.post('/api/analytics/report', (req, res) => {
    const { userId, reportType, dateRange } = req.body;
    
    // This would generate a comprehensive report
    // For now, return a summary
    const report = {
        generated: new Date().toISOString(),
        reportType: reportType,
        period: dateRange,
        userId: userId,
        sections: [
            'Learning Progress Summary',
            'Achievement Analysis',
            'Performance Trends',
            'Recommendations'
        ]
    };
    
    res.json({
        success: true,
        report: report,
        downloadUrl: `/api/analytics/report/${userId}/download`
    });
});

// Enhanced Answer Evaluation System
function evaluateAnswer(question, studentAnswer, correctAnswer) {
    if (!studentAnswer || studentAnswer.toString().trim() === '') {
        return false;
    }
    
    const student = studentAnswer.toString().trim();
    const correct = correctAnswer.toString().trim();
    
    switch (question.question_type) {
        case 'multiple_choice':
            return student === correct;
            
        case 'fill_blank':
            if (question.exact_match) {
                return student === correct;
            } else if (question.case_sensitive) {
                return student === correct;
            } else {
                return student.toLowerCase() === correct.toLowerCase();
            }
            
        case 'short_answer':
            return evaluateShortAnswer(student, correct, question);
            
        case 'math_expression':
            return evaluateMathExpression(student, correct, question);
            
        case 'numeric':
            return evaluateNumericAnswer(student, correct, question);
            
        case 'true_false':
            return student.toLowerCase() === correct.toLowerCase();
            
        default:
            // Fallback to case-insensitive comparison
            return student.toLowerCase() === correct.toLowerCase();
    }
}

function evaluateShortAnswer(student, correct, question) {
    // Remove extra whitespace and normalize
    const normalizeText = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();
    
    const normalizedStudent = normalizeText(student);
    const normalizedCorrect = normalizeText(correct);
    
    // Exact match after normalization
    if (normalizedStudent === normalizedCorrect) {
        return true;
    }
    
    // Check if answer contains key words (for partial credit consideration)
    const correctWords = normalizedCorrect.split(' ');
    const studentWords = normalizedStudent.split(' ');
    
    // Calculate word overlap (simple fuzzy matching)
    const overlap = correctWords.filter(word => 
        studentWords.some(studentWord => 
            studentWord.includes(word) || word.includes(studentWord)
        )
    ).length;
    
    // If more than 70% of key words match, consider it correct
    return overlap / correctWords.length >= 0.7;
}

function evaluateMathExpression(student, correct, question) {
    try {
        // Remove spaces and normalize mathematical expressions
        const normalizeExpression = (expr) => {
            return expr.replace(/\s+/g, '')
                      .replace(/\*\*/g, '^')  // Convert ** to ^
                      .replace(/\×/g, '*')    // Convert × to *
                      .replace(/\÷/g, '/')    // Convert ÷ to /
                      .toLowerCase();
        };
        
        const normalizedStudent = normalizeExpression(student);
        const normalizedCorrect = normalizeExpression(correct);
        
        // Direct string comparison first
        if (normalizedStudent === normalizedCorrect) {
            return true;
        }
        
        // Try to evaluate mathematical expressions if they're numeric
        const studentResult = evaluateSimpleMath(normalizedStudent);
        const correctResult = evaluateSimpleMath(normalizedCorrect);
        
        if (studentResult !== null && correctResult !== null) {
            const tolerance = question.tolerance || 0.01;
            return Math.abs(studentResult - correctResult) <= tolerance;
        }
        
        return false;
    } catch (error) {
        console.error('Math evaluation error:', error);
        return false;
    }
}

function evaluateNumericAnswer(student, correct, question) {
    try {
        const studentNum = parseFloat(student);
        const correctNum = parseFloat(correct);
        
        if (isNaN(studentNum) || isNaN(correctNum)) {
            return false;
        }
        
        const tolerance = question.tolerance || 0.01;
        return Math.abs(studentNum - correctNum) <= tolerance;
    } catch (error) {
        return false;
    }
}

function evaluateSimpleMath(expression) {
    try {
        // Basic safety check - only allow numbers, operators, and parentheses
        if (!/^[0-9+\-*/().^√π\s]+$/.test(expression)) {
            return null;
        }
        
        // Replace common mathematical symbols
        let safeExpr = expression
            .replace(/π/g, Math.PI.toString())
            .replace(/\^/g, '**')
            .replace(/√(\d+)/g, 'Math.sqrt($1)');
        
        // Simple eval for basic mathematical expressions
        // Note: In production, consider using a safer math parser
        return Function('"use strict"; return (' + safeExpr + ')')();
    } catch (error) {
        return null;
    }
}

// Achievement checking and unlocking system
function checkAndUnlockAchievements(userId, callback) {
    // Get all achievements that the user hasn't earned yet
    db.all(`
        SELECT a.* FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        WHERE ua.id IS NULL
    `, [userId], (err, achievements) => {
        if (err) return callback(err, []);
        
        const unlockedAchievements = [];
        let processed = 0;
        
        if (achievements.length === 0) {
            return callback(null, []);
        }
        
        achievements.forEach(achievement => {
            checkAchievementRequirement(userId, achievement, (meetsRequirement) => {
                if (meetsRequirement) {
                    // Award the achievement
                    db.run(`
                        INSERT INTO user_achievements (user_id, achievement_id, progress)
                        VALUES (?, ?, ?)
                    `, [userId, achievement.id, achievement.requirement_value], function(awardErr) {
                        if (!awardErr) {
                            unlockedAchievements.push(achievement);
                            
                            // Process the reward if it's an app unlock
                            if (achievement.reward_type === 'app_unlock' && achievement.reward_value) {
                                const appId = parseInt(achievement.reward_value);
                                const duration = 30; // 30 minutes default
                                
                                const expiresAt = new Date();
                                expiresAt.setMinutes(expiresAt.getMinutes() + duration);
                                
                                db.run(`
                                    INSERT OR REPLACE INTO user_app_unlocks (user_id, app_id, access_duration, expires_at)
                                    VALUES (?, ?, ?, ?)
                                `, [userId, appId, duration, expiresAt.toISOString()]);
                            }
                        }
                        
                        processed++;
                        if (processed === achievements.length) {
                            callback(null, unlockedAchievements);
                        }
                    });
                } else {
                    processed++;
                    if (processed === achievements.length) {
                        callback(null, unlockedAchievements);
                    }
                }
            });
        });
    });
}

function checkAchievementRequirement(userId, achievement, callback) {
    switch (achievement.requirement_type) {
        case 'words_learned':
            db.get("SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND learned = 1", 
                [userId], (err, result) => {
                    if (err) return callback(false);
                    callback(result.count >= achievement.requirement_value);
                });
            break;
            
        case 'daily_streak':
            // Calculate consecutive days of studying
            db.get(`
                SELECT COUNT(*) as streak FROM (
                    SELECT DISTINCT DATE(last_studied) as study_date
                    FROM progress 
                    WHERE user_id = ? AND last_studied IS NOT NULL
                    ORDER BY study_date DESC
                    LIMIT ?
                ) WHERE study_date >= DATE('now', '-' || ? || ' days')
            `, [userId, achievement.requirement_value, achievement.requirement_value], (err, result) => {
                if (err) return callback(false);
                callback(result.streak >= achievement.requirement_value);
            });
            break;
            
        case 'assignments_completed':
            db.get("SELECT COUNT(*) as count FROM submissions WHERE student_id = ?", 
                [userId], (err, result) => {
                    if (err) return callback(false);
                    callback(result.count >= achievement.requirement_value);
                });
            break;
            
        case 'perfect_scores':
            db.get("SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND score = max_score", 
                [userId], (err, result) => {
                    if (err) return callback(false);
                    callback(result.count >= achievement.requirement_value);
                });
            break;
            
        case 'words_per_day':
            db.get(`
                SELECT COUNT(*) as count FROM progress 
                WHERE user_id = ? AND DATE(created_at) = DATE('now')
            `, [userId], (err, result) => {
                if (err) return callback(false);
                callback(result.count >= achievement.requirement_value);
            });
            break;
            
        default:
            callback(false);
            break;
    }
}


// Dictionary API Integration
async function fetchWordDefinition(word) {
    try {
        // Using Free Dictionary API
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word.toLowerCase()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const entry = data[0];
            
            // Extract pronunciation (US pronunciation preferred)
            let pronunciation = null;
            let audioUrl = null;
            
            if (entry.phonetics && entry.phonetics.length > 0) {
                // Look for US pronunciation first
                const usPhonetic = entry.phonetics.find(p => 
                    p.audio && (p.audio.includes('us') || p.audio.includes('US'))
                );
                
                if (usPhonetic) {
                    pronunciation = usPhonetic.text;
                    audioUrl = usPhonetic.audio;
                } else {
                    // Fallback to any available pronunciation
                    const anyPhonetic = entry.phonetics.find(p => p.audio);
                    if (anyPhonetic) {
                        pronunciation = anyPhonetic.text;
                        audioUrl = anyPhonetic.audio;
                    }
                }
            }
            
            // Extract definition
            let definition = '';
            let example = '';
            
            if (entry.meanings && entry.meanings.length > 0) {
                const meaning = entry.meanings[0];
                if (meaning.definitions && meaning.definitions.length > 0) {
                    definition = meaning.definitions[0].definition;
                    example = meaning.definitions[0].example || '';
                }
            }
            
            return {
                word: entry.word,
                pronunciation: pronunciation,
                audioUrl: audioUrl,
                definition: definition,
                example: example,
                partOfSpeech: entry.meanings[0]?.partOfSpeech || ''
            };
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching definition for "${word}":`, error.message);
        return null;
    }
}

// API endpoint to get word definition and pronunciation
app.get('/api/dictionary/:word', async (req, res) => {
    const { word } = req.params;
    
    try {
        const definition = await fetchWordDefinition(word);
        
        if (definition) {
            res.json(definition);
        } else {
            res.status(404).json({ error: 'Word not found in dictionary' });
        }
    } catch (error) {
        console.error('Dictionary API error:', error);
        res.status(500).json({ error: 'Failed to fetch word definition' });
    }
});

// API endpoint to enhance existing words with dictionary data
app.post('/api/enhance-words', async (req, res) => {
    try {
        // Get all words without audio URLs
        db.all(`SELECT * FROM words WHERE audio_url IS NULL OR audio_url = ''`, async (err, words) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            let enhanced = 0;
            let processed = 0;
            
            for (const word of words) {
                try {
                    const definition = await fetchWordDefinition(word.word);
                    
                    if (definition && definition.audioUrl) {
                        db.run(`UPDATE words SET audio_url = ?, image_url = ? WHERE id = ?`, 
                            [definition.audioUrl, definition.pronunciation, word.id], 
                            (updateErr) => {
                                if (!updateErr) {
                                    enhanced++;
                                }
                            }
                        );
                    }
                    
                    processed++;
                    
                    // Add delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.error(`Error enhancing word "${word.word}":`, error);
                    processed++;
                }
            }
            
            // Wait a bit for all database operations to complete
            setTimeout(() => {
                res.json({ 
                    success: true, 
                    message: `Enhanced ${enhanced} out of ${processed} words with pronunciation data` 
                });
            }, 1000);
        });
        
    } catch (error) {
        console.error('Enhance words error:', error);
        res.status(500).json({ error: 'Failed to enhance words' });
    }
});

// Import Queensland vocabulary
app.post('/api/import-queensland-vocab', async (req, res) => {
    try {
        const vocabData = JSON.parse(fs.readFileSync(path.join(__dirname, 'queensland-vocabulary.json'), 'utf8'));
        
        let imported = 0;
        let processed = 0;
        const totalWords = Object.values(vocabData).flat().length;
        
        for (const [grade, words] of Object.entries(vocabData)) {
            const gradeNumber = parseInt(grade.replace('grade', ''));
            
            for (const word of words) {
                try {
                    // Check if word already exists
                    const existing = await new Promise((resolve, reject) => {
                        db.get("SELECT id FROM words WHERE LOWER(word) = LOWER(?)", [word], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    });
                    
                    if (!existing) {
                        // Fetch definition from dictionary API
                        const definition = await fetchWordDefinition(word);
                        
                        let meaning = `A ${gradeNumber > 3 ? 'advanced' : 'basic'} vocabulary word`;
                        let example = `This is an example with the word "${word}".`;
                        let audioUrl = '';
                        let pronunciation = '';
                        
                        if (definition) {
                            meaning = definition.definition || meaning;
                            example = definition.example || example;
                            audioUrl = definition.audioUrl || '';
                            pronunciation = definition.pronunciation || '';
                        }
                        
                        await new Promise((resolve, reject) => {
                            db.run(`INSERT INTO words (word, meaning, example, difficulty_level, grade_level, subject, audio_url, image_url) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [word, meaning, example, Math.min(gradeNumber, 5), gradeNumber, 'english', audioUrl, pronunciation],
                                function(err) {
                                    if (err) reject(err);
                                    else {
                                        imported++;
                                        resolve(this.lastID);
                                    }
                                }
                            );
                        });
                        
                        // Add delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                    
                    processed++;
                    
                    // Send progress update every 50 words
                    if (processed % 50 === 0) {
                        console.log(`Processed ${processed}/${totalWords} words, imported ${imported} new words`);
                    }
                    
                } catch (error) {
                    console.error(`Error importing word "${word}":`, error);
                    processed++;
                }
            }
        }
        
        res.json({ 
            success: true, 
            message: `Import completed: ${imported} new words added out of ${processed} processed` 
        });
        
    } catch (error) {
        console.error('Import vocabulary error:', error);
        res.status(500).json({ error: 'Failed to import vocabulary: ' + error.message });
    }
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