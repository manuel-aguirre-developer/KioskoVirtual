<?php
include '../../General/conexion.php';

header('Content-Type: application/json');

$periodo = $_GET['periodo'] ?? 'semana';

switch ($periodo) {
    case 'mes_pasado':
        // Mes calendario anterior (del 1 al último día del mes anterior)
        $fecha_inicio = date('Y-m-01 00:00:00', strtotime('first day of last month'));
        $fecha_fin = date('Y-m-t 23:59:59', strtotime('last day of last month'));
        break;

    case 'mes':
        // Mes calendario actual
        $fecha_inicio = date('Y-m-01 00:00:00');
        $fecha_fin = date('Y-m-t 23:59:59');
        break;

    case 'semana':
    default:
        // Semana actual (lunes a domingo)
        $fecha_inicio = date('Y-m-d 00:00:00', strtotime('monday this week'));
        $fecha_fin = date('Y-m-d 23:59:59', strtotime('sunday this week'));
        break;
}

// Consulta total por método de pago según período
$sql = "SELECT v.pago_en, COALESCE(SUM(dv.subtotal), 0) AS total_pago
        FROM ventas v
        JOIN detalles_venta dv ON v.id = dv.id_venta
        WHERE v.fecha_venta BETWEEN ? AND ?
        GROUP BY v.pago_en
        ORDER BY total_pago DESC";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("ss", $fecha_inicio, $fecha_fin);
$stmt->execute();
$resultado = $stmt->get_result();

$totales_por_pago = [];
while ($fila = $resultado->fetch_assoc()) {
    $totales_por_pago[$fila['pago_en']] = floatval($fila['total_pago']);
}

// Consulta total generado HOY (global)
$total_hoy = 0;
if ($periodo !== 'mes_pasado') {
    $sql_hoy = "SELECT COALESCE(SUM(dv.subtotal), 0) AS total_hoy
                FROM ventas v
                JOIN detalles_venta dv ON v.id = dv.id_venta
                WHERE DATE(v.fecha_venta) = CURDATE()";

    $resultado_hoy = $conexion->query($sql_hoy);
    $fila_hoy = $resultado_hoy->fetch_assoc();
    $total_hoy = floatval($fila_hoy['total_hoy']);
}

// Consulta total generado en el período
$sql_periodo = "SELECT COALESCE(SUM(dv.subtotal), 0) AS total_periodo
                FROM ventas v
                JOIN detalles_venta dv ON v.id = dv.id_venta
                WHERE v.fecha_venta BETWEEN ? AND ?";

$stmt_periodo = $conexion->prepare($sql_periodo);
$stmt_periodo->bind_param("ss", $fecha_inicio, $fecha_fin);
$stmt_periodo->execute();
$resultado_periodo = $stmt_periodo->get_result();
$fila_periodo = $resultado_periodo->fetch_assoc();
$total_periodo = floatval($fila_periodo['total_periodo']);

// Total generado final (sin sumar total_hoy para evitar duplicados)
$total_generado = $total_periodo;

// Armar arreglo final de pagos
$datos = [];
foreach ($totales_por_pago as $pago_en => $total_pago) {
    $datos[] = [
        'pago_en' => $pago_en,
        'total_pago' => $total_pago
    ];
}

echo json_encode([
    'pagos' => $datos,
    'total_hoy' => $total_hoy,
    'total_generado' => $total_generado
]);
