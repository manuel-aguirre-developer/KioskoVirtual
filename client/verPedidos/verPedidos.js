const BASE_URL = "http://localhost/kiosko";
const WS_URL = "ws://localhost:3006/kiosko";

let socket;
let todosLosPedidos = [];
let usuarioActualId = null;
const botonesFiltro = document.getElementById('botonesFiltro');

document.addEventListener('DOMContentLoaded', () => {
  fetch(`${BASE_URL}/client/login/obtener_usuario.php`)
    .then(response => response.json())
    .then(data => {
      if (!data.logueado) {
        document.getElementById("modalLogin").classList.remove("hidden");
        return;
      }
      iniciarWebSocket(data.id_usuario); // ID del usuario actual
    })
    .catch(error => {
      console.error('Error al verificar el usuario:', error);
    });

  const btnCerrar = document.getElementById('cerrarModal');
  btnCerrar.addEventListener('click', () => {
    document.getElementById('modalDetalle').classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-ver-detalle')) {
      const idVenta = e.target.dataset.id;
      cargarDetallesPedido(idVenta);
    }
  });
});

function iniciarWebSocket(userId) {
  const spinner = document.getElementById('spinner');
  const usuarioDatos = document.getElementById('usuarioDatos');

  spinner.style.display = 'block';
  usuarioDatos.style.display = 'none';
  botonesFiltro.style.display = 'none';
  usuarioActualId = userId;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    // Conexión abierta
  };

  socket.onmessage = (event) => {
    const datos = JSON.parse(event.data);

    if (datos.tipo === 'pedidos') {
      const pedidosUsuario = datos.pedidos.filter(p => p.id_usuario === userId);
      todosLosPedidos = pedidosUsuario;

      const hayRecientes = hayPedidosRecientes(todosLosPedidos);

      if (hayRecientes) {
        botonesFiltro.style.display = 'block';
      }

      mostrarPendientes(); // Mostrar pendientes aunque estén vacíos
    }
  };

  socket.onclose = () => {
    console.warn("WebSocket cerrado. Reintentando en 5 segundos...");
    setTimeout(() => iniciarWebSocket(userId), 5000);
  };

  socket.onerror = (error) => {
    console.error("Error en WebSocket:", error);
  };
}

function mostrarPedidos(pedidos) {
  const usuarioDatos = document.getElementById('usuarioDatos');
  const spinner = document.getElementById('spinner');
  botonesFiltro.style.display = 'block';
  if (!pedidos || pedidos.length === 0) {
    usuarioDatos.innerHTML = `<div>No hay pedidos registrados.</div>`;
    spinner.style.display = 'none';
    usuarioDatos.style.display = 'block';
    botonesFiltro.style.display = 'block';
    return;
  }

  const pedidosRecientes = pedidos.filter(pedido => {
    const fechaPedido = new Date(pedido.fecha_venta);
    const fechaActual = new Date();
    const diffDias = (fechaActual - fechaPedido) / (1000 * 60 * 60 * 24);
    return diffDias <= 7;
  });

  if (pedidosRecientes.length === 0) {
    usuarioDatos.innerHTML = `<div>No hay pedidos recientes (menos de 7 días).</div>`;
    spinner.style.display = 'none';
    usuarioDatos.style.display = 'block';
    botonesFiltro.style.display = 'block';
    return;
  }

  const nuevoHTML = pedidosRecientes.map(pedido => {
    const estado = pedido.estado_pedido === 'pedido_listo' ? 'pedido listo' : pedido.estado_pedido;
    let bgColor = 'bg-gray-100';

    switch (estado) {
      case 'esperando': bgColor = 'bg-gray-200'; break;
      case 'preparando': bgColor = 'bg-blue-200'; break;
      case 'pedido listo': bgColor = 'bg-yellow-200'; break;
      case 'entregado': bgColor = 'bg-green-2 00'; break;
    }

    return `
      <div class="p-4 border rounded-md shadow-sm mb-4 ${bgColor}">
        <div><strong>ID del usuario:</strong> ${pedido.id_usuario}</div>
        <div><strong>Nombre del usuario:</strong> ${pedido.nombre_usuario || 'N/A'}</div>
        <div><strong>ID del pedido:</strong> ${pedido.id}</div>
        <div><strong>Fecha:</strong> ${pedido.fecha_venta}</div>
        <div><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</div>
        <div><strong>Estado del pedido:</strong> <span id="estado-${pedido.id}">${estado}</span></div>
        <button class="btn-ver-detalle mt-2 bg-blue-500 text-white px-3 py-1 rounded" data-id="${pedido.id}">Ver más</button>
      </div>
    `;
  }).join('');

  if (usuarioDatos.innerHTML !== nuevoHTML) {
    usuarioDatos.innerHTML = nuevoHTML;
  }

  spinner.style.display = 'none';
  usuarioDatos.style.display = 'block';
}

