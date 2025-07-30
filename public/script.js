// Global variables
let currentUser = null;

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            redirectToDashboard();
        } else {
            initializeDashboard();
        }
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Add course form handler
    const addCourseForm = document.getElementById('addCourseForm');
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', handleAddCourse);
    }

    // Edit course form handler
    const editCourseForm = document.getElementById('editCourseForm');
    if (editCourseForm) {
        editCourseForm.addEventListener('submit', handleEditCourse);
    }

    // Modal close handler
    const modal = document.getElementById('editModal');
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', closeEditModal);
        
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeEditModal();
            }
        });
    }

    // Initialize dashboard if on dashboard page
    if (window.location.pathname.includes('dashboard')) {
        initializeDashboard();
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            currentUser.role = result.role;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                redirectToDashboard();
            }, 1000);
        } else {
            showMessage(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

function redirectToDashboard() {
    if (currentUser.role === 'student') {
        window.location.href = '/student_dashboard';
    } else if (currentUser.role === 'teacher') {
        window.location.href = '/teacher_dashboard';
    }
}

function initializeDashboard() {
    if (!currentUser) {
        window.location.href = '/';
        return;
    }

    if (currentUser.role === 'student') {
        initializeStudentDashboard();
    } else if (currentUser.role === 'teacher') {
        initializeTeacherDashboard();
    }
}

function initializeStudentDashboard() {
    const studentNameEl = document.getElementById('studentName');
    if (studentNameEl) {
        studentNameEl.textContent = `Welcome, ${currentUser.name}`;
    }
    loadStudentCourses();
}

function initializeTeacherDashboard() {
    const teacherNameEl = document.getElementById('teacherName');
    if (teacherNameEl) {
        teacherNameEl.textContent = `Welcome, ${currentUser.name}`;
    }
    loadAllStudents();
    loadAllCourses();
}

async function loadStudentCourses() {
    try {
        const response = await fetch(`/student/${currentUser.id}/courses`);
        const courses = await response.json();
        
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) return;

        if (courses.length === 0) {
            coursesList.innerHTML = '<p>No courses found. Add your first course!</p>';
            return;
        }

        coursesList.innerHTML = courses.map(course => `
            <div class="course-card">
                <h3>${course.course_name}</h3>
                <p>${course.description || 'No description available'}</p>
                <div class="course-actions">
                    <button class="edit-btn" onclick="openEditModal(${course.id}, '${course.course_name}', '${course.description || ''}')">
                        Edit
                    </button>
                    <button class="delete-btn" onclick="deleteCourse(${course.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading courses:', error);
        showMessage('Error loading courses', 'error');
    }
}

async function handleAddCourse(e) {
    e.preventDefault();
    
    const courseName = document.getElementById('courseName').value;
    const courseDescription = document.getElementById('courseDescription').value;

    try {
        const response = await fetch(`/student/${currentUser.id}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                course_name: courseName,
                description: courseDescription
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showMessage('Course added successfully!', 'success');
            document.getElementById('addCourseForm').reset();
            loadStudentCourses();
        } else {
            showMessage('Error adding course', 'error');
        }
    } catch (error) {
        console.error('Error adding course:', error);
        showMessage('Error adding course', 'error');
    }
}

function openEditModal(courseId, courseName, courseDescription) {
    const modal = document.getElementById('editModal');
    const editCourseId = document.getElementById('editCourseId');
    const editCourseName = document.getElementById('editCourseName');
    const editCourseDescription = document.getElementById('editCourseDescription');

    editCourseId.value = courseId;
    editCourseName.value = courseName;
    editCourseDescription.value = courseDescription;

    modal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

async function handleEditCourse(e) {
    e.preventDefault();
    
    const courseId = document.getElementById('editCourseId').value;
    const courseName = document.getElementById('editCourseName').value;
    const courseDescription = document.getElementById('editCourseDescription').value;

    try {
        const response = await fetch(`/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                course_name: courseName,
                description: courseDescription
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showMessage('Course updated successfully!', 'success');
            closeEditModal();
            loadStudentCourses();
        } else {
            showMessage('Error updating course', 'error');
        }
    } catch (error) {
        console.error('Error updating course:', error);
        showMessage('Error updating course', 'error');
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }

    try {
        const response = await fetch(`/courses/${courseId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (result.success) {
            showMessage('Course deleted successfully!', 'success');
            loadStudentCourses();
        } else {
            showMessage('Error deleting course', 'error');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        showMessage('Error deleting course', 'error');
    }
}

async function loadAllStudents() {
    try {
        const response = await fetch('/teacher/students');
        const students = await response.json();
        
        const studentsTable = document.getElementById('studentsTable');
        if (!studentsTable) return;

        if (students.length === 0) {
            studentsTable.innerHTML = '<p>No students found.</p>';
            return;
        }

        studentsTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Class</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.id}</td>
                            <td>${student.name}</td>
                            <td>${student.age}</td>
                            <td>${student.class_name}</td>
                            <td>${student.email}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Error loading students', 'error');
    }
}

async function loadAllCourses() {
    try {
        const response = await fetch('/teacher/courses');
        const courses = await response.json();
        
        const coursesTable = document.getElementById('coursesTable');
        if (!coursesTable) return;

        if (courses.length === 0) {
            coursesTable.innerHTML = '<p>No courses found.</p>';
            return;
        }

        coursesTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Course ID</th>
                        <th>Course Name</th>
                        <th>Description</th>
                        <th>Student Name</th>
                        <th>Class</th>
                    </tr>
                </thead>
                <tbody>
                    ${courses.map(course => `
                        <tr>
                            <td>${course.id}</td>
                            <td>${course.course_name}</td>
                            <td>${course.description || 'No description'}</td>
                            <td>${course.student_name}</td>
                            <td>${course.class_name}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading courses:', error);
        showMessage('Error loading courses', 'error');
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = '/';
}