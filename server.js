// server.js - English Vocabulary Learning System Backend
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('=== UPDATED SERVER - NO LEVEL REQUIRED ===');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));
// Enhanced CORS configuration for mobile access
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// Database initialization
const db = new sqlite3.Database('vocabulary.db');

// Create tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        level TEXT NOT NULL,
        math_grade_access TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Words table
    db.run(`CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        level TEXT NOT NULL,
        phonetics TEXT,
        pos TEXT,
        definition TEXT,
        example TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(word, level)
    )`);

    // User progress table
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word_id INTEGER NOT NULL,
        difficulty TEXT,
        next_review DATE,
        review_count INTEGER DEFAULT 0,
        last_reviewed DATETIME,
        familiarity_level REAL DEFAULT 0.0,
        correct_answers INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        is_mastered BOOLEAN DEFAULT 0,
        first_learned_date DATETIME,
        mastered_date DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (word_id) REFERENCES words (id),
        UNIQUE(user_id, word_id)
    )`);

    // Study sessions table
    db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word_id INTEGER NOT NULL,
        session_type TEXT,
        difficulty_rating TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (word_id) REFERENCES words (id)
    )`);

    // Math topics table
    db.run(`CREATE TABLE IF NOT EXISTS math_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        grade_level TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        description TEXT,
        learning_objectives TEXT,
        knowledge_points TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, grade_level, topic_name)
    )`);

    // Daily goals table
    db.run(`CREATE TABLE IF NOT EXISTS daily_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        goal_type TEXT NOT NULL,
        target_item_id INTEGER,
        target_count INTEGER DEFAULT 1,
        goal_date DATE NOT NULL,
        completed_count INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Goal completions table
    db.run(`CREATE TABLE IF NOT EXISTS goal_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        goal_id INTEGER NOT NULL,
        completion_type TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (goal_id) REFERENCES daily_goals (id)
    )`);

    // Custom questions table for user-specific assignments
    db.run(`CREATE TABLE IF NOT EXISTS custom_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        question_type TEXT DEFAULT 'calculation',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Practice problems table
    db.run(`CREATE TABLE IF NOT EXISTS practice_problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        math_topic_id INTEGER NOT NULL,
        problem_type TEXT NOT NULL,
        question TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        options TEXT,
        difficulty_level INTEGER DEFAULT 1,
        explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (math_topic_id) REFERENCES math_topics (id)
    )`);

    // User problem attempts table
    db.run(`CREATE TABLE IF NOT EXISTS user_problem_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        problem_id INTEGER NOT NULL,
        user_answer TEXT,
        is_correct BOOLEAN NOT NULL,
        time_taken INTEGER,
        attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (problem_id) REFERENCES practice_problems (id)
    )`);

    // Update existing tables to add new columns if they don't exist
    updateDatabase();
    
    // Insert sample data
    insertSampleWords();
    insertSampleMathTopics();
    insertSamplePracticeProblems();
    setupUserPermissions();
    parseCustomQuestions();
});

// Update database schema for existing installations
function updateDatabase() {
    // Add new columns to user_progress table if they don't exist
    const addColumns = [
        'ALTER TABLE user_progress ADD COLUMN familiarity_level REAL DEFAULT 0.0',
        'ALTER TABLE user_progress ADD COLUMN correct_answers INTEGER DEFAULT 0',
        'ALTER TABLE user_progress ADD COLUMN total_attempts INTEGER DEFAULT 0',
        'ALTER TABLE user_progress ADD COLUMN is_mastered BOOLEAN DEFAULT 0',
        'ALTER TABLE user_progress ADD COLUMN first_learned_date DATETIME',
        'ALTER TABLE user_progress ADD COLUMN mastered_date DATETIME',
        'ALTER TABLE math_topics ADD COLUMN knowledge_points TEXT',
        'ALTER TABLE users ADD COLUMN math_grade_access TEXT'
    ];
    
    addColumns.forEach(sql => {
        db.run(sql, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Database update error:', err.message);
            }
        });
    });
}

// Insert sample words
function insertSampleWords() {
    const sampleWords = [
        {
            word: 'apple',
            level: 'elementary',
            phonetics: '/ˈæpəl/',
            pos: 'noun',
            definition: 'A round fruit with red or green skin and firm white flesh',
            example: 'I eat an apple every day for good health.'
        },
        {
            word: 'beautiful',
            level: 'elementary',
            phonetics: '/ˈbjuːtɪfʊl/',
            pos: 'adjective',
            definition: 'Pleasing the senses or mind aesthetically',
            example: 'The sunset was beautiful tonight.'
        },
        {
            word: 'education',
            level: 'middle',
            phonetics: '/ˌedʒʊˈkeɪʃən/',
            pos: 'noun',
            definition: 'The process of receiving or giving systematic instruction',
            example: 'Education is the key to success in life.'
        },
        {
            word: 'wonderful',
            level: 'middle',
            phonetics: '/ˈwʌndərfʊl/',
            pos: 'adjective',
            definition: 'Inspiring delight, pleasure, or admiration; extremely good',
            example: 'We had a wonderful time at the party.'
        },
        {
            word: 'accomplish',
            level: 'high',
            phonetics: '/əˈkʊmplɪʃ/',
            pos: 'verb',
            definition: 'Achieve or complete successfully',
            example: 'She accomplished all her goals through hard work.'
        },
        {
            word: 'knowledge',
            level: 'high',
            phonetics: '/ˈnɒlɪdʒ/',
            pos: 'noun',
            definition: 'Facts, information, and skills acquired through experience or education',
            example: 'His knowledge of computers is impressive.'
        },
        {
            word: 'challenge',
            level: 'university',
            phonetics: '/ˈtʃælɪndʒ/',
            pos: 'noun',
            definition: 'A call to take part in a contest or competition',
            example: 'The exam was a real challenge for the students.'
        }
    ];

    db.get("SELECT COUNT(*) as count FROM words", (err, row) => {
        if (err) {
            console.error('Error checking word count:', err);
            return;
        }
        
        if (row.count === 0) {
            const stmt = db.prepare(`INSERT INTO words 
                (word, level, phonetics, pos, definition, example) 
                VALUES (?, ?, ?, ?, ?, ?)`);
            
            sampleWords.forEach(word => {
                stmt.run([
                    word.word,
                    word.level,
                    word.phonetics,
                    word.pos,
                    word.definition,
                    word.example
                ]);
            });
            
            stmt.finalize();
            console.log('Sample words inserted successfully');
        }
    });
}

