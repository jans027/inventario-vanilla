/**
 * Authentication module
 * Handles user login and session management
 */

// Default users for demonstration (in real app, this comes from the backend)
const DEFAULT_USERS = [
    {
        id: 1,
        name: 'Admin',
        email: 'admin@ejemplo.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        id: 2,
        name: 'Juan',
        email: 'juan@ejemplo.com',
        password: 'juan123',
        role: 'vendedor'
    }
];

/**
 * Initialize the login form when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    // If we are on the login page, set up the form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/**
 * Handle the login form submission
 * @param {Event} event - The form submit event
 */
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    // Clear previous errors
    errorElement.textContent = '';

    // Validate empty fields
    if (!email || !password) {
        errorElement.textContent = 'Por favor complete todos los campos';
        return;
    }

    // Find user with matching credentials
    const user = DEFAULT_USERS.find(u => 
        u.email === email && u.password === password
    );

    if (!user) {
        errorElement.textContent = 'Correo o contrasena incorrectos';
        return;
    }

    // Save user session in localStorage
    const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

/**
 * Check if a user is currently logged in
 * @returns {Object|null} The current user or null
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Redirect to login if user is not authenticated
 * Use this on protected pages
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}

/**
 * Log out the current user
 */
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}