<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include '../../General/conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$nuevoEstado = $data['estado'] ?? '';

if (!isset($id) || !isset($nuevoEstado) || $nuevoEstado === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos inválidos."]);
    exit;
}
// Actualizar estado
$stmt = $conexion->prepare("UPDATE ventas SET estado_pedido = ? WHERE id = ?");
$stmt->bind_param("si", $nuevoEstado, $id);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true, "estado" => $nuevoEstado]);
