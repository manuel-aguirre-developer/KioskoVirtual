<?php
// Iniciar sesión
session_start();

// Eliminar todas las variables de sesión
session_unset();

// Destruir la sesión
session_destroy();

// Redirigir a la página de inicio de sesión con el parámetro 'cerrado=1'
header("Location: login.html?cerrado=1");
exit();
?>