function cargarDetallesPedido(idVenta) {
  const modal = document.getElementById('modalDetalle');
  const detalleTexto = document.getElementById('detalleTexto');

  fetch(`${BASE_URL}/client/verPedidos/detalles_venta.php?id_venta=${idVenta}`)
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener los detalles');
      return response.json();
    })
    .then(data => {
      detalleTexto.innerHTML = '';

      if (data.length === 0) {
        detalleTexto.innerHTML = `<p class="text-gray-500">Sin detalles para este pedido.</p>`;
      } else {

        const metodoPago = data[0].pago_en || 'N/A';
        const mensaje = data[0].mensaje || 'No mandaste ningún mensaje.';
        let abono = parseFloat(data[0].abono) || 0.00;

        // Si el método de pago es transferencia, se toma como abono el total del producto
        const totalSubtotal = data.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
        if (metodoPago.toLowerCase() === 'transferencia') {
          abono = totalSubtotal;
        }

        const vuelto = (abono - totalSubtotal).toFixed(2);

        const infoExtra = document.createElement('div');
        infoExtra.innerHTML = `
  <p class="mb-2 text-sm"><strong>Método de pago:</strong> ${metodoPago}</p>
  <p class="mb-2 text-sm"><strong>Mensaje personalizado:</strong> ${mensaje}</p>
  <p class="mb-2 text-sm"><strong>Pagaste con:</strong> $${abono.toFixed(2)}</p>
  <p class="mb-4 text-sm"><strong>Vuelto a recibir:</strong> $${vuelto}</p>
`;
        detalleTexto.appendChild(infoExtra);


        const lista = document.createElement('ul');
        lista.classList.add('list-disc', 'ml-4');

        data.forEach(detalle => {
          const li = document.createElement('li');
          li.innerHTML = `
          <p><strong>ID:</strong> ${detalle.id_producto}</p> 
          <p><strong>Producto que llevas:</strong> ${detalle.nombre_producto}</p>
          <p><strong>Cantidad que llevas:</strong> ${detalle.cantidad}</p>
          <p><strong>Subtotal:</strong> $${parseFloat(detalle.subtotal).toFixed(2)}</p>
        `;
          li.classList.add('mb-2', 'border', 'p-2', 'rounded', 'bg-gray-50');
          lista.appendChild(li);
        });

        detalleTexto.appendChild(lista);
      }

      modal.classList.remove('hidden');
    })
    .catch(error => {
      detalleTexto.innerHTML = `<p class="text-red-500">Error al cargar detalles: ${error.message}</p>`;
      modal.classList.remove('hidden');
    });

}

function cerrarLoginModal() {
  window.location.href = `${BASE_URL}/index.html`;
  document.getElementById("modalLogin").classList.add("hidden");
}

function redirigirLogin() {
  window.location.href = `${BASE_URL}/client/login/login.html`;
}
function hayPedidosRecientes(pedidos) {
  const fechaActual = new Date();
  return pedidos.some(pedido => {
    const fechaPedido = new Date(pedido.fecha_venta);
    const diffDias = (fechaActual - fechaPedido) / (1000 * 60 * 60 * 24);
    return diffDias <= 7;
  });
}

function mostrarPendientes() {
  const pedidos = todosLosPedidos.filter(p => p.estado_pedido !== 'entregado');
  const perfil = document.getElementById('perfil');
  perfil.style.background = "linear-gradient(to bottom right,rgb(255, 255, 255), rgb(255, 238, 194)"; // amarillo a rojo
  btnPendientes.style.border = "2px solid black";
  btnEntregados.style.border = "none";
  mostrarPedidos(pedidos);
}

function mostrarEntregados() {
  const pedidos = todosLosPedidos.filter(p => p.estado_pedido === 'entregado');
  const perfil = document.getElementById('perfil');
  perfil.style.background = "linear-gradient(to bottom right,rgb(255, 255, 255), rgb(206, 255, 238))"; // verde a azul
  mostrarPedidos(pedidos);
  btnEntregados.style.border = "2px solid black";
  btnPendientes.style.border = "none";
}