<?php
$host = "138.219.42.29"; // IP pública del servidor MySQL remoto
$usuario = "kiosko_user";
$clave = "aapc";
$bd = "kiosko";

$conexion = new mysqli($host, $usuario, $clave, $bd);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
?>
