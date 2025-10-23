const BASE_URL = "http://localhost/kiosko";
const WS_URL = "ws://localhost:3006/kiosko";
let pedidos = [];
let socket;
let paginaActual = 1;
const pedidosPorPagina = 10;

// Verificar si está logueado
fetch( BASE_URL + '/adminK/obtener_admin.php')
  .then(res => res.json())
  .then(data => {
    if (!data.logueado) {
      location.href = BASE_URL + '/index.html';
    } else {
      conectarWebSocket();
    }
  });

window.cerrarModalDetalles = function () {
  document.getElementById('modalDetalles').classList.add('hidden');
}

function conectarWebSocket() {
  const spinner = document.getElementById('spinner');
  spinner.style.display = 'flex';

  socket = new WebSocket(WS_URL);

  socket.addEventListener('open', () => {
    console.log('Conectado al servidor WebSocket — ¡WebSocket activo y funcionando!');
  });

  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.tipo === "pedidos" && Array.isArray(data.pedidos)) {
        pedidos = data.pedidos.filter(p => p.estado_pedido !== 'entregado');
        mostrarPagina(paginaActual);

        // Ocultamos spinner solo si tenemos pedidos cargados
        if (pedidos.length > 0) {
          spinner.style.display = 'none';
        }
        // Si no hay pedidos todavía, dejamos el spinner visible
      }
    } catch (e) {
      console.error('Error al procesar datos:', e);
    }
  });

  socket.addEventListener('close', () => {
    console.warn('Conexión WebSocket cerrada. Reconectando en 3 segundos...');
    setTimeout(conectarWebSocket, 3000);
  });

  socket.addEventListener('error', (err) => {
    console.error('WebSocket error:', err);
  });
}

function mostrarPagina(pagina) {
  const tbody = document.querySelector("#tablaPedidos tbody");
  tbody.innerHTML = "";
  paginaActual = pagina;

  const inicio = (pagina - 1) * pedidosPorPagina;
  const fin = inicio + pedidosPorPagina;
  const detallesPagina = pedidos.slice(inicio, fin);

  detallesPagina.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td class="p-2">${p.id}</td>
      <td class="p-2">${p.id_usuario}</td>
      <td class="p-2">${p.fecha_venta}</td>
      <td class="p-2">$${parseFloat(p.total).toFixed(2)}</td>
      <td class="p-2">
        <button onclick="Vermas(${p.id})" class="bg-indigo-300 text-indigo-800 px-2 py-1 rounded hover:bg-indigo-400">Ver venta</button>
      </td>
    `;

    if (p.estado_pedido === "pedido_listo") {
      fila.classList.add("fila-pedido-listo");
    }

    tbody.appendChild(fila);
  });

  renderizarPaginacion(pedidos.length);
}


function renderizarPaginacion(totalPedidos) {
  const totalPaginas = Math.ceil(totalPedidos / pedidosPorPagina);
  const contenedor = document.getElementById("paginacion");
  contenedor.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "flex justify-center items-center gap-2";

  const contIzquierda = document.createElement("div");
  contIzquierda.className = "flex items-center gap-1";

  if (paginaActual > 1) {
    const btnPrimera = document.createElement("button");
    btnPrimera.innerHTML = "&laquo;";
    btnPrimera.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
    btnPrimera.onclick = () => mostrarPagina(1);
    contIzquierda.appendChild(btnPrimera);

    const btnAnterior = document.createElement("button");
    btnAnterior.innerHTML = "&lt;";
    btnAnterior.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
    btnAnterior.onclick = () => mostrarPagina(paginaActual - 1);
    contIzquierda.appendChild(btnAnterior);
  } else {
    contIzquierda.innerHTML = `
      <button class="px-3 py-1 invisible">«</button>
      <button class="px-3 py-1 invisible"><</button>
    `;
  }

  const contCentro = document.createElement("div");
  const select = document.createElement("select");
  for (let i = 1; i <= totalPaginas; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Página ${i}`;
    if (i === paginaActual) option.selected = true;
    select.appendChild(option);
  }
  select.className = "px-2 py-1 rounded border";
  select.onchange = () => mostrarPagina(parseInt(select.value));
  contCentro.appendChild(select);

  const contDerecha = document.createElement("div");
  contDerecha.className = "flex items-center gap-1";

  if (paginaActual < totalPaginas) {
    const btnSiguiente = document.createElement("button");
    btnSiguiente.innerHTML = "&gt;";
    btnSiguiente.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
    btnSiguiente.onclick = () => mostrarPagina(paginaActual + 1);
    contDerecha.appendChild(btnSiguiente);

    const btnUltima = document.createElement("button");
    btnUltima.innerHTML = "&raquo;";
    btnUltima.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
    btnUltima.onclick = () => mostrarPagina(totalPaginas);
    contDerecha.appendChild(btnUltima);
  } else {
    contDerecha.innerHTML = `
      <button class="px-3 py-1 invisible">></button>
      <button class="px-3 py-1 invisible">»</button>
    `;
  }

  wrapper.appendChild(contIzquierda);
  wrapper.appendChild(contCentro);
  wrapper.appendChild(contDerecha);

  contenedor.appendChild(wrapper);
}


  // Variables para cambio de estado
  let idSeleccionado = null;
  let estadoSeleccionado = null;

  window.cambiarEstado = function(id, estado) {
    idSeleccionado = id;
    estadoSeleccionado = estado;

    document.getElementById('mensajeModal').textContent = `¿Deseás cambiar el estado del pedido a "${estado}"?`;
    document.getElementById('modalConfirmacion').classList.remove('hidden');
  }

