<?php
include '../../General/conexion.php';
header('Content-Type: application/json');

$periodo = $_GET['periodo'] ?? 'semana';

switch ($periodo) {
    case 'mes':
        $fecha_inicio = date('Y-m-01 00:00:00');
        $fecha_fin = date('Y-m-t 23:59:59');
        $fecha_inicio_pasado = date('Y-m-01 00:00:00', strtotime('first day of last month'));
        $fecha_fin_pasado = date('Y-m-t 23:59:59', strtotime('last day of last month'));
        break;

    case 'mes_pasado':
        $fecha_inicio = date('Y-m-01 00:00:00', strtotime('first day of last month'));
        $fecha_fin = date('Y-m-t 23:59:59', strtotime('last day of last month'));
        $fecha_inicio_pasado = null;
        $fecha_fin_pasado = null;
        break;

    case 'semana':
    default:
        $fecha_inicio = date('Y-m-d 00:00:00', strtotime('monday this week'));
        $fecha_fin = date('Y-m-d 23:59:59', strtotime('sunday this week'));
        $fecha_inicio_pasado = date('Y-m-d 00:00:00', strtotime('monday last week'));
        $fecha_fin_pasado = date('Y-m-d 23:59:59', strtotime('sunday last week'));
        break;
}

// Total por método de pago en período actual
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

// Total de HOY (solo si el período no es mes_pasado)
$total_hoy = 0;
if ($periodo !== 'mes_pasado') {
    $sql_hoy = "SELECT COALESCE(SUM(dv.subtotal), 0) AS total_hoy
                FROM ventas v
                JOIN detalles_venta dv ON v.id = dv.id_venta
                WHERE DATE(v.fecha_venta) = CURDATE()";
    $res_hoy = $conexion->query($sql_hoy);
    $fila_hoy = $res_hoy->fetch_assoc();
    $total_hoy = floatval($fila_hoy['total_hoy']);
}

// Total generado en el período actual
$sql_periodo = "SELECT COALESCE(SUM(dv.subtotal), 0) AS total_periodo
                FROM ventas v
                JOIN detalles_venta dv ON v.id = dv.id_venta
                WHERE v.fecha_venta BETWEEN ? AND ?";
$stmt_periodo = $conexion->prepare($sql_periodo);
$stmt_periodo->bind_param("ss", $fecha_inicio, $fecha_fin);
$stmt_periodo->execute();
$res_periodo = $stmt_periodo->get_result();
$fila_periodo = $res_periodo->fetch_assoc();
$total_periodo = floatval($fila_periodo['total_periodo']);

// Total del período anterior (solo si aplica)
$total_pasado = 0;
if ($fecha_inicio_pasado && $fecha_fin_pasado) {
    $sql_pasado = "SELECT COALESCE(SUM(dv.subtotal), 0) AS total_pasado
                   FROM ventas v
                   JOIN detalles_venta dv ON v.id = dv.id_venta
                   WHERE v.fecha_venta BETWEEN ? AND ?";
    $stmt_pasado = $conexion->prepare($sql_pasado);
    $stmt_pasado->bind_param("ss", $fecha_inicio_pasado, $fecha_fin_pasado);
    $stmt_pasado->execute();
    $res_pasado = $stmt_pasado->get_result();
    $fila_pasado = $res_pasado->fetch_assoc();
    $total_pasado = floatval($fila_pasado['total_pasado']);
}

// Preparar datos para JSON
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
    'total_generado' => $total_periodo,
    'total_pasado' => $total_pasado
]);
?>
