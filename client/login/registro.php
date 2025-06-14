<?php
// Sesión de 30 días
$lifetime = 60 * 60 * 24 * 30; // 30 días en segundos
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();
include '../../General/conexion.php';

$nombre = trim($_POST['nuevo_usuario']);
$email = trim($_POST['nuevo_email']);
$curso = isset($_POST['nuevo_curso']) ? trim($_POST['nuevo_curso']) : null;
$telefono = trim($_POST['nuevo_telefono']);
$contrasena = $_POST['nueva_contraseña'];
$errores = [];

// Validaciones
if (empty($nombre) || !preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/", $nombre)) {
    $errores[] = "El nombre debe contener solo letras y espacios.";
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = "El correo electrónico no es válido.";
}
if ($curso !== null && $curso !== '') {
    if (!preg_match("/^[a-zA-Z0-9\s]+$/", $curso)) {
        $errores[] = "El curso no debe contener caracteres especiales.";
    }
} else {
    $curso = null;
}
if (empty($telefono) || !preg_match("/^[0-9]+$/", $telefono)) {
    $errores[] = "El teléfono debe contener solo números.";
}
if (empty($contrasena)) {
    $errores[] = "La contraseña no puede estar vacía.";
}

// Si hay errores, regresar
if (!empty($errores)) {
    $mensaje_error = implode("\\n", $errores);
    echo "<script>
        sessionStorage.setItem('registro_error', '$mensaje_error');
        window.location.href = 'login.html';
    </script>";
    exit;
}

// Guardar en base de datos
$contrasena_hash = password_hash($contrasena, PASSWORD_DEFAULT);
$origen = $_POST['origen'] ?? 'index';
$redireccion = ($origen === 'carrito') ? 'carrito.html' : '../../index.html';

$sql = "INSERT INTO usuarios (usuario, email, curso, telefono, contrasena)
        VALUES (?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sssss", $nombre, $email, $curso, $telefono, $contrasena_hash);

if ($stmt->execute()) {
    $_SESSION['usuario'] = [
        'id' => $stmt->insert_id,
        'nombre' => $nombre,
        'email' => $email,
        'curso' => $curso
    ];

    // Renovar la cookie de sesión
    setcookie(session_name(), session_id(), [
        'expires' => time() + $lifetime,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    header("Location: $redireccion");
    exit;
} else {
    echo "<script>
        sessionStorage.setItem('registro_error', 'Error al registrar: " . $stmt->error . "');
        window.location.href = 'login.html';
    </script>";
}

$stmt->close();
$conexion->close();
?>