window.Vermas = async function(id) {
  try {
    const res = await fetch(`obtenerVenta.php?id_venta=${id}`);
    const venta = await res.json();

    if (venta.error) {
      alert("Error: " + venta.error);
      return;
    }
const metodoPago = venta.productos.length > 0 ? venta.productos[0].pago_en : null;
const total = Number(venta.total) || 0;

let abono;
if (metodoPago === 'transferencia') {
  abono = total;  // para transferencia, el abono es el total del producto
} else {
  abono = Number(venta.abono) || 0; // para otros métodos, mantiene el abono que viene
}
const vuelto = abono > total ? (abono - total).toFixed(2) : "0.00";
    const modal = document.getElementById('modalDetalles');
    const titulo = modal.querySelector('.modal-title');
    const cuerpo = modal.querySelector('.modal-body');
    const botonesEstados = document.getElementById('botonesEstados');
    titulo.textContent = `Venta ID ${venta.id}`;
   cuerpo.innerHTML = `
  <p><strong>ID Usuario:</strong> ${venta.id_usuario}</p>
  <p><strong>Nombre del usuario:</strong> ${venta.nombre_usuario}</p>
  <p><strong>Curso:</strong> ${venta.curso_usuario || 'No se especificó curso'}</p>
  <p><strong>Método de pago:</strong> ${venta.productos.length > 0 ? venta.productos[0].pago_en : 'No mando mensaje.'}</p>
  <p><strong>Abono con:</strong> $${abono}</p>
  <p><strong>Vuelto pendiente:</strong> $${vuelto}</p>
  <p><strong>Mensaje personalizado:</strong> ${venta.productos.length > 0 ? (venta.productos[0].mensaje || 'No mando mensaje.') : 'No mando mensaje.'}</p>

  <p><strong>Productos:</strong></p>
  <ul>
    ${venta.productos.map(p => `
      <li>
        <strong>${p.nombre_producto}</strong> X ${p.cantidad} = $${parseFloat(p.subtotal).toFixed(2)}
      </li>
    `).join('')}
  </ul>
  <p><strong>Estado del pedido:</strong> ${venta.estado_pedido}</p>
`;
    // Limpiar botones antes de agregar nuevos
    botonesEstados.innerHTML = '';

    // Estados posibles (puedes modificar según tus estados)
    const estadosPosibles = ['pedido_listo', 'entregado'];

    // Crear botón para cada estado, excepto el actual
    estadosPosibles.forEach(estado => {
      if (estado !== venta.estado_pedido) {
        const btn = document.createElement('button');
        btn.textContent = `Cambiar a "${estado}"`;
        btn.className = 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded';
        btn.onclick = () => {
          cambiarEstado(venta.id, estado);
          cerrarModalDetalles();
        };
        botonesEstados.appendChild(btn);
      }
    });

    modal.classList.remove('hidden');
  } catch (err) {
    alert("No se pudo cargar la venta.");
    console.error("Error al cargar la venta:", err);
  }
}

  // Función genérica para cerrar modales
  window.cerrarModal = function(modalId = 'modalConfirmacion') {
    document.getElementById(modalId).classList.add('hidden');
  }

  // Cerramos modalConfirmacion por defecto cuando cancelamos
  document.querySelectorAll('[onclick="cerrarModal()"]').forEach(btn => {
    btn.addEventListener('click', () => cerrarModal());
  });

  // Evento botón confirmar cambio estado
  document.getElementById('btnConfirmar').addEventListener('click', async () => {
    console.log("Enviando datos:", { id: idSeleccionado, estado: estadoSeleccionado });

    try {
      const res = await fetch('cambiarEstadoPedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idSeleccionado, estado: estadoSeleccionado })
      });

      const result = await res.json();
      if (result.success) {
        await cargarPedidos();
      } else {
        alert("Hubo un problema al cambiar el estado.");
      }
    } catch (err) {
      console.error("Error al actualizar pedido:", err);
    } finally {
      cerrarModal();
    }
  });

  // Cerrar modalDetalles con botón "×" (agrega el atributo onclick="cerrarModal('modalDetalles')")
  document.querySelector('#modalDetalles button.close-modal')?.addEventListener('click', () => cerrarModal('modalDetalles'));