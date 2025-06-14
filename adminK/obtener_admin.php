<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['admin'])) {
    // Renovar cookie de sesión por 30 días
    $lifetime = 60 * 60 * 24 * 30; // 30 días
    setcookie(session_name(), session_id(), [
        'expires' => time() + $lifetime,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    echo json_encode([
        'logueado' => true,
        'nombre' => $_SESSION['admin']['nombre'],
        'rol' => $_SESSION['admin']['rol'] // será 'admin'
    ]);
} elseif (isset($_SESSION['vendedor'])) {
    // Renovar cookie de sesión por 30 días también para vendedor
    $lifetime = 60 * 60 * 24 * 30; // 30 días
    setcookie(session_name(), session_id(), [
        'expires' => time() + $lifetime,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    echo json_encode([
        'logueado' => true,
        'nombre' => $_SESSION['vendedor']['nombre'],
        'rol' => $_SESSION['vendedor']['rol'] // será 'vendedor'
    ]);
} else {
    echo json_encode([
        'logueado' => false
    ]);
}
