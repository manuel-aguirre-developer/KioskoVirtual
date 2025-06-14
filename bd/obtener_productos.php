<?php
header('Content-Type: application/json');
include '../General/conexion.php';

// Comprobar si la conexión a la base de datos es exitosa
if (!$conexion) {
    echo json_encode(["error" => "Conexión fallida"]);
    exit;
}

// Consulta para obtener productos
$query = "SELECT * FROM productos";
$result = mysqli_query($conexion, $query);

// Comprobar si hay un error con la consulta
if (!$result) {
    echo json_encode(["error" => "Error en la consulta: " . mysqli_error($conexion)]);
    exit;
}

$productos = [];
while ($row = mysqli_fetch_assoc($result)) {
    $productos[] = $row;
}

echo json_encode($productos);
?>
