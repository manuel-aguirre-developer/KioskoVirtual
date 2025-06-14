<?php
header('Content-Type: application/json; charset=utf-8');
include('../../General/conexion.php');

$periodo = $_GET['periodo'] ?? 'semana';

switch ($periodo) {
    case 'mes_pasado':
        $fecha_inicio = date('Y-m-d', strtotime('-60 days'));
        $fecha_fin = date('Y-m-d', strtotime('-30 days'));
        break;

    case 'mes':
        $fecha_inicio = date('Y-m-d', strtotime('-30 days'));
        $fecha_fin = date('Y-m-d');
        break;

    case 'semana':
    default:
        $fecha_inicio = date('Y-m-d', strtotime('-7 days'));
        $fecha_fin = date('Y-m-d');
        break;
}

// Consulta top 5 más vendidos
$sql_mas = "SELECT p.id, p.nombre, 
                   COALESCE(SUM(dv.cantidad), 0) AS total_vendido,
                   COALESCE(SUM(dv.cantidad * p.precio), 0) AS total_generado
            FROM productos p
            LEFT JOIN detalles_venta dv ON p.id = dv.id_producto
            LEFT JOIN ventas v ON dv.id_venta = v.id 
                   AND v.fecha_venta BETWEEN ? AND ?
            GROUP BY p.id, p.nombre
            ORDER BY total_vendido DESC
            LIMIT 5";

$stmt_mas = $conexion->prepare($sql_mas);
$stmt_mas->bind_param("ss", $fecha_inicio, $fecha_fin);
$stmt_mas->execute();
$resultado_mas = $stmt_mas->get_result();

$mas_vendidos = [];
while ($fila = $resultado_mas->fetch_assoc()) {
    $mas_vendidos[] = $fila;
}

// Consulta top 5 menos vendidos (con al menos 1 venta)
$sql_menos = "SELECT p.id, p.nombre, 
                COALESCE(SUM(dv.cantidad), 0) AS total_vendido,
                COALESCE(SUM(dv.cantidad * p.precio), 0) AS total_generado
        FROM productos p
        LEFT JOIN detalles_venta dv ON p.id = dv.id_producto
        LEFT JOIN ventas v ON dv.id_venta = v.id 
                       AND v.fecha_venta BETWEEN ? AND ?
        GROUP BY p.id, p.nombre
        ORDER BY total_vendido ASC
        LIMIT 5";

$stmt_menos = $conexion->prepare($sql_menos);
$stmt_menos->bind_param("ss", $fecha_inicio, $fecha_fin);
$stmt_menos->execute();
$resultado_menos = $stmt_menos->get_result();

$menos_vendidos = [];
while ($fila = $resultado_menos->fetch_assoc()) {
    $menos_vendidos[] = $fila;
}

echo json_encode([
    "mas_vendidos" => $mas_vendidos,
    "menos_vendidos" => $menos_vendidos
]);
