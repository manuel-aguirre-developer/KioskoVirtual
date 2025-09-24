// estadoPago.js
async function conectarWebSocketConUsuario() {
  try {
    // Consultamos si el usuario está logueado y obtenemos su ID
    const res = await fetch('http://138.219.42.29/client/login/obtener_usuario.php');
    const data = await res.json();

    if (!data.logueado || !data.id_usuario) {
      console.warn("Usuario no logueado o sin ID");
      return;
    }

    const idUsuario = data.id_usuario;
    const socket = new WebSocket('ws://138.219.42.29/ws'); // o 'localhost' si estás local

    socket.onopen = () => {
      socket.send(JSON.stringify({
        tipo: 'registrar_usuario',
        id_usuario: idUsuario
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.tipo === 'pago_aprobado') {
        window.location.href = 'gracias.html';
      }

      if (data.tipo === 'pago_rechazado') {
        window.location.href = 'fallo.html';
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

  } catch (error) {
    console.error("Error al obtener usuario para WebSocket:", error);
  }
}

// Ejecutar al cargar el script
conectarWebSocketConUsuario();
