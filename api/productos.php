<?php
/**
 * Products endpoint
 * Handles CRUD operations for products
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List all products or get a single product
        if (isset($_GET['id'])) {
            getProductById($conn, intval($_GET['id']));
        } else {
            getAllProducts($conn);
        }
        break;

    case 'POST':
        createProduct($conn);
        break;

    case 'PUT':
        updateProduct($conn);
        break;

    case 'DELETE':
        deleteProduct($conn);
        break;

    default:
        sendResponse(false, null, 'Metodo no permitido');
}

/**
 * Get all products
 */
function getAllProducts($conn) {
    $result = $conn->query("SELECT * FROM productos ORDER BY id DESC");

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => intval($row['id']),
            'nombre' => $row['nombre'],
            'descripcion' => $row['descripcion'],
            'precio' => floatval($row['precio']),
            'stock' => intval($row['stock']),
            'categoria' => $row['categoria']
        ];
    }

    sendResponse(true, ['products' => $products]);
}

/**
 * Get a single product by ID
 */
function getProductById($conn, $id) {
    $stmt = $conn->prepare("SELECT * FROM productos WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendResponse(false, null, 'Producto no encontrado');
    }

    $row = $result->fetch_assoc();
    $product = [
        'id' => intval($row['id']),
        'nombre' => $row['nombre'],
        'descripcion' => $row['descripcion'],
        'precio' => floatval($row['precio']),
        'stock' => intval($row['stock']),
        'categoria' => $row['categoria']
    ];

    sendResponse(true, ['product' => $product]);
}

/**
 * Create a new product
 */
function createProduct($conn) {
    $input = getJsonInput();

    $nombre = trim($input['nombre'] ?? '');
    $descripcion = trim($input['descripcion'] ?? '');
    $precio = floatval($input['precio'] ?? 0);
    $stock = intval($input['stock'] ?? 0);
    $categoria = trim($input['categoria'] ?? '');

    if (empty($nombre) || empty($categoria)) {
        sendResponse(false, null, 'El nombre y la categoria son obligatorios');
    }

    $stmt = $conn->prepare("INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdis", $nombre, $descripcion, $precio, $stock, $categoria);

    if ($stmt->execute()) {
        sendResponse(true, ['id' => $conn->insert_id], 'Producto creado correctamente');
    } else {
        sendResponse(false, null, 'Error al crear el producto: ' . $stmt->error);
    }
}

/**
 * Update an existing product
 */
function updateProduct($conn) {
    $input = getJsonInput();

    $id = intval($input['id'] ?? 0);
    $nombre = trim($input['nombre'] ?? '');
    $descripcion = trim($input['descripcion'] ?? '');
    $precio = floatval($input['precio'] ?? 0);
    $stock = intval($input['stock'] ?? 0);
    $categoria = trim($input['categoria'] ?? '');

    if ($id <= 0 || empty($nombre) || empty($categoria)) {
        sendResponse(false, null, 'Datos incompletos');
    }

    $stmt = $conn->prepare("UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?");
    $stmt->bind_param("ssdisi", $nombre, $descripcion, $precio, $stock, $categoria, $id);

    if ($stmt->execute()) {
        sendResponse(true, null, 'Producto actualizado correctamente');
    } else {
        sendResponse(false, null, 'Error al actualizar: ' . $stmt->error);
    }
}

/**
 * Delete a product
 */
function deleteProduct($conn) {
    $input = getJsonInput();
    $id = intval($input['id'] ?? ($_GET['id'] ?? 0));

    if ($id <= 0) {
        sendResponse(false, null, 'ID invalido');
    }

    $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        sendResponse(true, null, 'Producto eliminado correctamente');
    } else {
        sendResponse(false, null, 'Error al eliminar: ' . $stmt->error);
    }
}
?>