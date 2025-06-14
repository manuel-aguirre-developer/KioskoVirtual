<?php
// obtener_baneo.php
include '../../General/conexion.php';
// Verificamos si llega el parámetro id por GET
if (isset($_GET['id'])) {
    $id = intval($_GET['id']); // Aseguramos que sea un número entero

    $sql = "SELECT usuario, estado FROM usuarios WHERE id = $id";
    $result = $conexion->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($row['estado'] === 'baneado') {
            echo json_encode([
                'id' => $id,
                'usuario' => $row['usuario'],
                'baneado' => true,
                'mensaje' => 'El usuario está baneado.'
            ]);
        } else {
            echo json_encode([
                'id' => $id,
                'usuario' => $row['usuario'],
                'baneado' => false,
                'mensaje' => 'El usuario no está baneado.'
            ]);
        }
    } else {
        echo json_encode([
            'error' => true,
            'mensaje' => 'Usuario no encontrado.'
        ]);
    }
} else {
    echo json_encode([
        'error' => true,
        'mensaje' => 'No se proporcionó el ID del usuario.'
    ]);
}

$conexion->close();
?>