// Insert Queensland math topics
function insertSampleMathTopics() {
    const mathTopics = [
        // Year 3
        {
            category: 'Number and Algebra',
            grade_level: 'Year 3',
            topic_name: 'Multiplication and Division Facts',
            description: 'Master multiplication and division facts for 2 to 10 times tables',
            learning_objectives: 'Recall multiplication facts; Understand relationship between multiplication and division; Apply facts to solve problems',
            knowledge_points: `• Learn times tables from 2 to 10
• Understand multiplication as repeated addition (e.g., 3 × 4 = 3 + 3 + 3 + 3)
• Recognize division as the inverse of multiplication
• Use arrays and grouping to visualize multiplication
• Develop strategies for learning facts (skip counting, patterns, doubling)
• Apply multiplication and division facts to solve word problems
• Practice fact families (e.g., 3 × 4 = 12, 4 × 3 = 12, 12 ÷ 3 = 4, 12 ÷ 4 = 3)`
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 3',
            topic_name: 'Place Value to 10,000',
            description: 'Understanding and using place value for numbers up to 10,000',
            learning_objectives: 'Identify place value; Compare and order numbers; Round numbers to nearest 10, 100, 1000',
            knowledge_points: `• Understand place value positions: ones, tens, hundreds, thousands
• Read and write numbers up to 10,000 in digits and words
• Identify the value of each digit in a number (e.g., in 3,724, the 7 represents 700)
• Compare numbers using >, <, = symbols
• Order numbers from smallest to largest and vice versa
• Round numbers to the nearest 10, 100, and 1,000
• Use place value blocks or charts to represent numbers
• Understand that moving left each position is 10 times greater`
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 3',
            topic_name: 'Addition and Subtraction',
            description: 'Addition and subtraction of large numbers',
            learning_objectives: 'Add and subtract 3-4 digit numbers; Use mental strategies; Solve word problems',
            knowledge_points: `• Add and subtract numbers with up to 4 digits
• Use column addition and subtraction methods
• Apply mental strategies (counting on, compensation, breaking apart numbers)
• Solve addition and subtraction word problems
• Check answers using inverse operations
• Understand regrouping (carrying and borrowing)
• Use number lines and hundreds charts as tools
• Estimate sums and differences to check reasonableness`
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 3',
            topic_name: 'Simple Fractions',
            description: 'Introduction to simple fractions (halves, quarters)',
            learning_objectives: 'Recognize unit fractions; Compare simple fractions; Model fractions using diagrams',
            knowledge_points: `• Understand fractions as parts of a whole
• Recognize and name unit fractions (1/2, 1/3, 1/4, 1/5, etc.)
• Compare simple fractions of the same denominator
• Model fractions using shapes, objects, and number lines
• Understand that fractions can represent equal parts of collections
• Find simple equivalent fractions (1/2 = 2/4)
• Recognize fractions in everyday contexts (half an hour, quarter past)`
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 3',
            topic_name: 'Measurement Units',
            description: 'Length, area, volume, and capacity measurement',
            learning_objectives: 'Choose appropriate units; Measure using standard units; Estimate measurements',
            knowledge_points: `• Choose appropriate units for measuring length (mm, cm, m, km)
• Use rulers, measuring tapes, and other measuring tools accurately
• Measure and compare lengths, masses, and capacities
• Estimate measurements before measuring
• Convert between units (cm to m, mL to L)
• Understand the concept of area as the amount of surface
• Compare areas by counting square units
• Measure capacity using standard units (mL, L)`
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 3',
            topic_name: 'Time',
            description: 'Telling time to the nearest minute',
            learning_objectives: 'Read analog and digital clocks; Calculate elapsed time; Use am/pm notation',
            knowledge_points: `• Read time on analog clocks to the nearest minute
• Read time on digital clocks in 12-hour and 24-hour format
• Understand and use am/pm notation
• Calculate elapsed time in hours and minutes
• Understand the relationship between seconds, minutes, hours, days, weeks
• Read calendars and identify dates
• Solve problems involving time intervals
• Use time vocabulary (quarter past, half past, quarter to)`
        },
        {
            category: 'Statistics and Probability',
            grade_level: 'Year 3',
            topic_name: 'Data Collection',
            description: 'Collecting and organising data',
            learning_objectives: 'Collect data through surveys; Organize data in tables; Create simple graphs',
            knowledge_points: `• Collect data through surveys, observations, and investigations
• Organize data using tally marks and frequency tables
• Create and interpret simple column graphs and picture graphs
• Ask and answer questions about data displays
• Understand the concept of chance using everyday language (likely, unlikely, certain, impossible)
• Identify outcomes in simple chance experiments
• Compare data sets and make simple conclusions`
        },

        // Year 4
        {
            category: 'Number and Algebra',
            grade_level: 'Year 4',
            topic_name: 'Times Tables to 12',
            description: 'Multiplication and division facts up to 12 times tables',
            learning_objectives: 'Fluently recall all multiplication facts to 12×12; Apply division facts; Solve multi-step problems'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 4',
            topic_name: 'Place Value to 100,000',
            description: 'Understanding place value for numbers up to 100,000',
            learning_objectives: 'Read and write large numbers; Compare and order; Use place value for calculations'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 4',
            topic_name: 'Fractions and Decimals',
            description: 'Fractions and decimals (tenths and hundredths)',
            learning_objectives: 'Convert between fractions and decimals; Compare decimal numbers; Add and subtract decimals'
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 4',
            topic_name: 'Perimeter and Area',
            description: 'Calculating perimeter and area of simple shapes',
            learning_objectives: 'Calculate perimeter of rectangles; Find area using unit squares; Apply formulas'
        },

        // Year 5
        {
            category: 'Number and Algebra',
            grade_level: 'Year 5',
            topic_name: 'Prime Numbers and Factors',
            description: 'Prime numbers, factors, and multiples',
            learning_objectives: 'Identify prime and composite numbers; Find factors and multiples; Use factor trees'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 5',
            topic_name: 'Decimal Operations',
            description: 'Addition, subtraction, multiplication, and division with decimals',
            learning_objectives: 'Perform operations with decimals; Round decimals; Solve decimal word problems'
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 5',
            topic_name: 'Volume and Angles',
            description: 'Introduction to volume measurement and angle classification',
            learning_objectives: 'Calculate volume of rectangular prisms; Measure and classify angles; Use protractor'
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 5',
            topic_name: 'Coordinate Geometry',
            description: 'Coordinate grids and plotting points',
            learning_objectives: 'Plot points on coordinate plane; Describe transformations; Create patterns'
        },

        // Year 6
        {
            category: 'Number and Algebra',
            grade_level: 'Year 6',
            topic_name: 'Fraction Operations',
            description: 'Fractions: equivalence, addition, subtraction, multiplication, division',
            learning_objectives: 'Add and subtract fractions with different denominators; Multiply and divide fractions; Solve fraction problems'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 6',
            topic_name: 'Ratio and Rates',
            description: 'Introduction to ratio and rates',
            learning_objectives: 'Express ratios in simplest form; Solve proportion problems; Calculate rates'
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 6',
            topic_name: 'Surface Area and Volume',
            description: 'Surface area and volume of prisms',
            learning_objectives: 'Calculate surface area of rectangular prisms; Find volume using formulas; Solve practical problems'
        },

        // Year 7
        {
            category: 'Number and Algebra',
            grade_level: 'Year 7',
            topic_name: 'Rational Numbers',
            description: 'Rational numbers: operations and applications',
            learning_objectives: 'Work with positive and negative numbers; Perform operations with integers; Compare rational numbers'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 7',
            topic_name: 'Percentages and Ratios',
            description: 'Percentages, rates, ratios',
            learning_objectives: 'Convert between fractions, decimals, percentages; Calculate percentage increase/decrease; Solve ratio problems'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 7',
            topic_name: 'Linear Algebra',
            description: 'Algebra: expressions, linear equations, simple formulas',
            learning_objectives: 'Simplify algebraic expressions; Solve linear equations; Substitute into formulas'
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 7',
            topic_name: 'Pythagoras Theorem',
            description: 'Introduction to Pythagoras theorem',
            learning_objectives: 'Apply Pythagoras theorem to right triangles; Find unknown sides; Solve practical problems',
            knowledge_points: `• Understand that a² + b² = c² in right triangles
• Identify the hypotenuse as the longest side opposite the right angle
• Calculate the length of unknown sides in right triangles
• Apply Pythagoras theorem to solve real-world problems
• Understand Pythagorean triples (3,4,5; 5,12,13; 8,15,17)
• Use the theorem to check if a triangle is a right triangle
• Solve problems involving distances and heights
• Connect to coordinate geometry applications`
        },

        // Year 8
        {
            category: 'Number and Algebra',
            grade_level: 'Year 8',
            topic_name: 'Linear Relationships',
            description: 'Linear relationships and graphs of linear equations',
            learning_objectives: 'Plot linear graphs; Find gradient and y-intercept; Solve simultaneous equations'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 8',
            topic_name: 'Scientific Notation',
            description: 'Scientific notation and approximation',
            learning_objectives: 'Express numbers in scientific notation; Perform calculations; Round to significant figures'
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 8',
            topic_name: 'Volume of Solids',
            description: 'Volume and surface area of cylinders, cones, spheres',
            learning_objectives: 'Calculate volume and surface area of curved solids; Apply formulas; Solve composite problems'
        },

        // Year 9
        {
            category: 'Number and Algebra',
            grade_level: 'Year 9',
            topic_name: 'Index Laws and Surds',
            description: 'Index laws and surds',
            learning_objectives: 'Apply index laws; Simplify expressions with indices; Work with surds and radicals'
        },
        {
            category: 'Number and Algebra',
            grade_level: 'Year 9',
            topic_name: 'Quadratic Equations',
            description: 'Quadratic expressions and equations',
            learning_objectives: 'Expand and factorize quadratics; Solve quadratic equations; Graph parabolas',
            knowledge_points: `• Understand the standard form ax² + bx + c = 0
• Expand quadratic expressions using FOIL method
• Factorize quadratic expressions by finding common factors
• Factorize quadratics by grouping and using patterns
• Solve quadratic equations by factorization
• Use the quadratic formula when factorization is difficult
• Graph parabolas and identify key features (vertex, axis of symmetry, y-intercept)
• Solve real-world problems involving quadratic relationships
• Understand the discriminant and number of solutions`
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 9',
            topic_name: 'Trigonometry',
            description: 'Trigonometric ratios and solving right triangles',
            learning_objectives: 'Use sine, cosine, tangent ratios; Solve right triangle problems; Apply to practical situations'
        },
        {
            category: 'Measurement and Geometry',
            grade_level: 'Year 9',
            topic_name: 'Similarity and Congruence',
            description: 'Similarity and congruence in geometry',
            learning_objectives: 'Identify similar and congruent figures; Apply scale factors; Prove geometric relationships'
        }
    ];

    db.get("SELECT COUNT(*) as count FROM math_topics", (err, row) => {
        if (err) {
            console.error('Error checking math topics count:', err);
            return;
        }
        
        if (row.count === 0) {
            const stmt = db.prepare(`INSERT INTO math_topics 
                (category, grade_level, topic_name, description, learning_objectives, knowledge_points) 
                VALUES (?, ?, ?, ?, ?, ?)`);
            
            mathTopics.forEach(topic => {
                stmt.run([
                    topic.category,
                    topic.grade_level,
                    topic.topic_name,
                    topic.description,
                    topic.learning_objectives,
                    topic.knowledge_points || ''
                ]);
            });
            
            stmt.finalize();
            console.log('Sample math topics inserted successfully');
        } else {
            // Update existing records with knowledge points if they don't have them
            console.log('Updating existing math topics with knowledge points...');
            const updateStmt = db.prepare(`UPDATE math_topics SET knowledge_points = ? WHERE id = ? AND (knowledge_points IS NULL OR knowledge_points = '')`);
            
            // Update specific topics that we've added knowledge points for
            const topicsToUpdate = mathTopics.filter(topic => topic.knowledge_points);
            
            db.all(`SELECT id, topic_name, grade_level FROM math_topics`, (err, existingTopics) => {
                if (err) {
                    console.error('Error fetching existing topics:', err);
                    return;
                }
                
                existingTopics.forEach(existing => {
                    const matchingTopic = topicsToUpdate.find(topic => 
                        topic.topic_name === existing.topic_name && 
                        topic.grade_level === existing.grade_level
                    );
                    
                    if (matchingTopic && matchingTopic.knowledge_points) {
                        updateStmt.run([matchingTopic.knowledge_points, existing.id]);
                    }
                });
                
                updateStmt.finalize();
                console.log('Math topics knowledge points updated successfully');
            });
        }
    });
}

