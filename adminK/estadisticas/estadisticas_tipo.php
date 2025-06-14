<?php
include '../../General/conexion.php';

header('Content-Type: application/json');
$filtro_tipo = $_GET['tipo'] ?? null;
$periodo = $_GET['periodo'] ?? 'semana';

switch ($periodo) {
    case 'mes_pasado':
        // Mes calendario anterior (1 al último día del mes anterior)
        $fecha_inicio = date('Y-m-01 00:00:00', strtotime('first day of last month'));
        $fecha_fin = date('Y-m-t 23:59:59', strtotime('last day of last month'));
        break;

    case 'mes':
        // Mes calendario actual (1 al último día del mes actual)
        $fecha_inicio = date('Y-m-01 00:00:00');
        $fecha_fin = date('Y-m-t 23:59:59');
        break;

    case 'semana':
    default:
        // Semana natural actual (lunes a domingo)
        $fecha_inicio = date('Y-m-d 00:00:00', strtotime('monday this week'));
        $fecha_fin = date('Y-m-d 23:59:59', strtotime('sunday this week'));
        break;
}

// Construcción dinámica del SQL
$sql = "SELECT p.tipo, SUM(dv.subtotal) AS total_generado 
        FROM detalles_venta dv
        JOIN productos p ON dv.id_producto = p.id
        JOIN ventas v ON dv.id_venta = v.id
        WHERE v.fecha_venta BETWEEN ? AND ?";

if ($filtro_tipo) {
    $sql .= " AND p.tipo = ?";
}

$sql .= " GROUP BY p.tipo ORDER BY total_generado DESC";

$stmt = $conexion->prepare($sql);

// Enlazar parámetros dinámicamente
if ($filtro_tipo) {
    $stmt->bind_param("sss", $fecha_inicio, $fecha_fin, $filtro_tipo);
} else {
    $stmt->bind_param("ss", $fecha_inicio, $fecha_fin);
}

$stmt->execute();
$resultado = $stmt->get_result();

$datos = [];
$total_generado = 0;
while ($fila = $resultado->fetch_assoc()) {
    $datos[] = $fila;
    $total_generado += floatval($fila['total_generado']);
}

// Consulta para hoy si se usa ese filtro en el futuro
if ($periodo === 'hoy') {
    $sql_hoy = "SELECT COALESCE(SUM(dv.subtotal),0) AS total_hoy
                FROM detalles_venta dv
                JOIN ventas v ON dv.id_venta = v.id
                WHERE DATE(v.fecha_venta) = CURDATE()";

    $resultado_hoy = $conexion->query($sql_hoy);
    $fila_hoy = $resultado_hoy->fetch_assoc();
    $total_generado = floatval($fila_hoy['total_hoy']);
}

echo json_encode([
    'datos' => $datos,
    'total_generado' => $total_generado
]);
