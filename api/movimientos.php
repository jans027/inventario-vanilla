<?php
/**
 * Movements endpoint
 * Handles sales and purchases, updating product stock
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getAllMovements($conn);
        break;

    case 'POST':
        createMovement($conn);
        break;

    default:
        sendResponse(false, null, 'Metodo no permitido');
}

/**
 * Get all movements with product and user names
 */
function getAllMovements($conn) {
    $sql = "SELECT m.id, m.tipo, m.producto_id, m.cantidad, m.precio, m.total, m.fecha,
                   p.nombre AS producto_nombre,
                   u.nombre AS usuario_nombre
            FROM movimientos m
            INNER JOIN productos p ON m.producto_id = p.id
            INNER JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.id DESC";

    $result = $conn->query($sql);

    $movements = [];
    while ($row = $result->fetch_assoc()) {
        $movements[] = [
            'id' => intval($row['id']),
            'tipo' => $row['tipo'],
            'producto_id' => intval($row['producto_id']),
            'producto_nombre' => $row['producto_nombre'],
            'cantidad' => intval($row['cantidad']),
            'precio' => floatval($row['precio']),
            'total' => floatval($row['total']),
            'usuario_nombre' => $row['usuario_nombre'],
            'fecha' => $row['fecha']
        ];
    }

    sendResponse(true, ['movements' => $movements]);
}

/**
 * Create a new movement (sale or purchase)
 * Uses a transaction to ensure data integrity
 */
function createMovement($conn) {
    $input = getJsonInput();

    $tipo = $input['tipo'] ?? '';
    $producto_id = intval($input['producto_id'] ?? 0);
    $cantidad = intval($input['cantidad'] ?? 0);
    $usuario_id = intval($input['usuario_id'] ?? 0);

    // Validations
    if (!in_array($tipo, ['venta', 'compra'])) {
        sendResponse(false, null, 'Tipo de movimiento invalido');
    }

    if ($producto_id <= 0 || $cantidad <= 0 || $usuario_id <= 0) {
        sendResponse(false, null, 'Datos incompletos');
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Get product info with row lock
        $stmt = $conn->prepare("SELECT nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE");
        $stmt->bind_param("i", $producto_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception('Producto no encontrado');
        }

        $product = $result->fetch_assoc();
        $precio = floatval($product['precio']);
        $stockActual = intval($product['stock']);

        // Check stock for sales
        if ($tipo === 'venta' && $cantidad > $stockActual) {
            throw new Exception("No hay suficiente stock. Disponible: $stockActual");
        }

        // Calculate new stock
        $nuevoStock = ($tipo === 'venta')
            ? $stockActual - $cantidad
            : $stockActual + $cantidad;

        // Update product stock
        $updateStmt = $conn->prepare("UPDATE productos SET stock = ? WHERE id = ?");
        $updateStmt->bind_param("ii", $nuevoStock, $producto_id);
        $updateStmt->execute();

        // Insert movement
        $total = $precio * $cantidad;
        $insertStmt = $conn->prepare("INSERT INTO movimientos (tipo, producto_id, cantidad, precio, total, usuario_id) VALUES (?, ?, ?, ?, ?, ?)");
        $insertStmt->bind_param("siiddi", $tipo, $producto_id, $cantidad, $precio, $total, $usuario_id);
        $insertStmt->execute();

        // Commit transaction
        $conn->commit();

        sendResponse(true, [
            'movimiento_id' => $conn->insert_id,
            'nuevo_stock' => $nuevoStock
        ], 'Movimiento registrado correctamente');

    } catch (Exception $e) {
        $conn->rollback();
        sendResponse(false, null, $e->getMessage());
    }
}
?>