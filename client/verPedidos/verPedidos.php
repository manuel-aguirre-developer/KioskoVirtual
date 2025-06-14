<?php
session_start();
include '../../General/conexion.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario']['id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$id_usuario = intval($_SESSION['usuario']['id']);

$sql = "SELECT v.id, v.id_usuario, u.usuario AS nombre_usuario, v.fecha_venta, v.total, v.estado_pedido
        FROM ventas v
        JOIN usuarios u ON v.id_usuario = u.id
        WHERE v.id_usuario = ?
        AND v.fecha_venta >= NOW() - INTERVAL 7 DAY
        ORDER BY v.fecha_venta DESC";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$pedidos = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $pedidos[] = $row;
    }
    echo json_encode($pedidos);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la consulta: ' . $conexion->error]);
}
