<?php
date_default_timezone_set("America/Argentina/Buenos_Aires");
header("Content-Type: application/json");
include '../../General/conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["error" => "Datos JSON no recibidos o mal formados."]);
    exit;
}

$id_usuario = $data['id_usuario'];
$estado_pedido = $data['estado_pedido'];
$productos = $data['productos'];
$mensaje = isset($data['mensaje']) ? $data['mensaje'] : '';
$pago_en = isset($data['pago_en']) ? $data['pago_en'] : '';
$abono = isset($data['abono']) ? floatval($data['abono']) : 0;

$fecha_venta = date("Y-m-d H:i");

// Agrupar productos por ID sumando cantidades y subtotales
$productosAgrupados = [];
foreach ($productos as $producto) {
    $id = $producto['id'];
    if (!isset($productosAgrupados[$id])) {
        $productosAgrupados[$id] = [
            'id' => $producto['id'],
            'precio' => $producto['precio'],
            'cantidad' => $producto['cantidad'],
            'subtotal' => $producto['precio'] * $producto['cantidad']
        ];
    } else {
        $productosAgrupados[$id]['cantidad'] += $producto['cantidad'];
        $productosAgrupados[$id]['subtotal'] += $producto['precio'] * $producto['cantidad'];
    }
}

// Calcular total
$total = 0;
foreach ($productosAgrupados as $producto) {
    $total += $producto['subtotal'];
}

// Insertar en tabla ventas (mensaje y pago_en ahora están aquí)
$sqlVenta = "INSERT INTO ventas (id_usuario, fecha_venta, total, estado_pedido, mensaje, pago_en, abono) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmtVenta = $conexion->prepare($sqlVenta);
if (!$stmtVenta) {
    echo json_encode(["error" => "Error en la preparación de la venta: " . $conexion->error]);
    exit;
}
$stmtVenta->bind_param("isdsssd", $id_usuario, $fecha_venta, $total, $estado_pedido, $mensaje, $pago_en, $abono);
if (!$stmtVenta->execute()) {
    echo json_encode(["error" => "Error al registrar la venta: " . $stmtVenta->error]);
    exit;
}
$id_venta = $stmtVenta->insert_id;
$stmtVenta->close();

// Insertar detalles de venta (sin mensaje ni pago_en)
$sqlDetalle = "INSERT INTO detalles_venta (id_venta, id_producto, subtotal, cantidad) VALUES (?, ?, ?, ?)";
$stmtDetalle = $conexion->prepare($sqlDetalle);
if (!$stmtDetalle) {
    echo json_encode(["error" => "Error en preparación de detalle: " . $conexion->error]);
    exit;
}

foreach ($productosAgrupados as $producto) {
    $id_producto = $producto['id'];
    $cantidad = $producto['cantidad'];
    $subtotal = $producto['subtotal'];
    $stmtDetalle->bind_param("iidi", $id_venta, $id_producto, $subtotal, $cantidad);
    if (!$stmtDetalle->execute()) {
        echo json_encode(["error" => "Error al insertar detalle: " . $stmtDetalle->error]);
        exit;
    }
}

$stmtDetalle->close();

echo json_encode(["success" => "Venta registrada correctamente."]);