// Insert sample practice problems
function insertSamplePracticeProblems() {
    db.get("SELECT COUNT(*) as count FROM practice_problems", (err, row) => {
        if (err) {
            console.error('Error checking practice problems count:', err);
            return;
        }
        
        if (row.count === 0) {
            // Get math topics to create problems for
            db.all("SELECT * FROM math_topics", [], (err, topics) => {
                if (err) {
                    console.error('Error getting math topics:', err);
                    return;
                }
                
                const stmt = db.prepare(`INSERT INTO practice_problems 
                    (math_topic_id, problem_type, question, correct_answer, options, difficulty_level, explanation) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`);
                
                topics.forEach(topic => {
                    const problems = generateProblemsForTopic(topic);
                    problems.forEach(problem => {
                        stmt.run([
                            topic.id,
                            problem.type,
                            problem.question,
                            problem.answer,
                            JSON.stringify(problem.options),
                            problem.difficulty,
                            problem.explanation
                        ]);
                    });
                });
                
                stmt.finalize();
                console.log('Sample practice problems inserted successfully');
            });
        }
    });
}

// Generate problems for specific topics
function generateProblemsForTopic(topic) {
    const problems = [];
    
    switch (topic.topic_name) {
        case 'Multiplication and Division Facts':
            problems.push(
                {
                    type: 'multiple_choice',
                    question: 'What is 7 × 8?',
                    answer: '56',
                    options: ['48', '54', '56', '64'],
                    difficulty: 1,
                    explanation: '7 × 8 = 56. You can think of this as 7 groups of 8, or add 7 eight times.'
                },
                {
                    type: 'multiple_choice',
                    question: 'What is 72 ÷ 9?',
                    answer: '8',
                    options: ['6', '7', '8', '9'],
                    difficulty: 1,
                    explanation: '72 ÷ 9 = 8. Think: 9 times what number equals 72?'
                },
                {
                    type: 'short_answer',
                    question: 'Complete the fact family: 6 × 9 = 54, so 54 ÷ 6 = ___',
                    answer: '9',
                    options: null,
                    difficulty: 2,
                    explanation: 'In a fact family, if 6 × 9 = 54, then 54 ÷ 6 = 9 and 54 ÷ 9 = 6.'
                }
            );
            break;
            
        case 'Place Value to 10,000':
            problems.push(
                {
                    type: 'multiple_choice',
                    question: 'What is the value of the digit 5 in the number 3,526?',
                    answer: '500',
                    options: ['5', '50', '500', '5000'],
                    difficulty: 1,
                    explanation: 'The digit 5 is in the hundreds place, so its value is 5 × 100 = 500.'
                },
                {
                    type: 'multiple_choice',
                    question: 'Which number is greater: 4,328 or 4,283?',
                    answer: '4,328',
                    options: ['4,328', '4,283', 'They are equal', 'Cannot tell'],
                    difficulty: 1,
                    explanation: 'Compare place values from left to right. Both have 4,2__, but 328 > 283.'
                }
            );
            break;
            
        case 'Simple Fractions':
            problems.push(
                {
                    type: 'multiple_choice',
                    question: 'Which fraction is larger: 1/2 or 1/4?',
                    answer: '1/2',
                    options: ['1/2', '1/4', 'They are equal', 'Cannot tell'],
                    difficulty: 1,
                    explanation: '1/2 is larger than 1/4. Think of a pizza: half a pizza is more than a quarter.'
                },
                {
                    type: 'multiple_choice',
                    question: 'What fraction of this shape is shaded? [○○●●] (2 out of 4 circles shaded)',
                    answer: '1/2',
                    options: ['1/4', '1/2', '2/4', '2/2'],
                    difficulty: 2,
                    explanation: '2 out of 4 parts are shaded. 2/4 = 1/2.'
                }
            );
            break;
            
        case 'Fractions and Decimals':
            problems.push(
                {
                    type: 'multiple_choice',
                    question: 'What decimal is equal to 3/4?',
                    answer: '0.75',
                    options: ['0.34', '0.43', '0.75', '0.34'],
                    difficulty: 2,
                    explanation: '3/4 = 3 ÷ 4 = 0.75'
                },
                {
                    type: 'short_answer',
                    question: 'Write 0.6 as a fraction in simplest form.',
                    answer: '3/5',
                    options: null,
                    difficulty: 2,
                    explanation: '0.6 = 6/10 = 3/5 (dividing both numerator and denominator by 2)'
                }
            );
            break;
            
        case 'Perimeter and Area':
            problems.push(
                {
                    type: 'short_answer',
                    question: 'A rectangle has length 8 cm and width 5 cm. What is its perimeter?',
                    answer: '26',
                    options: null,
                    difficulty: 2,
                    explanation: 'Perimeter = 2 × (length + width) = 2 × (8 + 5) = 2 × 13 = 26 cm'
                },
                {
                    type: 'short_answer',
                    question: 'A rectangle has length 6 m and width 4 m. What is its area?',
                    answer: '24',
                    options: null,
                    difficulty: 2,
                    explanation: 'Area = length × width = 6 × 4 = 24 square meters'
                }
            );
            break;
            
        case 'Pythagoras Theorem':
            problems.push(
                {
                    type: 'short_answer',
                    question: 'In a right triangle, if the two shorter sides are 3 cm and 4 cm, what is the length of the hypotenuse?',
                    answer: '5',
                    options: null,
                    difficulty: 3,
                    explanation: 'Using Pythagoras theorem: c² = a² + b² = 3² + 4² = 9 + 16 = 25, so c = 5 cm'
                },
                {
                    type: 'multiple_choice',
                    question: 'Which set of numbers could be the sides of a right triangle?',
                    answer: '5, 12, 13',
                    options: ['3, 4, 6', '5, 12, 13', '7, 8, 9', '10, 11, 12'],
                    difficulty: 3,
                    explanation: 'Check: 5² + 12² = 25 + 144 = 169 = 13². This satisfies Pythagoras theorem.'
                }
            );
            break;
            
        case 'Quadratic Equations':
            problems.push(
                {
                    type: 'multiple_choice',
                    question: 'What are the solutions to x² - 5x + 6 = 0?',
                    answer: 'x = 2, x = 3',
                    options: ['x = 1, x = 6', 'x = 2, x = 3', 'x = -2, x = -3', 'x = 1, x = -6'],
                    difficulty: 4,
                    explanation: 'Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3'
                },
                {
                    type: 'short_answer',
                    question: 'Expand (x + 4)(x - 1)',
                    answer: 'x² + 3x - 4',
                    options: null,
                    difficulty: 3,
                    explanation: '(x + 4)(x - 1) = x² - x + 4x - 4 = x² + 3x - 4'
                }
            );
            break;
            
        default:
            // Generic problems for other topics
            problems.push(
                {
                    type: 'short_answer',
                    question: `Practice problem for ${topic.topic_name}: Complete this concept review.`,
                    answer: 'Review completed',
                    options: null,
                    difficulty: 2,
                    explanation: `This is a review exercise for ${topic.topic_name}. Focus on the key concepts and practice regularly.`
                }
            );
    }
    
    return problems;
}

