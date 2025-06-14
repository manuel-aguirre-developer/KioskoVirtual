<?php
include '../../General/conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$estado = $data['estado'];

$sql = "UPDATE usuarios SET estado = ? WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("si", $estado, $id);

$response = ['success' => false];
if ($stmt->execute()) {
    $response['success'] = true;
}

header('Content-Type: application/json');
echo json_encode($response);
