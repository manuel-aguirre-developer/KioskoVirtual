<?php
include '../../General/conexion.php';
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id']) || !isset($data['estado'])) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$id = $data['id'];
$estado = $data['estado'];

$response = ['success' => false];

if ($id && in_array($estado, ['activo', 'inactivo'])) {
    $stmt = $conexion->prepare("UPDATE productos SET estado = ? WHERE id = ?");
    $stmt->bind_param("si", $estado, $id);
    if ($stmt->execute()) {
        $response['success'] = true;
    }
    $stmt->close();
}

$conexion->close();
echo json_encode($response);