// Spaced repetition intervals (days)
const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30, 90];

// Familiarity level calculation based on 7-time repetition system
function calculateFamiliarityLevel(correctAnswers, totalAttempts, isCorrect) {
    // Update attempt counts
    const newTotalAttempts = totalAttempts + 1;
    const newCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
    
    if (!isCorrect) {
        // If answer is wrong, reduce familiarity
        if (correctAnswers === 0) {
            return { familiarity: 0.0, correctAnswers: 0, totalAttempts: newTotalAttempts, isMastered: false };
        } else {
            // Reduce familiarity by 10% but keep correct answers for tracking
            const currentFamiliarity = getFamiliarityByCorrectAnswers(correctAnswers);
            const newFamiliarity = Math.max(0, currentFamiliarity - 0.1);
            return { 
                familiarity: newFamiliarity, 
                correctAnswers: newCorrectAnswers, 
                totalAttempts: newTotalAttempts, 
                isMastered: false 
            };
        }
    }
    
    // If answer is correct, calculate familiarity based on correct answer count
    const familiarity = getFamiliarityByCorrectAnswers(newCorrectAnswers);
    const isMastered = newCorrectAnswers >= 7;
    
    return { 
        familiarity, 
        correctAnswers: newCorrectAnswers, 
        totalAttempts: newTotalAttempts, 
        isMastered 
    };
}

// Get familiarity percentage based on correct answers
function getFamiliarityByCorrectAnswers(correctAnswers) {
    const familiarityLevels = [0, 0.5, 0.6, 0.65, 0.7, 0.8, 0.9, 1.0];
    return familiarityLevels[Math.min(correctAnswers, 7)] || 0;
}

// Get next review date
function getNextReviewDate(difficulty, currentInterval = 0) {
    let intervalIndex = currentInterval;
    
    switch (difficulty) {
        case 'easy':
            intervalIndex = Math.min(intervalIndex + 2, SPACED_REPETITION_INTERVALS.length - 1);
            break;
        case 'normal':
            intervalIndex = Math.min(intervalIndex + 1, SPACED_REPETITION_INTERVALS.length - 1);
            break;
        case 'difficult':
            intervalIndex = Math.max(0, intervalIndex - 1);
            break;
    }
    
    const days = SPACED_REPETITION_INTERVALS[intervalIndex];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    
    return {
        date: nextDate.toISOString().split('T')[0],
        intervalIndex
    };
}

// API Routes

// User login/register
app.post('/api/auth/login', (req, res) => {
    console.log('Login request received:', req.body);
    const { username } = req.body;
    
    if (!username) {
        console.log('Login failed: Username missing');
        return res.status(400).json({ error: 'Username is required' });
    }
    
    console.log('Processing login for username:', username);
    
    // Check if user exists
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (user) {
            // User exists, return user info
            res.json({ user: { id: user.id, username } });
        } else {
            // Create new user (no level needed)
            db.run("INSERT INTO users (username, level) VALUES (?, ?)", [username, 'all'], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                res.json({ user: { id: this.lastID, username } });
            });
        }
    });
});

// Get all words (for frontend loading)
app.get('/api/words/all', (req, res) => {
    db.all("SELECT * FROM words ORDER BY word", (err, words) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get words' });
        }
        res.json(words);
    });
});

// Get user words
app.get('/api/words/:userId', (req, res) => {
    const { userId } = req.params;
    
    const query = `
        SELECT w.*, 
               up.difficulty, 
               up.next_review, 
               up.review_count,
               up.familiarity_level,
               up.correct_answers,
               up.total_attempts,
               up.is_mastered,
               CASE WHEN up.id IS NOT NULL THEN 1 ELSE 0 END as learned
        FROM words w
        LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
        ORDER BY w.word
    `;
    
    db.all(query, [userId], (err, words) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get word list' });
        }
        res.json(words);
    });
});

