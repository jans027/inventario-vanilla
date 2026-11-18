<?php
/**
 * Login endpoint
 * Handles user authentication
 */

require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Metodo no permitido');
}

// Get input data
$input = getJsonInput();

$correo = trim($input['correo'] ?? '');
$contrasena = $input['contrasena'] ?? '';

// Validate required fields
if (empty($correo) || empty($contrasena)) {
    sendResponse(false, null, 'Por favor complete todos los campos');
}

// Prepare query to find the user
$stmt = $conn->prepare("SELECT id, nombre, correo, contrasena, rol, estado FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows === 0) {
    sendResponse(false, null, 'Correo o contrasena incorrectos');
}

$user = $result->fetch_assoc();

// Verify password (plain text for now, use password_verify later)
if ($user['contrasena'] !== $contrasena) {
    sendResponse(false, null, 'Correo o contrasena incorrectos');
}

// Check if user is active
if ($user['estado'] !== 'activo') {
    sendResponse(false, null, 'El usuario esta inactivo');
}

// Remove password from response
unset($user['contrasena']);

// Return user data
sendResponse(true, ['user' => $user], 'Inicio de sesion exitoso');

$stmt->close();
$conn->close();
?>