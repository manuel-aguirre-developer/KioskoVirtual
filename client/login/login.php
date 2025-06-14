<?php
session_start();
include '../../General/conexion.php';

$usuario = $_POST['usuario'];
$contraseña = $_POST['contraseña'];
$origen = $_POST['origen'] ?? 'index';
$redireccion = ($origen === 'carrito') ? 'carrito.html' : '../../index.html';

if (empty($usuario) || empty($contraseña)) {
    $mensaje = "Nombre/email o contraseña vacíos.";
    echo "<script>
        sessionStorage.setItem('login_error', '$mensaje');
        window.location.href = 'login.html';
    </script>";
    exit;
}

$sql = "SELECT * FROM usuarios WHERE usuario = ? OR email = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ss", $usuario, $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $usuario_data = $resultado->fetch_assoc();

    if (password_verify($contraseña, $usuario_data['contrasena'])) {
        $_SESSION['usuario'] = [
            'id' => $usuario_data['id'],
            'nombre' => $usuario_data['usuario'],
            'estado' => $usuario_data['estado'],
            'email' => $usuario_data['email'],
        ];

        // 🔁 Renovar cookie de sesión por 30 días
        $lifetime = 60 * 60 * 24 * 30; // 30 días
        setcookie(session_name(), session_id(), [
            'expires' => time() + $lifetime,
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        header("Location: $redireccion");
        exit;
    }
}

// Si llega aquí es porque la contraseña falló o el usuario no existe
$mensaje = "Nombre/email o contraseña incorrecta.";
echo "<script>
    sessionStorage.setItem('login_error', '$mensaje');
    window.location.href = 'login.html';
</script>";
exit;
?>