// Get user statistics
app.get('/api/stats/:userId', (req, res) => {
    const { userId } = req.params;
    
    const queries = {
        totalWords: "SELECT COUNT(*) as count FROM words",
        learnedWords: `SELECT COUNT(*) as count FROM user_progress up 
                      JOIN words w ON up.word_id = w.id 
                      WHERE up.user_id = ?`,
        masteredWords: `SELECT COUNT(*) as count FROM user_progress up 
                       JOIN words w ON up.word_id = w.id 
                       WHERE up.user_id = ? AND up.is_mastered = 1`,
        todayReview: `SELECT COUNT(*) as count FROM user_progress up 
                     JOIN words w ON up.word_id = w.id 
                     WHERE up.user_id = ? AND up.next_review = date('now') AND up.is_mastered = 0`,
        streak: `SELECT COUNT(DISTINCT date(created_at)) as count 
                FROM study_sessions 
                WHERE user_id = ? AND date(created_at) >= date('now', '-7 days')`
    };
    
    let results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    // Total words
    db.get(queries.totalWords, [], (err, row) => {
        results.totalWords = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
    
    // Learned words
    db.get(queries.learnedWords, [userId], (err, row) => {
        results.learnedWords = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
    
    // Mastered words
    db.get(queries.masteredWords, [userId], (err, row) => {
        results.masteredWords = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
    
    // Today's review (exclude mastered words)
    db.get(queries.todayReview, [userId], (err, row) => {
        results.todayReview = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
    
    // Learning streak
    db.get(queries.streak, [userId], (err, row) => {
        results.streak = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
});

// Get learning tasks
app.get('/api/learning/:userId', (req, res) => {
    const { userId } = req.params;
    const { type } = req.query;
    
    let query;
    let params;
    
    if (type === 'review') {
        // Get words that need review (exclude mastered words)
        query = `
            SELECT w.*, up.familiarity_level, up.correct_answers, up.is_mastered FROM words w
            JOIN user_progress up ON w.id = up.word_id
            WHERE up.user_id = ? AND up.next_review <= date('now') AND up.is_mastered = 0
            ORDER BY up.next_review
            LIMIT 20
        `;
        params = [userId];
    } else {
        // Get new words
        query = `
            SELECT w.* FROM words w
            WHERE w.id NOT IN (
                SELECT word_id FROM user_progress WHERE user_id = ?
            )
            ORDER BY w.word
            LIMIT 10
        `;
        params = [userId];
    }
    
    db.all(query, params, (err, words) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get learning tasks' });
        }
        res.json(words);
    });
});

// Record study result
app.post('/api/study', (req, res) => {
    const { userId, wordId, difficulty, sessionType } = req.body;
    
    if (!userId || !wordId || !difficulty) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Determine if answer is correct based on difficulty
    const isCorrect = difficulty === 'easy' || difficulty === 'normal';
    
    // Record study session
    db.run(
        "INSERT INTO study_sessions (user_id, word_id, session_type, difficulty_rating) VALUES (?, ?, ?, ?)",
        [userId, wordId, sessionType || 'learn', difficulty],
        function(err) {
            if (err) {
                console.error('Failed to record study session:', err);
            }
        }
    );
    
    // Check if progress record exists
    db.get(
        "SELECT * FROM user_progress WHERE user_id = ? AND word_id = ?",
        [userId, wordId],
        (err, existing) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to query study record' });
            }
            
            const currentCorrectAnswers = existing ? (existing.correct_answers || 0) : 0;
            const currentTotalAttempts = existing ? (existing.total_attempts || 0) : 0;
            
            // Calculate new familiarity level
            const familiarityResult = calculateFamiliarityLevel(currentCorrectAnswers, currentTotalAttempts, isCorrect);
            
            const nextReview = getNextReviewDate(difficulty, existing ? existing.review_count : 0);
            const now = new Date().toISOString();
            
            if (existing) {
                // Update existing record
                const masteredDate = familiarityResult.isMastered && !existing.is_mastered ? now : existing.mastered_date;
                
                db.run(`
                    UPDATE user_progress 
                    SET difficulty = ?, 
                        next_review = ?, 
                        review_count = review_count + 1, 
                        last_reviewed = datetime('now'),
                        familiarity_level = ?,
                        correct_answers = ?,
                        total_attempts = ?,
                        is_mastered = ?,
                        mastered_date = ?
                    WHERE user_id = ? AND word_id = ?
                `, [
                    difficulty, 
                    nextReview.date, 
                    familiarityResult.familiarity,
                    familiarityResult.correctAnswers,
                    familiarityResult.totalAttempts,
                    familiarityResult.isMastered ? 1 : 0,
                    masteredDate,
                    userId, 
                    wordId
                ], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update study record' });
                    }
                    res.json({ 
                        success: true, 
                        nextReview: nextReview.date,
                        familiarity: familiarityResult.familiarity,
                        isMastered: familiarityResult.isMastered
                    });
                });
            } else {
                // Create new record
                const firstLearnedDate = now;
                const masteredDate = familiarityResult.isMastered ? now : null;
                
                db.run(`
                    INSERT INTO user_progress (
                        user_id, word_id, difficulty, next_review, review_count, last_reviewed,
                        familiarity_level, correct_answers, total_attempts, is_mastered,
                        first_learned_date, mastered_date
                    )
                    VALUES (?, ?, ?, ?, 1, datetime('now'), ?, ?, ?, ?, ?, ?)
                `, [
                    userId, 
                    wordId, 
                    difficulty, 
                    nextReview.date,
                    familiarityResult.familiarity,
                    familiarityResult.correctAnswers,
                    familiarityResult.totalAttempts,
                    familiarityResult.isMastered ? 1 : 0,
                    firstLearnedDate,
                    masteredDate
                ], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create study record' });
                    }
                    res.json({ 
                        success: true, 
                        nextReview: nextReview.date,
                        familiarity: familiarityResult.familiarity,
                        isMastered: familiarityResult.isMastered
                    });
                });
            }
        }
    );
});

// CSV file upload and processing
app.post('/api/upload/csv', upload.single('csv'), async (req, res) => {
    console.log('CSV upload request received');
    
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: 'Please select a CSV file' });
    }
    
    const results = [];
    const filePath = req.file.path;
    
    console.log(`Processing CSV file: ${req.file.originalname}, size: ${req.file.size} bytes`);
    
    try {
        // Read CSV file
        await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath)
                .pipe(csv({
                    skipEmptyLines: true,
                    headers: ['word'], // Only word column
                    renameHeaders: true
                }))
                .on('data', (data) => {
                    console.log('Raw CSV row:', data);
                    // Clean up data and add to results
                    const cleanData = {};
                    Object.keys(data).forEach(key => {
                        const cleanKey = key.trim().toLowerCase();
                        const cleanValue = data[key] ? data[key].trim() : '';
                        cleanData[cleanKey] = cleanValue;
                    });
                    
                    // Handle different possible column names
                    const word = cleanData.word || cleanData['word'] || cleanData['0'];
                    
                    if (word && word !== 'word') { // Skip header row
                        results.push({ word: word.toLowerCase() });
                        console.log(`Added word: ${word}`);
                    }
                })
                .on('end', () => {
                    console.log(`CSV parsing complete. Found ${results.length} words`);
                    resolve();
                })
                .on('error', (error) => {
                    console.error('CSV parsing error:', error);
                    reject(error);
                });
        });

        if (results.length === 0) {
            fs.unlinkSync(filePath);
            console.log('No valid words found in CSV');
            return res.status(400).json({ 
                error: 'No valid words found in CSV. Please check the format: word,level' 
            });
        }

        console.log(`Starting dictionary processing for ${results.length} words...`);

        // Process CSV data and get dictionary info
        const processedWords = await processWordsWithDictionary(results);
        
        console.log(`Dictionary processing complete. Got ${processedWords.length} processed words`);
        
        // Batch insert to database
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO words 
            (word, level, phonetics, pos, definition, example) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        let insertedCount = 0;
        let errors = 0;

        for (const word of processedWords) {
            try {
                await new Promise((resolve, reject) => {
                    stmt.run([
                        word.word,
                        word.level,
                        word.phonetics || '',
                        word.pos || '',
                        word.definition || '',
                        word.example || ''
                    ], function(err) {
                        if (err) {
                            console.error(`Failed to insert word ${word.word}:`, err);
                            errors++;
                            reject(err);
                        } else {
                            insertedCount++;
                            console.log(`Inserted word: ${word.word}`);
                            resolve();
                        }
                    });
                });
            } catch (err) {
                // Continue processing even if one word fails
                console.error(`Skipping word ${word.word}:`, err);
            }
        }
        
        stmt.finalize(() => {
            // Delete temp file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            let message = `Successfully imported ${insertedCount} words`;
            if (errors > 0) {
                message += ` (${errors} errors)`;
            }
            
            console.log('Upload complete:', message);
            res.json({ 
                success: true, 
                message: message,
                imported: insertedCount,
                errors: errors
            });
        });

    } catch (error) {
        console.error('Failed to process CSV file:', error);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ 
            error: 'Failed to process CSV file: ' + error.message 
        });
    }
});

