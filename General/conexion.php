<?php
$host = "localhost:3307"; // Cambia esto si tienes otro puerto en tu BD
$usuario = "root";  // Cambia esto si tienes otro usuario en tu BD
$clave = "biblioteca4";        // Cambia si tienes contraseña en tu BD
$bd = "kiosko";

$conexion = new mysqli($host, $usuario, $clave, $bd);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
?>
