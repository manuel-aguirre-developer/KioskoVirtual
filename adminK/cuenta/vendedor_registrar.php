<?php
session_start();
include '../../General/conexion.php';

if (!isset($_SESSION['admin'])) {
    // Solo un admin puede registrar vendedores
    header("Location: ../../index.html");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim($_POST['usuario']);
    $email = trim($_POST['email']);
    $contrasena = $_POST['contrasena'];
    $contrasena2 = $_POST['contrasena2'];

    if (empty($usuario) || empty($email) || empty($contrasena) || empty($contrasena2)) {
        $_SESSION['error'] = "Todos los campos son obligatorios.";
        header("Location: vendedores_registrarse.html");
        exit;
    }

    if ($contrasena !== $contrasena2) {
        $_SESSION['error'] = "Las contraseñas no coinciden.";
        header("Location: vendedores_registrarse.html");
        exit;
    }

    $hash = password_hash($contrasena, PASSWORD_DEFAULT);

    $sqlInsert = "INSERT INTO administracion (usuario, contrasena, email) VALUES (?, ?, ?)";
    $stmtInsert = $conexion->prepare($sqlInsert);

    if (!$stmtInsert) {
        die("Error en prepare: " . $conexion->error);
    }

    $stmtInsert->bind_param("sss", $usuario, $hash, $email);

    if ($stmtInsert->execute()) {
        $_SESSION['success'] = "Vendedor registrado correctamente.";
        header("Location: ../index.html");
    } else {
        die("Error en execute: " . $stmtInsert->error);
    }
    exit;
}
?>