// Process words with dictionary API
async function processWordsWithDictionary(words) {
    console.log(`Processing ${words.length} words with dictionary API...`);
    const processedWords = [];
    
    for (let i = 0; i < words.length; i++) {
        const wordData = words[i];
        const word = wordData.word || Object.values(wordData)[0];
        
        if (!word) {
            console.log(`Skipping empty word at index ${i}`);
            continue;
        }
        
        const cleanWord = word.toLowerCase().trim();
        
        console.log(`Processing ${i + 1}/${words.length}: ${cleanWord}`);
        
        try {
            const enrichedWord = await getDictionaryData(cleanWord);
            processedWords.push({
                word: cleanWord,
                level: 'all', // Default level for all words
                ...enrichedWord
            });
            
            // Add delay to avoid rate limiting (200ms between requests)
            if (i < words.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
        } catch (error) {
            console.error(`Failed to process word ${cleanWord}:`, error);
            processedWords.push({
                word: cleanWord,
                level: 'all',
                phonetics: '',
                pos: '',
                definition: 'Definition to be added manually',
                example: ''
            });
        }
    }
    
    console.log(`Completed processing ${processedWords.length} words`);
    return processedWords;
}

// Get dictionary data from free API
async function getDictionaryData(word) {
    console.log(`Getting dictionary data for: ${word}`);
    
    try {
        // Use free dictionary API (dictionaryapi.dev)
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
            timeout: 15000,
            headers: {
                'User-Agent': 'English-Learning-System/1.0'
            }
        });
        
        if (response.data && response.data.length > 0) {
            const data = response.data[0];
            const meaning = data.meanings && data.meanings[0];
            const definition = meaning && meaning.definitions && meaning.definitions[0];
            
            const result = {
                phonetics: data.phonetic || (data.phonetics && data.phonetics[0] && data.phonetics[0].text) || '',
                pos: meaning && meaning.partOfSpeech || '',
                definition: definition && definition.definition || `Definition of ${word}`,
                example: definition && definition.example || `Example sentence with ${word}.`
            };
            
            console.log(`Successfully got dictionary data for: ${word}`);
            return result;
        }
    } catch (error) {
        console.error(`Dictionary API call failed for ${word}:`, error.message);
    }
    
    // Return default values if API fails
    console.log(`Using default data for: ${word}`);
    return {
        phonetics: '',
        pos: '',
        definition: `Definition of ${word}`,
        example: `Example sentence with ${word}.`
    };
}

// Alternative dictionary API (backup)
async function getAlternativeDictionaryData(word) {
    // This could be replaced with other free dictionary APIs
    // For now, return mock data
    throw new Error('Alternative dictionary API not configured');
}

// Get system status
app.get('/api/system/status', (req, res) => {
    db.get("SELECT COUNT(*) as count FROM words", (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get system status' });
        }
        
        res.json({
            vocabularySize: row.count,
            databaseStatus: 'normal',
            apiStatus: 'connected'
        });
    });
});

// Reset user progress
app.delete('/api/progress/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.run("DELETE FROM user_progress WHERE user_id = ?", [userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to reset progress' });
        }
        
        db.run("DELETE FROM study_sessions WHERE user_id = ?", [userId], (err) => {
            if (err) {
                console.error('Failed to delete study sessions:', err);
            }
            res.json({ success: true });
        });
    });
});

