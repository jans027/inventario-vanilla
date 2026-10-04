/**
 * Users module
 * Handles user management: listing, searching, adding, editing and deleting
 * Users are stored in localStorage
 */

// Users array (loaded from localStorage)
let users = [];

// Current user id being deleted
let userIdToDelete = null;

/**
 * Load users from localStorage
 * If there are no users saved, initialize with default data from auth.js
 */
function loadUsers() {
    const stored = localStorage.getItem('users');

    if (stored) {
        users = JSON.parse(stored);
    } else {
        // Use the DEFAULT_USERS defined in auth.js
        users = DEFAULT_USERS.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            status: 'activo'
        }));
        saveUsers();
    }
}

/**
 * Save users to localStorage
 */
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Initialize the users page when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we are on the users page
    if (!document.getElementById('userTableBody')) {
        return;
    }

    loadUsers();
    renderUsers(users);
});

/**
 * Render the users table
 * @param {Array} userList - The list of users to display
 */
function renderUsers(userList) {
    const tableBody = document.getElementById('userTableBody');
    const emptyMessage = document.getElementById('emptyUsers');

    tableBody.innerHTML = '';

    if (userList.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    userList.forEach((user, index) => {
        const roleBadge = user.role === 'admin'
            ? '<span class="role-admin">Administrador</span>'
            : '<span class="role-seller">Vendedor</span>';

        const statusBadge = user.status === 'activo'
            ? '<span class="status-active">Activo</span>'
            : '<span class="status-inactive">Inactivo</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-action edit" onclick="editUser(${user.id})">Editar</button>
                <button class="btn-action delete" onclick="openDeleteUserModal(${user.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Search users by name or email
 */
function searchUsers() {
    const searchTerm = document.getElementById('searchUser').value.toLowerCase().trim();

    const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );

    renderUsers(filtered);
}

/**
 * Open the modal to add a new user
 */
function openUserModal() {
    document.getElementById('userModalTitle').textContent = 'Agregar Usuario';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userError').textContent = '';
    document.getElementById('userPassword').required = true;
    document.getElementById('userModal').style.display = 'flex';
}

/**
 * Open the modal to edit an existing user
 * @param {number} id - The id of the user to edit
 */
function editUser(id) {
    const user = users.find(u => u.id === id);

    if (!user) return;

    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userError').textContent = '';
    document.getElementById('userModal').style.display = 'flex';
}

/**
 * Close the user modal
 */
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userForm').reset();
    document.getElementById('userError').textContent = '';
}

/**
 * Save a user (create new or update existing)
 * @param {Event} event - The form submit event
 */
function saveUser(event) {
    event.preventDefault();

    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim().toLowerCase();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;
    const errorElement = document.getElementById('userError');

    errorElement.textContent = '';

    if (!name || !email || !role || !status) {
        errorElement.textContent = 'Por favor complete todos los campos obligatorios';
        return;
    }

    const duplicate = users.find(u => 
        u.email.toLowerCase() === email && u.id !== parseInt(id)
    );

    if (duplicate) {
        errorElement.textContent = 'Ya existe un usuario con ese correo';
        return;
    }

    if (id) {
        const index = users.findIndex(u => u.id === parseInt(id));

        if (index !== -1) {
            users[index] = {
                id: parseInt(id),
                name: name,
                email: email,
                password: password || users[index].password,
                role: role,
                status: status
            };
        }
    } else {
        if (!password) {
            errorElement.textContent = 'La contrasena es obligatoria para nuevos usuarios';
            return;
        }

        const newId = users.length > 0 
            ? Math.max(...users.map(u => u.id)) + 1 
            : 1;

        users.push({
            id: newId,
            name: name,
            email: email,
            password: password,
            role: role,
            status: status
        });
    }

    saveUsers();
    renderUsers(users);
    closeUserModal();
}

/**
 * Open the delete confirmation modal
 * @param {number} id - The id of the user to delete
 */
function openDeleteUserModal(id) {
    userIdToDelete = id;
    document.getElementById('deleteUserModal').style.display = 'flex';
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteUserModal() {
    userIdToDelete = null;
    document.getElementById('deleteUserModal').style.display = 'none';
}

/**
 * Confirm and perform the delete operation
 */
function confirmDeleteUser() {
    if (userIdToDelete === null) return;

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userIdToDelete) {
        alert('No puede eliminar el usuario con el que esta conectado');
        closeDeleteUserModal();
        return;
    }

    users = users.filter(u => u.id !== userIdToDelete);

    saveUsers();
    userIdToDelete = null;
    closeDeleteUserModal();
    renderUsers(users);
}