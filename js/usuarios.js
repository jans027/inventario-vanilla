/**
 * Users module
 * Handles user management: listing, searching, adding, editing and deleting
 * Users are fetched from the backend API
 */

// Users array (loaded from the backend)
let users = [];

// Current user id being deleted
let userIdToDelete = null;

/**
 * Load users from the backend
 */
async function loadUsers() {
    try {
        const response = await fetch('api/usuarios.php');
        const data = await response.json();

        if (data.success) {
            users = data.users;
            renderUsers(users);
        } else {
            console.error('Error al cargar usuarios:', data.message);
        }
    } catch (error) {
        console.error('Error de conexion:', error);
    }
}

/**
 * Initialize the users page when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('userTableBody')) {
        loadUsers();
    }
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
        const roleBadge = user.rol === 'admin'
            ? '<span class="role-admin">Administrador</span>'
            : '<span class="role-seller">Vendedor</span>';

        const statusBadge = user.estado === 'activo'
            ? '<span class="status-active">Activo</span>'
            : '<span class="status-inactive">Inactivo</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.nombre}</td>
            <td>${user.correo}</td>
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
        user.nombre.toLowerCase().includes(searchTerm) ||
        user.correo.toLowerCase().includes(searchTerm)
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
    document.getElementById('userName').value = user.nombre;
    document.getElementById('userEmail').value = user.correo;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;
    document.getElementById('userRole').value = user.rol;
    document.getElementById('userStatus').value = user.estado;
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
async function saveUser(event) {
    event.preventDefault();

    const id = document.getElementById('userId').value;
    const userData = {
        nombre: document.getElementById('userName').value.trim(),
        correo: document.getElementById('userEmail').value.trim().toLowerCase(),
        contrasena: document.getElementById('userPassword').value,
        rol: document.getElementById('userRole').value,
        estado: document.getElementById('userStatus').value
    };

    const isEdit = id !== '';
    if (isEdit) userData.id = parseInt(id);

    try {
        const response = await fetch('api/usuarios.php', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            closeUserModal();
            loadUsers();
        } else {
            document.getElementById('userError').textContent = data.message;
        }
    } catch (error) {
        document.getElementById('userError').textContent = 'Error de conexion';
        console.error(error);
    }
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
async function confirmDeleteUser() {
    if (userIdToDelete === null) return;

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userIdToDelete) {
        alert('No puede eliminar el usuario con el que esta conectado');
        closeDeleteUserModal();
        return;
    }

    try {
        const response = await fetch('api/usuarios.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userIdToDelete })
        });

        const data = await response.json();

        if (data.success) {
            userIdToDelete = null;
            closeDeleteUserModal();
            loadUsers();
            showToast('Producto guardado correctamente', 'success');
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error de conexion', 'error');
        console.error(error);
    }
}