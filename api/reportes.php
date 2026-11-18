<?php
/**
 * Reports endpoint
 * Returns statistics about the inventory
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, null, 'Metodo no permitido');
}

// Total products
$result = $conn->query("SELECT COUNT(*) AS total FROM productos");
$totalProductos = intval($result->fetch_assoc()['total']);

// Total stock
$result = $conn->query("SELECT COALESCE(SUM(stock), 0) AS total FROM productos");
$totalStock = intval($result->fetch_assoc()['total']);

// Total inventory value
$result = $conn->query("SELECT COALESCE(SUM(precio * stock), 0) AS total FROM productos");
$valorTotal = floatval($result->fetch_assoc()['total']);

// Low stock products
$result = $conn->query("SELECT COUNT(*) AS total FROM productos WHERE stock < 5");
$stockBajo = intval($result->fetch_assoc()['total']);

// Sales and purchases totals
$result = $conn->query("SELECT
    SUM(CASE WHEN tipo = 'venta' THEN 1 ELSE 0 END) AS ventas,
    SUM(CASE WHEN tipo = 'compra' THEN 1 ELSE 0 END) AS compras,
    COALESCE(SUM(CASE WHEN tipo = 'venta' THEN cantidad ELSE 0 END), 0) AS unidades_vendidas,
    COALESCE(SUM(CASE WHEN tipo = 'compra' THEN cantidad ELSE 0 END), 0) AS unidades_compradas
    FROM movimientos");
$movStats = $result->fetch_assoc();

sendResponse(true, [
    'stats' => [
        'total_productos' => $totalProductos,
        'total_stock' => $totalStock,
        'valor_inventario' => $valorTotal,
        'productos_stock_bajo' => $stockBajo,
        'total_ventas' => intval($movStats['ventas'] ?? 0),
        'total_compras' => intval($movStats['compras'] ?? 0),
        'unidades_vendidas' => intval($movStats['unidades_vendidas'] ?? 0),
        'unidades_compradas' => intval($movStats['unidades_compradas'] ?? 0)
    ]
]);
?>