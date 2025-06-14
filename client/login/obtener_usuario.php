<?php
session_start();

// Renovar cookie de sesión por 30 días (igual que en login.php y registro.php)
$lifetime = 60 * 60 * 24 * 30; // 30 días
setcookie(session_name(), session_id(), [
    'expires' => time() + $lifetime,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax'
]);

header('Content-Type: application/json');

if (isset($_SESSION['usuario']) && is_array($_SESSION['usuario'])) {
    echo json_encode([
        'logueado' => true,
        'id_usuario' => $_SESSION['usuario']['id'],
        'usuario' => $_SESSION['usuario']['nombre'],
        'estado' => $_SESSION['usuario']['estado'] ?? null,
        'baneado' => $_SESSION['usuario']['baneado'] ?? false
    ]);
} else {
    echo json_encode([
        'logueado' => false,
        'usuario' => null
    ]);
}
?>
