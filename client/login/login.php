<?php
// ?? Configurar duración de la sesión (30 días)
$lifetime = 60 * 60 * 24 * 30;
ini_set('session.cookie_lifetime', 60 * 60 * 24 * 30);
ini_set('session.gc_maxlifetime', 60 * 60 * 24 * 30);
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax'
]);

// ?? Forzar HTTPS si usás proxy inverso (solo si es necesario)
if (!isset($_SERVER['HTTPS']) && isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}
session_start();
include '../../General/conexion.php';

$usuario = $_POST['usuario'];
$contrasenia = $_POST['contraseña'] ?? $_POST['contraseÃ±a'] ?? ''; // manejar codificación errónea
$origen = $_POST['origen'] ?? 'index';

// Switch para asignar redireccionamiento
switch ($origen) {
    case 'carrito':
        $redireccion = '../carrito/carrito.html';
        break;
    case 'configuracion':
        $redireccion = '../configuracion/configuracion.html';
        break;
    case 'verPedidos':
        $redireccion = '../verPedidos/verPedidos.html';
        break;
    case 'perfil':
        $redireccion = '../perfil/index.html';
        break;
    default:
        $redireccion = '../../index.html';
        break;
}
if (empty($usuario) || empty($contrasenia)) {
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

    if (password_verify($contrasenia, $usuario_data['contrasena'])) {
        // Guardar los datos del usuario en sesión
        $_SESSION['usuario'] = [
            'id' => $usuario_data['id'],
            'nombre' => $usuario_data['usuario'],
            'estado' => $usuario_data['estado'],
            'email' => $usuario_data['email'],
        ];

        // PHP ya gestiona la cookie con la duración configurada arriba
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
