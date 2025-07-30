-- Create database
CREATE DATABASE student_management;
USE student_management;

-- Students table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Teachers table
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO students (name, age, class_name, email, username, password) VALUES
('John Doe', 20, '10A', 'john@example.com', 'john123', 'password123'),
('Jane Smith', 19, '10B', 'jane@example.com', 'jane456', 'password456'),
('Mike Johnson', 21, '11A', 'mike@example.com', 'mike789', 'password789');

INSERT INTO teachers (name, subject, username, password) VALUES
('Dr. Sarah Wilson', 'Mathematics', 'sarah_teacher', 'teacher123'),
('Prof. David Brown', 'Physics', 'david_teacher', 'teacher456');

INSERT INTO courses (student_id, course_name, description) VALUES
(1, 'Mathematics', 'Advanced algebra and calculus'),
(1, 'Physics', 'Mechanics and thermodynamics'),
(2, 'Chemistry', 'Organic and inorganic chemistry'),
(3, 'Biology', 'Cell biology and genetics');