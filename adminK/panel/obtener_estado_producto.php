<?php
include '../../General/conexion.php';  // Tu conexión a la base de datos

header('Content-Type: application/json');

// Consulta para saber si todos los productos están activos
// Esto asume que en la tabla 'productos' hay una columna 'estado' con valores 'activo' o 'inactivo'

$result = $conexion->query("SELECT COUNT(*) as total, SUM(estado = 'activo') as activos FROM productos");

if ($row = $result->fetch_assoc()) {
    $total = (int)$row['total'];
    $activos = (int)$row['activos'];

    if ($total === $activos && $total > 0) {
        // Todos activos
        echo json_encode(['estado' => 'activo']);
    } else {
        // Al menos uno inactivo o no hay productos
        echo json_encode(['estado' => 'inactivo']);
    }
} else {
    echo json_encode(['estado' => 'desconocido']);
}
?>
