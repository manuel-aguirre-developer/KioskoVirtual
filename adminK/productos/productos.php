<?php
header('Content-Type: application/json');
include '../../General/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_REQUEST['action'] ?? '';

if ($method === 'GET' && $action === 'get') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $query = "SELECT * FROM productos WHERE id = $id";
        $result = mysqli_query($conexion, $query);
        $producto = mysqli_fetch_assoc($result);
        echo json_encode($producto);
    } else {
        $result = mysqli_query($conexion, "SELECT * FROM productos");
        $productos = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $productos[] = $row;
        }
        echo json_encode($productos);
    }
} elseif ($method === 'POST') {
    if ($action === 'insert') {
        $nombre = $_POST['nombre'] ?? '';
        $precio = $_POST['precio'] ?? 0;
     if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
    $nombreArchivo = basename($_FILES['imagen']['name']);
    $rutaDestino = '../../imagenes/' . $nombreArchivo;
    move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino);
    $imagen = 'imagenes/' . $nombreArchivo;
} else {
    $imagen = $_POST['imagen_actual'] ?? ''; // 👈 usa la imagen anterior si no se subió una nueva
}
        $tipo = $_POST['tipo'] ?? '';

        $stmt = $conexion->prepare("INSERT INTO productos (nombre, precio, imagen, tipo) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sdss", $nombre, $precio, $imagen, $tipo);

        if ($stmt->execute()) {
            echo json_encode(['message' => 'Producto agregado con éxito.']);
        } else {
            echo json_encode(['message' => 'Error al agregar producto.']);
        }
        $stmt->close();

    } elseif ($action === 'update') {
    $id = $_POST['id'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $precio = $_POST['precio'] ?? 0;
    $tipo = $_POST['tipo'] ?? '';

    // Verifica si se subió una nueva imagen
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
        $nombreArchivo = basename($_FILES['imagen']['name']);
        $rutaDestino = '../../imagenes/' . $nombreArchivo;
        move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino);
        $imagen = 'imagenes/' . $nombreArchivo;
    } else {
        // Usa la imagen actual si no se sube una nueva
        $imagen = $_POST['imagen_actual'] ?? '';
    }

    // Ejecuta la consulta UPDATE
    $stmt = $conexion->prepare("UPDATE productos SET nombre = ?, precio = ?, imagen = ?, tipo = ? WHERE id = ?");
    $stmt->bind_param("sdssi", $nombre, $precio, $imagen, $tipo, $id);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Producto modificado con éxito.']);
    } else {
        echo json_encode(['message' => 'Error al modificar producto.']);
    }

    $stmt->close();
} elseif ($action === 'delete') {
        $id = $_POST['id'] ?? 0;
        $stmt = $conexion->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(['message' => 'Producto eliminado correctamente.']);
        } else {
            echo json_encode(['message' => 'Error al eliminar producto.']);
        }
        $stmt->close();
    }
}

$conexion->close();
?>
