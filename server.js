let express = require('express');
let mysql = require('mysql2');
let cors = require('cors');
let bodyParser = require('body-parser');
let path = require('path');

let app = express();
port = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


let db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sarawin@mysql07',
    port: 3306,
    database: 'student_management'
});

db.connect((err) => {
    if(err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});


app.post('/login', (req, res) => {
    const { username, password, role } = req.body;
    
    if (role === 'student') {
        const query = 'SELECT * FROM students WHERE username = ? AND password = ?';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length > 0) {
                res.json({ 
                    success: true, 
                    role: 'student',
                    user: {
                        id: results[0].id,
                        name: results[0].name,
                        username: results[0].username
                    }
                });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        });
    } else if (role === 'teacher') {
        const query = 'SELECT * FROM teachers WHERE username = ? AND password = ?';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length > 0) {
                res.json({ 
                    success: true, 
                    role: 'teacher',
                    user: {
                        id: results[0].id,
                        name: results[0].name,
                        username: results[0].username
                    }
                });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        });
    } else {
        res.json({ success: false, message: 'Invalid role' });
    }
});


app.get('/student/:id/courses', (req, res) => {
    const studentId = req.params.id;
    const query = 'SELECT * FROM courses WHERE student_id = ?';
    
    db.query(query, [studentId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/student/:id/courses', (req, res) => {
    const studentId = req.params.id;
    const { course_name, description } = req.body;
    
    const query = 'INSERT INTO courses (student_id, course_name, description) VALUES (?, ?, ?)';
    db.query(query, [studentId, course_name, description], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, courseId: results.insertId });
    });
});

app.put('/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const { course_name, description } = req.body;
    
    const query = 'UPDATE courses SET course_name = ?, description = ? WHERE id = ?';
    db.query(query, [course_name, description, courseId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

app.delete('/courses/:id', (req, res) => {
    const courseId = req.params.id;
    
    const query = 'DELETE FROM courses WHERE id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});


app.get('/teacher/students', (req, res) => {
    const query = 'SELECT id, name, age, class_name, email FROM students';
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/teacher/courses', (req, res) => {
    const query = `
        SELECT c.id, c.course_name, c.description, s.name as student_name, s.class_name 
        FROM courses c 
        JOIN students s ON c.student_id = s.id 
        ORDER BY s.name, c.course_name
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/student_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student_dashboard.html'));
});

app.get('/teacher_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher_dashboard.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});