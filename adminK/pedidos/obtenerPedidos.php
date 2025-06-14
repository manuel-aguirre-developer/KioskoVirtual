<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include '../../General/conexion.php';

if (!$conexion) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la conexión a la base de datos']);
    exit;
}

function getPedidos($conexion)
{
    $sql = "SELECT id, id_usuario, fecha_venta, total, estado_pedido 
        FROM ventas 
        WHERE DATE(fecha_venta) = CURDATE() - INTERVAL 2 DAY
        ORDER BY id DESC";

    $result = $conexion->query($sql);
    $ventas = [];

    while ($row = $result->fetch_assoc()) {
        $ventas[] = $row;
    }
    return $ventas;
}

function pedidosHash($pedidos)
{
    return md5(json_encode($pedidos));
}

// Obtener hash enviado por el cliente (puede venir en GET o POST)
$lastHash = $_GET['lastHash'] ?? '';

// Tiempo máximo que esperaremos (en segundos)
$timeout = 1000000;
$start = time();

do {
    $pedidos = getPedidos($conexion);
    $currentHash = pedidosHash($pedidos);

    if ($currentHash !== $lastHash) {
        // Hubo cambio, respondemos con datos nuevos
        header('Content-Type: application/json');
        echo json_encode($pedidos);
        exit;
    }

    // No hubo cambio, esperamos un poco y volvemos a chequear
    usleep(500000); // 0.5 segundos

} while ((time() - $start) < $timeout);

// Timeout alcanzado sin cambios, enviamos respuesta vacía o la misma lista para que cliente refresque
header('Content-Type: application/json');
echo json_encode([]);
