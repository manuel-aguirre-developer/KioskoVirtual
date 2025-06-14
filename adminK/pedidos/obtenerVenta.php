<?php
ob_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include '../../General/conexion.php';

header('Content-Type: application/json');

if (!$conexion) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la conexión a la base de datos']);
    exit;
}

if (!isset($_GET['id_venta'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetro id_venta requerido']);
    exit;
}

$id_venta = intval($_GET['id_venta']);

$sql = "SELECT v.id, v.id_usuario, u.usuario AS nombre_usuario, u.curso AS curso_usuario, v.fecha_venta, v.total, v.estado_pedido, v.abono
FROM ventas v
JOIN usuarios u ON v.id_usuario = u.id
WHERE v.id = ?  ";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta de venta']);
    exit;
}

$stmt->bind_param("i", $id_venta);
$stmt->execute();
$venta = $stmt->get_result()->fetch_assoc();

if (!$venta) {
    http_response_code(404);
    echo json_encode(['error' => 'Venta no encontrada']);
    exit;
}

$sqlProductos = "SELECT 
    dv.id AS id_detalles_venta, 
    dv.id_venta, 
    p.nombre AS nombre_producto, 
    dv.cantidad, 
    dv.subtotal, 
    v.pago_en, 
    v.mensaje
FROM detalles_venta dv
JOIN productos p ON dv.id_producto = p.id
JOIN ventas v ON dv.id_venta = v.id
WHERE dv.id_venta = ?";

$stmtProductos = $conexion->prepare($sqlProductos);
if (!$stmtProductos) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta de productos']);
    exit;
}

$stmtProductos->bind_param("i", $id_venta);
$stmtProductos->execute();
$resultProductos = $stmtProductos->get_result();

$productos = [];
while ($row = $resultProductos->fetch_assoc()) {
    $productos[] = $row;
}

$venta['productos'] = $productos;

ob_end_clean();
echo json_encode($venta);
