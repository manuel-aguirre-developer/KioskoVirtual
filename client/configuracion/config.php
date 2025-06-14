<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../../General/conexion.php';

if (isset($_POST['id'], $_POST['usuario'], $_POST['email'], $_POST['curso'], $_POST['telefono'])) {
    $id = intval($_POST['id']);
    $usuario = trim($_POST['usuario']);
    $email = trim($_POST['email']);
    $curso = trim($_POST['curso']);
    $telefono = trim($_POST['telefono']);

    $errores = [];

    // Validar nombre (solo letras y espacios)
    if (empty($usuario) || !preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/", $usuario)) {
        $errores[] = "El nombre debe contener solo letras y espacios.";
    }

    // Validar email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errores[] = "El correo electrónico no es válido.";
    }

    // Validar curso (exactamente 4 dígitos)
    if (empty($curso) ) {
        $errores[] = "El curso no existe.";
    }

    // Validar teléfono (exactamente 11 números)
    if (empty($telefono) || !preg_match("/^\d{11,}$/", $telefono)) {
        $errores[] = "El teléfono debe tener mas de 10 digitos.";
    }

    if (!empty($errores)) {
        echo json_encode([
            "success" => false,
            "message" => implode("\n", $errores)
        ]);
        exit;
    }

    $usuario = $conexion->real_escape_string($usuario);
    $email = $conexion->real_escape_string($email);
    $curso = $conexion->real_escape_string($curso);
    $telefono = $conexion->real_escape_string($telefono);

    $sqlEstado = "SELECT estado FROM usuarios WHERE id = $id";
    $result = $conexion->query($sqlEstado);

    if ($result && $result->num_rows > 0) {
        $estado = $result->fetch_assoc()['estado'];

        if ($estado === 'aprobado') {
            $conexion->query("UPDATE usuarios SET estado = 'pendiente' WHERE id = $id");
        }

        $sql = "UPDATE usuarios SET 
                    usuario = '$usuario',
                    email = '$email',
                    curso = '$curso',
                    telefono = '$telefono'
                WHERE id = $id";

        if ($conexion->query($sql)) {
            echo json_encode([
                "success" => true,
                "message" => "Perfil actualizado correctamente."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Error al actualizar los datos: " . $conexion->error
            ]);
        }

    } else {
        echo json_encode([
            "success" => false,
            "message" => "No se encontró el usuario con ese ID."
        ]);
    }

} else {
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos para actualizar el perfil."
    ]);
}

$conexion->close();
exit;
?>
