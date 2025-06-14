<?php
// Establecer duración de sesión por 30 días
$lifetime = 60 * 60 * 24 * 30; // 30 días
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax'
]);
ini_set('session.gc_maxlifetime', $lifetime);

session_start();
include '../../General/conexion.php';

// Obtener y limpiar datos
$usuario = trim($_POST['admin_usuario']);
$contraseña = trim($_POST['admin_contraseña']);

function enviar_error($mensaje) {
    echo "<script>
        sessionStorage.setItem('admin_login_error', " . json_encode($mensaje) . ");
        window.location.href = '../index.html';
    </script>";
    exit;
}

// Validación básica: campos vacíos
if (empty($usuario) || empty($contraseña)) {
    enviar_error("Campos vacíos.");
}

// Validación caracteres válidos en usuario/correo
if (!preg_match('/^[a-zA-Z0-9._@-]+$/', $usuario)) {
    enviar_error("Usuario o correo contiene caracteres no permitidos.");
}

// Si es correo (detectamos por presencia de @), validarlo bien
if (strpos($usuario, '@') !== false) {
    if (!filter_var($usuario, FILTER_VALIDATE_EMAIL)) {
        enviar_error("Formato de correo inválido.");
    }
}

// Validación caracteres válidos en contraseña
if (!preg_match('/^[a-zA-Z0-9!@#$%^&*()_+\-=.,;:]+$/', $contraseña)) {
    enviar_error("La contraseña contiene caracteres no permitidos.");
}

// Consulta en base de datos
$sql = "SELECT * FROM administracion WHERE usuario = ? OR email = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ss", $usuario, $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $usuarioBD = $resultado->fetch_assoc();

    // ...

if (password_verify($contraseña, $usuarioBD['contrasena'])) {
    // Guardar sesión según rol
    if ($usuarioBD['rol'] === 'admin') {
        $_SESSION['admin'] = [
            'id' => $usuarioBD['id'],
            'nombre' => $usuarioBD['usuario'],
            'email' => $usuarioBD['email'],
            'rol' => 'admin'
        ];
    } elseif ($usuarioBD['rol'] === 'vendedor') {
        $_SESSION['vendedor'] = [
            'id' => $usuarioBD['id'],
            'nombre' => $usuarioBD['usuario'],
            'email' => $usuarioBD['email'],
            'rol' => 'vendedor'
        ];
    }

    // Renovar cookie de sesión por 30 días
    $lifetime = 60 * 60 * 24 * 30; // 30 días
    setcookie(session_name(), session_id(), [
        'expires' => time() + $lifetime,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    header("Location: ../panel/panel.html");
    exit;
}

}

enviar_error("Nombre/email o contraseña incorrecta.");
