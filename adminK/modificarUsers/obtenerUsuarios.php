<?php
include '../../General/conexion.php';

$sql = "SELECT id, usuario, email, estado FROM usuarios ORDER BY id DESC";
$result = $conexion->query($sql);
$usuarios = [];

while ($row = $result->fetch_assoc()) {
    $usuarios[] = $row;
}

header('Content-Type: application/json');
echo json_encode($usuarios);
