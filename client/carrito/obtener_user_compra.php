<?php
session_start();
header('Content-Type: application/json');
include '../../General/conexion.php';

// Verificar si el usuario está logueado
if (!isset($_SESSION['usuario'])) {
    echo json_encode(["logueado" => false]);
    exit;
}

// Obtener el ID del usuario desde la sesión
$id = $_SESSION['usuario']['id'];

// Consulta SQL
$sql = "SELECT id, usuario, email, curso, estado FROM usuarios WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $usuario_data = $resultado->fetch_assoc();

    echo json_encode([
        "logueado" => true,
        "id_usuario" => $id,  // Agregar el id del usuario
        "usuario" => $usuario_data['usuario'],
        "email" => $usuario_data['email'],
        "curso" => $usuario_data['curso'],
        "estado" => $usuario_data['estado'] // Esto se usa en el switch del frontend
    ]);
} else {
    echo json_encode(["logueado" => false]);
}

$stmt->close();
$conexion->close();
?>
