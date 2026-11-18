<?php
/**
 * Database connection configuration
 * This file is included by all API endpoints
 */

// Prevent direct access warnings
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'claveRoot123');
define('DB_NAME', 'inventario_db');

// Create connection using MySQLi
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexion: ' . $conn->connect_error
    ]);
    exit;
}

// Set character set to UTF-8
$conn->set_charset('utf8mb4');

// Set response headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Send a JSON response and stop execution
 * @param bool $success - Whether the operation was successful
 * @param mixed $data - The data to send
 * @param string $message - Optional message
 */
function sendResponse($success, $data = null, $message = '') {
    $response = ['success' => $success];

    if ($data !== null) {
        $response = array_merge($response, $data);
    }

    if ($message !== '') {
        $response['message'] = $message;
    }

    echo json_encode($response);
    exit;
}

/**
 * Read JSON input from the request body
 * @return array The decoded JSON data
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}
?>