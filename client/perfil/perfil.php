<?php
session_start();
include '../../General/conexion.php';

// Verifica si el usuario está logueado
if (isset($_SESSION['usuario'])) {
    $id_usuario = $_SESSION['usuario']['id'];

    // Consulta para obtener los datos del usuario
    $sql = "SELECT * FROM usuarios WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $usuario = $resultado->fetch_assoc();
        echo json_encode([
            'logueado' => true,
            'usuario' => $usuario
        ]);
    } else {
        echo json_encode(['logueado' => false]);
    }

    $stmt->close();
} else {
    echo json_encode(['logueado' => false]);
}

$conexion->close();
?>