// Export user data
app.get('/api/export/:userId', (req, res) => {
    const { userId } = req.params;
    
    // Get user info
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: 'Failed to get user info' });
        }
        
        // Get learning progress
        db.all(`
            SELECT w.word, w.level, up.difficulty, up.next_review, up.review_count
            FROM user_progress up
            JOIN words w ON up.word_id = w.id
            WHERE up.user_id = ?
        `, [userId], (err, progress) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to get learning progress' });
            }
            
            // Get study sessions
            db.all(`
                SELECT w.word, ss.session_type, ss.difficulty_rating, ss.created_at
                FROM study_sessions ss
                JOIN words w ON ss.word_id = w.id
                WHERE ss.user_id = ?
                ORDER BY ss.created_at DESC
            `, [userId], (err, sessions) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to get study sessions' });
                }
                
                const exportData = {
                    user,
                    progress,
                    sessions,
                    exportDate: new Date().toISOString()
                };
                
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=vocabulary_data_${user.username}.json`);
                res.json(exportData);
            });
        });
    });
});

// Get math topics
app.get('/api/math/topics', (req, res) => {
    const { grade_level, category } = req.query;
    
    let query = "SELECT * FROM math_topics";
    let params = [];
    let conditions = [];
    
    if (grade_level) {
        conditions.push("grade_level = ?");
        params.push(grade_level);
    }
    
    if (category) {
        conditions.push("category = ?");
        params.push(category);
    }
    
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    
    query += " ORDER BY grade_level, category, topic_name";
    
    db.all(query, params, (err, topics) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get math topics' });
        }
        res.json(topics);
    });
});

// Get math topics filtered by user's grade access
app.get('/api/math/topics/user/:userId', (req, res) => {
    const { userId } = req.params;
    
    // Get user's grade access
    db.get('SELECT math_grade_access FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get user info' });
        }
        
        if (!user || !user.math_grade_access) {
            return res.json([]); // No access
        }
        
        const gradeAccess = user.math_grade_access;
        let gradeConditions = [];
        
        if (gradeAccess === '3-5') {
            gradeConditions = ['Year 3', 'Year 4', 'Year 5'];
        } else if (gradeAccess === '5-9') {
            gradeConditions = ['Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9'];
        }
        
        if (gradeConditions.length === 0) {
            return res.json([]);
        }
        
        const placeholders = gradeConditions.map(() => '?').join(',');
        const query = `SELECT * FROM math_topics WHERE grade_level IN (${placeholders}) ORDER BY grade_level, category, topic_name`;
        
        db.all(query, gradeConditions, (err, topics) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to get user math topics' });
            }
            res.json(topics);
        });
    });
});

// Get custom questions for user
app.get('/api/custom-questions/:userId', (req, res) => {
    const { userId } = req.params;
    const { completed } = req.query;
    
    let query = 'SELECT * FROM custom_questions WHERE user_id = ?';
    let params = [userId];
    
    if (completed !== undefined) {
        query += ' AND completed = ?';
        params.push(completed === 'true');
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, questions) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get custom questions' });
        }
        res.json(questions);
    });
});

// Mark custom question as completed
app.post('/api/custom-questions/:questionId/complete', (req, res) => {
    const { questionId } = req.params;
    
    db.run('UPDATE custom_questions SET completed = 1 WHERE id = ?', [questionId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to mark question as completed' });
        }
        
        res.json({ success: true, changes: this.changes });
    });
});

// Upload and parse new questions from text
app.post('/api/upload-questions', (req, res) => {
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: 'No content provided' });
    }
    
    try {
        const questions = parseQuestionsFromText(content);
        
        // Clear existing custom questions
        db.run('DELETE FROM custom_questions', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to clear existing questions' });
            }
            
            // Insert new questions
            const stmt = db.prepare(`
                INSERT INTO custom_questions (user_id, category, question, answer, question_type)
                VALUES (?, ?, ?, ?, ?)
            `);
            
            let insertedCount = 0;
            const insertPromises = questions.map(q => {
                return new Promise((resolve, reject) => {
                    db.get('SELECT id FROM users WHERE username = ?', [q.username], (err, user) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        if (user) {
                            stmt.run([user.id, q.category, q.question, q.answer, q.type], (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    insertedCount++;
                                    resolve();
                                }
                            });
                        } else {
                            resolve(); // Skip if user not found
                        }
                    });
                });
            });
            
            Promise.all(insertPromises)
                .then(() => {
                    stmt.finalize();
                    res.json({ 
                        success: true, 
                        message: `Successfully parsed and inserted ${insertedCount} questions`,
                        totalParsed: questions.length,
                        inserted: insertedCount
                    });
                })
                .catch(error => {
                    stmt.finalize();
                    res.status(500).json({ error: 'Failed to insert questions: ' + error.message });
                });
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to parse questions: ' + error.message });
    }
});

// Get daily goals for user
app.get('/api/goals/:userId', (req, res) => {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    db.all(`
        SELECT dg.*, 
               CASE WHEN dg.goal_type = 'vocabulary' THEN w.word
                    WHEN dg.goal_type = 'math' THEN mt.topic_name
                    ELSE dg.goal_type END as target_name
        FROM daily_goals dg
        LEFT JOIN words w ON dg.goal_type = 'vocabulary' AND dg.target_item_id = w.id
        LEFT JOIN math_topics mt ON dg.goal_type = 'math' AND dg.target_item_id = mt.id
        WHERE dg.user_id = ? AND dg.goal_date = ?
        ORDER BY dg.goal_type, dg.created_at
    `, [userId, today], (err, goals) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get daily goals' });
        }
        res.json(goals);
    });
});

// Create daily goals for user
app.post('/api/goals', (req, res) => {
    const { userId, goalType, targetCount, targetItemId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    db.run(`
        INSERT OR REPLACE INTO daily_goals 
        (user_id, goal_type, target_item_id, target_count, goal_date, completed_count, is_completed)
        VALUES (?, ?, ?, ?, ?, 0, 0)
    `, [userId, goalType, targetItemId, targetCount, today], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create daily goal' });
        }
        res.json({ success: true, goalId: this.lastID });
    });
});

// Complete a goal
app.post('/api/goals/complete', (req, res) => {
    const { userId, goalId, completionType } = req.body;
    
    // Record the completion
    db.run(`
        INSERT INTO goal_completions (user_id, goal_id, completion_type)
        VALUES (?, ?, ?)
    `, [userId, goalId, completionType || 'manual'], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to record goal completion' });
        }
        
        // Update goal progress
        db.run(`
            UPDATE daily_goals 
            SET completed_count = completed_count + 1,
                is_completed = CASE WHEN completed_count + 1 >= target_count THEN 1 ELSE 0 END
            WHERE id = ? AND user_id = ?
        `, [goalId, userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update goal progress' });
            }
            res.json({ success: true });
        });
    });
});

// Get goal statistics
app.get('/api/goals/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const queries = {
        todayGoals: `SELECT COUNT(*) as count FROM daily_goals WHERE user_id = ? AND goal_date = ?`,
        completedToday: `SELECT COUNT(*) as count FROM daily_goals WHERE user_id = ? AND goal_date = ? AND is_completed = 1`,
        weekStreak: `SELECT COUNT(DISTINCT goal_date) as count FROM daily_goals 
                    WHERE user_id = ? AND goal_date >= date('now', '-7 days') AND is_completed = 1`
    };
    
    let results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    db.get(queries.todayGoals, [userId, today], (err, row) => {
        results.todayGoals = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
    
    db.get(queries.completedToday, [userId, today], (err, row) => {
        results.completedToday = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
    
    db.get(queries.weekStreak, [userId], (err, row) => {
        results.weekStreak = row ? row.count : 0;
        if (++completed === total) res.json(results);
    });
});

// Get practice problems for a topic
app.get('/api/practice/:topicId', (req, res) => {
    const { topicId } = req.params;
    const { difficulty, limit } = req.query;
    
    let query = `SELECT pp.*, mt.topic_name, mt.grade_level 
                 FROM practice_problems pp 
                 JOIN math_topics mt ON pp.math_topic_id = mt.id 
                 WHERE pp.math_topic_id = ?`;
    let params = [topicId];
    
    if (difficulty) {
        query += ' AND pp.difficulty_level = ?';
        params.push(difficulty);
    }
    
    query += ' ORDER BY RANDOM()';
    
    if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
    }
    
    db.all(query, params, (err, problems) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get practice problems' });
        }
        
        // Parse options JSON
        problems.forEach(problem => {
            if (problem.options) {
                try {
                    problem.options = JSON.parse(problem.options);
                } catch (e) {
                    problem.options = null;
                }
            }
        });
        
        res.json(problems);
    });
});

// Submit practice problem answer
app.post('/api/practice/submit', (req, res) => {
    const { userId, problemId, userAnswer, timeTaken } = req.body;
    
    if (!userId || !problemId || userAnswer === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get the correct answer
    db.get('SELECT correct_answer, explanation FROM practice_problems WHERE id = ?', [problemId], (err, problem) => {
        if (err || !problem) {
            return res.status(500).json({ error: 'Problem not found' });
        }
        
        const isCorrect = userAnswer.trim().toLowerCase() === problem.correct_answer.toLowerCase();
        
        // Record the attempt
        db.run(`
            INSERT INTO user_problem_attempts (user_id, problem_id, user_answer, is_correct, time_taken)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, problemId, userAnswer, isCorrect ? 1 : 0, timeTaken || null], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to record attempt' });
            }
            
            res.json({
                correct: isCorrect,
                correctAnswer: problem.correct_answer,
                explanation: problem.explanation,
                attemptId: this.lastID
            });
        });
    });
});

// Get practice statistics for user
app.get('/api/practice/stats/:userId', (req, res) => {
    const { userId } = req.params;
    const { topicId } = req.query;
    
    let query = `
        SELECT 
            mt.topic_name,
            mt.grade_level,
            COUNT(upa.id) as total_attempts,
            SUM(CASE WHEN upa.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
            AVG(CASE WHEN upa.time_taken IS NOT NULL THEN upa.time_taken ELSE NULL END) as avg_time
        FROM user_problem_attempts upa
        JOIN practice_problems pp ON upa.problem_id = pp.id
        JOIN math_topics mt ON pp.math_topic_id = mt.id
        WHERE upa.user_id = ?
    `;
    let params = [userId];
    
    if (topicId) {
        query += ' AND mt.id = ?';
        params.push(topicId);
    }
    
    query += ' GROUP BY mt.id, mt.topic_name, mt.grade_level ORDER BY mt.grade_level, mt.topic_name';
    
    db.all(query, params, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get practice statistics' });
        }
        
        // Calculate accuracy percentage
        stats.forEach(stat => {
            stat.accuracy = stat.total_attempts > 0 ? 
                Math.round((stat.correct_attempts / stat.total_attempts) * 100) : 0;
        });
        
        res.json(stats);
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 English Vocabulary Learning System Started!`);
    console.log(`📱 Local access: http://localhost:${PORT}`);
    console.log(`🌐 Network access: http://${getLocalIP()}:${PORT}`);
    console.log(`\nDevices on the same WiFi can access via the network address\n`);
    
    // Create directories if they don't exist
    ['public', 'uploads'].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
});

