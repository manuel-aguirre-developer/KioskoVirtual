<?php
$host = "localhost:3307"; // IP pública del servidor MySQL remoto
$usuario = "root";
$clave = "biblioteca4";
$bd = "kiosko";

$conexion = new mysqli($host, $usuario, $clave, $bd);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
?>
