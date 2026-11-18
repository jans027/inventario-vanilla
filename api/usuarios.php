<?php
/**
 * Users endpoint
 * Handles CRUD operations for users
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getAllUsers($conn);
        break;

    case 'POST':
        createUser($conn);
        break;

    case 'PUT':
        updateUser($conn);
        break;

    case 'DELETE':
        deleteUser($conn);
        break;

    default:
        sendResponse(false, null, 'Metodo no permitido');
}

/**
 * Get all users
 */
function getAllUsers($conn) {
    $result = $conn->query("SELECT id, nombre, correo, rol, estado FROM usuarios ORDER BY id ASC");

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => intval($row['id']),
            'nombre' => $row['nombre'],
            'correo' => $row['correo'],
            'rol' => $row['rol'],
            'estado' => $row['estado']
        ];
    }

    sendResponse(true, ['users' => $users]);
}

/**
 * Create a new user
 */
function createUser($conn) {
    $input = getJsonInput();

    $nombre = trim($input['nombre'] ?? '');
    $correo = strtolower(trim($input['correo'] ?? ''));
    $contrasena = $input['contrasena'] ?? '';
    $rol = $input['rol'] ?? 'vendedor';
    $estado = $input['estado'] ?? 'activo';

    // Validations
    if (empty($nombre) || empty($correo) || empty($contrasena)) {
        sendResponse(false, null, 'Todos los campos son obligatorios');
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, null, 'Correo invalido');
    }

    if (!in_array($rol, ['admin', 'vendedor'])) {
        sendResponse(false, null, 'Rol invalido');
    }

    // Check for duplicate email
    $checkStmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $checkStmt->bind_param("s", $correo);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        sendResponse(false, null, 'Ya existe un usuario con ese correo');
    }

    // Después (Encriptado):
$contrasena_encriptada = password_hash($contrasena, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, correo, contrasena, rol, estado) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $nombre, $correo, $contrasena_encriptada, $rol, $estado);

    if ($stmt->execute()) {
        sendResponse(true, ['id' => $conn->insert_id], 'Usuario creado correctamente');
    } else {
        sendResponse(false, null, 'Error al crear usuario: ' . $stmt->error);
    }
}

/**
 * Update an existing user
 */
function updateUser($conn) {
    $input = getJsonInput();

    $id = intval($input['id'] ?? 0);
    $nombre = trim($input['nombre'] ?? '');
    $correo = strtolower(trim($input['correo'] ?? ''));
    $contrasena = $input['contrasena'] ?? '';
    $rol = $input['rol'] ?? 'vendedor';
    $estado = $input['estado'] ?? 'activo';

    if ($id <= 0 || empty($nombre) || empty($correo)) {
        sendResponse(false, null, 'Datos incompletos');
    }

    // Check for duplicate email (excluding current user)
    $checkStmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ? AND id != ?");
    $checkStmt->bind_param("si", $correo, $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        sendResponse(false, null, 'Ya existe otro usuario con ese correo');
    }

    // Update with or without password
    if (!empty($contrasena)) {
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, correo = ?, contrasena = ?, rol = ?, estado = ? WHERE id = ?");
        $stmt->bind_param("sssssi", $nombre, $correo, $contrasena, $rol, $estado, $id);
    } else {
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, estado = ? WHERE id = ?");
        $stmt->bind_param("ssssi", $nombre, $correo, $rol, $estado, $id);
    }

    if ($stmt->execute()) {
        sendResponse(true, null, 'Usuario actualizado correctamente');
    } else {
        sendResponse(false, null, 'Error al actualizar: ' . $stmt->error);
    }
}

/**
 * Delete a user
 */
function deleteUser($conn) {
    $input = getJsonInput();
    $id = intval($input['id'] ?? ($_GET['id'] ?? 0));

    if ($id <= 0) {
        sendResponse(false, null, 'ID invalido');
    }

    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        sendResponse(true, null, 'Usuario eliminado correctamente');
    } else {
        sendResponse(false, null, 'Error al eliminar: ' . $stmt->error);
    }
}
?>