// Get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// Setup user permissions for August and Michael
function setupUserPermissions() {
    console.log('Setting up user permissions...');
    
    const userPermissions = [
        { username: 'August', math_grade_access: '3-5' },
        { username: 'Michael', math_grade_access: '5-9' }
    ];
    
    userPermissions.forEach(permission => {
        db.run(`
            UPDATE users 
            SET math_grade_access = ? 
            WHERE username = ?
        `, [permission.math_grade_access, permission.username], function(err) {
            if (err) {
                console.error(`Error setting permissions for ${permission.username}:`, err);
            } else if (this.changes > 0) {
                console.log(`Updated ${permission.username} with ${permission.math_grade_access} grade access`);
            } else {
                // User doesn't exist, create them
                db.run(`
                    INSERT OR IGNORE INTO users (username, level, math_grade_access) 
                    VALUES (?, 'intermediate', ?)
                `, [permission.username, permission.math_grade_access], function(err) {
                    if (err) {
                        console.error(`Error creating user ${permission.username}:`, err);
                    } else {
                        console.log(`Created user ${permission.username} with ${permission.math_grade_access} grade access`);
                    }
                });
            }
        });
    });
}

// Parse custom questions from 333.txt
function parseCustomQuestions() {
    console.log('Parsing custom questions from 333.txt...');
    
    const fs = require('fs');
    
    try {
        const content = fs.readFileSync('333.txt', 'utf8');
        const questions = parseQuestionsFromText(content);
        
        // Clear existing custom questions
        db.run('DELETE FROM custom_questions', (err) => {
            if (err) {
                console.error('Error clearing custom questions:', err);
                return;
            }
            
            if (questions.length === 0) {
                console.log('No questions to insert');
                return;
            }
            
            // Insert new questions
            const stmt = db.prepare(`
                INSERT INTO custom_questions (user_id, category, question, answer, question_type)
                VALUES (?, ?, ?, ?, ?)
            `);
            
            let insertedCount = 0;
            let totalQuestions = questions.length;
            
            questions.forEach((q, index) => {
                // Get user ID first
                db.get('SELECT id FROM users WHERE username = ?', [q.username], (err, user) => {
                    if (err) {
                        console.error(`Error finding user ${q.username}:`, err);
                        insertedCount++;
                        if (insertedCount === totalQuestions) {
                            stmt.finalize();
                            console.log(`Parsing complete`);
                        }
                        return;
                    }
                    
                    if (user) {
                        stmt.run([user.id, q.category, q.question, q.answer, q.type], (err) => {
                            if (err) {
                                console.error(`Error inserting question:`, err);
                            }
                            insertedCount++;
                            if (insertedCount === totalQuestions) {
                                stmt.finalize();
                                console.log(`Parsed ${questions.length} custom questions`);
                            }
                        });
                    } else {
                        insertedCount++;
                        if (insertedCount === totalQuestions) {
                            stmt.finalize();
                            console.log(`Parsing complete`);
                        }
                    }
                });
            });
        });
        
    } catch (error) {
        console.log('333.txt not found or error reading file:', error.message);
    }
}

// Parse questions from text content
function parseQuestionsFromText(content) {
    const questions = [];
    const lines = content.split('\n');
    let currentUser = '';
    let currentCategory = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect user assignment
        if (line.startsWith('For August')) {
            currentUser = 'August';
            continue;
        } else if (line.startsWith('For Michael')) {
            currentUser = 'Michael';
            continue;
        }
        
        // Detect category
        if (line.includes('**') && line.includes(':**')) {
            currentCategory = line.replace(/\*\*/g, '').replace(':', '');
            continue;
        }
        
        // Process questions (numbered lines)
        if (/^\d+\./.test(line) && currentUser) {
            const arithmeticMatch = line.match(/^\d+\.\s*(.+)\s*=\s*$/);
            const equationMatch = line.match(/^\d+\.\s*(.+)$/);
            
            if (arithmeticMatch) {
                // Arithmetic question with =
                const expression = arithmeticMatch[1].trim();
                const answer = calculateAnswer(expression);
                const questionType = expression.includes('\\frac') ? 'fraction' : 'calculation';
                
                questions.push({
                    username: currentUser,
                    category: currentCategory || (questionType === 'fraction' ? 'Fraction Practice' : 'Arithmetic'),
                    question: formatQuestion(expression + ' ='),
                    answer: answer.toString(),
                    type: questionType
                });
            } else if (equationMatch && line.includes('=') && !line.match(/^\d+\.\s*[\d\s+\-×÷]+\s*=\s*$/)) {
                // Equation to solve (contains = but is not arithmetic)
                const equation = equationMatch[1].trim();
                const questionType = equation.includes('\\frac') ? 'fraction' : 'equation';
                
                questions.push({
                    username: currentUser,
                    category: currentCategory || (questionType === 'fraction' ? 'Fraction Practice' : 'Equations'),
                    question: formatQuestion(equation),
                    answer: 'To be solved',
                    type: questionType
                });
            }
        }
        
        // Process fraction questions
        if (line.includes('\\frac') || (line.includes('/') && line.includes('='))) {
            questions.push({
                username: 'Michael', // Fractions are for Michael
                category: 'Fraction Practice',
                question: formatFraction(line),
                answer: 'fraction_result',
                type: 'fraction'
            });
        }
    }
    
    return questions;
}

// Calculate arithmetic answers
function calculateAnswer(expression) {
    try {
        // Handle fraction expressions first
        if (expression.includes('\\frac')) {
            return calculateFractionExpression(expression);
        }
        
        // Replace various multiplication and division symbols
        const cleanExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\\times/g, '*')
            .replace(/\\div/g, '/')
            .replace(/−/g, '-')  // Replace Unicode minus with ASCII minus
            .replace(/\s+/g, '');
            
        // Basic security check - only allow numbers and basic operators
        if (!/^[\d+\-*/().\s]+$/.test(cleanExpression)) {
            console.log('Invalid expression:', cleanExpression);
            return 'Keep as expression';
        }
            
        const result = eval(cleanExpression);
        
        // Convert decimal to fraction if it's a simple fraction
        if (result % 1 !== 0) {
            const fraction = decimalToFraction(result);
            return fraction;
        }
        
        return result;
    } catch (error) {
        return 'Keep as expression';
    }
}

// Calculate fraction expressions
function calculateFractionExpression(expression) {
    try {
        // Parse fractions like \frac{3}{4}+\frac{1}{8}
        const fractionRegex = /\\frac\{(\d+)\}\{(\d+)\}/g;
        const matches = [...expression.matchAll(fractionRegex)];
        
        if (matches.length === 0) {
            return 'Keep as expression';
        }
        
        // For simple cases, let's just format them nicely
        // In a full implementation, you'd calculate the actual result
        let result = expression.replace(fractionRegex, '$1/$2');
        result = result.replace(/\\times/g, '×').replace(/\\div/g, '÷');
        
        return result;
    } catch (error) {
        return 'Keep as expression';
    }
}

// Convert decimal to simple fraction
function decimalToFraction(decimal) {
    const tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    
    do {
        const a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
    
    // Return fraction only if denominator is reasonable
    if (k1 <= 100) {
        return `${h1}/${k1}`;
    }
    
    return decimal.toString();
}

// Format questions for better display
function formatQuestion(question) {
    let formatted = question
        .replace(/×/g, '×')
        .replace(/÷/g, '÷')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Handle fractions - convert LaTeX fractions to display format
    formatted = formatted.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2');
    
    return formatted;
}

// Format fractions for better display
function formatFraction(line) {
    return line
        .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .trim();
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
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

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;