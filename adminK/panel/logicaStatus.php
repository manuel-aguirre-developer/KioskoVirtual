<?php
header('Content-Type: application/json');
include '../../General/conexion.php'; // Cambia esto al nombre y path correcto de tu conexión a BD

// Obtener la cantidad de productos activos
$sql = "SELECT COUNT(*) AS activos FROM productos WHERE estado = 'activo'";
$result = $conexion->query($sql);
$row = $result->fetch_assoc();

if ($row['activos'] > 0) {
    // Hay productos activos, los desactivamos todos
    $update = "UPDATE productos SET estado = 'inactivo'";
    $nuevoEstado = 'inactivo';
} else {
    // No hay activos, activamos todos
    $update = "UPDATE productos SET estado = 'activo'";
    $nuevoEstado = 'activo';
}

if ($conexion->query($update)) {
    echo json_encode(['nuevoEstado' => $nuevoEstado]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo actualizar el estado de productos']);
}
