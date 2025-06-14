<?php
include '../../General/conexion.php';

header('Content-Type: application/json');

if (!isset($_GET['id_venta'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetro id_venta requerido']);
    exit;
}

$id_venta = intval($_GET['id_venta']);
    
$sql = "SELECT 
            dv.id_producto,
            p.nombre AS nombre_producto,
            dv.cantidad,
            dv.subtotal,
            v.mensaje,
            v.pago_en,
            v.abono
        FROM detalles_venta dv
        JOIN productos p ON dv.id_producto = p.id
        JOIN ventas v ON dv.id_venta = v.id
        WHERE dv.id_venta = ?";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la preparación de la consulta']);
    exit;
}

$stmt->bind_param("i", $id_venta);
$stmt->execute();
$result = $stmt->get_result();

$detalles = [];

while ($row = $result->fetch_assoc()) {
    $detalles[] = $row;
}

echo json_encode($detalles);
?>
