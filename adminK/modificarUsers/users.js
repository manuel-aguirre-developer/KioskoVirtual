let usuariosGlobal = [];
let usuariosFiltrados = [];
let paginaActual = 1;
const usuariosPorPagina = 10;

const spinner = document.getElementById('spinner');
const buscador = document.getElementById('buscadorUsuarios');

const ws = new WebSocket('ws://localhost:3006');

ws.addEventListener('open', () => {
  console.log('Conectado a WebSocket');
  spinner.style.display = 'flex'; // Mostrar spinner al conectar
  buscador.style.display = 'none';
  document.getElementById('contenidoPrincipal').style.display = 'none';
});

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.tipo === 'usuarios') {
    usuariosGlobal = data.usuarios;
    usuariosFiltrados = usuariosGlobal; // inicializar sin filtro
    spinner.style.display = 'none'; // Ocultar spinner cuando llegan usuarios
    document.getElementById('contenidoPrincipal').style.display = 'block';
    buscador.style.display = 'block';
    mostrarPagina(1);
    iniciarPanelUsuarios();
  }
});

ws.addEventListener('close', () => {
  console.log('WebSocket desconectado');
});

// Filtrado por nombre
buscador.addEventListener('input', () => {
  const texto = buscador.value.trim().toLowerCase();
  paginaActual = 1; // Resetear a página 1 al filtrar

  if (texto === "") {
    usuariosFiltrados = usuariosGlobal;
  } else {
    usuariosFiltrados = usuariosGlobal.filter(u =>
      u.usuario.toLowerCase().includes(texto)
    );
  }

  mostrarPagina(paginaActual);
});

function mostrarPagina(pagina) {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  tbody.innerHTML = "";
  paginaActual = pagina;

  const inicio = (pagina - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

  usuariosPagina.forEach(u => {
    const fila = document.createElement('tr');
fila.innerHTML = `
  <td class="border-b border-black p-2">${u.id}</td>
  <td class="border-b border-black p-2">${u.usuario}</td>
  <td class="border-b border-black p-2">${u.email}</td>
  <td class="border-b border-black p-2 capitalize">${u.estado}</td>
  <td class="border-b border-black p-2">
    <div class="flex gap-2">
      <button onclick="confirmarCambioEstado(${u.id}, 'aprobado')" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Activar</button>
      <button onclick="confirmarCambioEstado(${u.id}, 'baneado')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Banear</button>
    </div>
  </td>
`;
tbody.appendChild(fila);

  });

  renderizarPaginacion();
}

function renderizarPaginacion() {
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  const contenedor = document.getElementById("paginacion");
  contenedor.innerHTML = "";

  if (totalPaginas === 0) return; // Evitar mostrar paginación si no hay resultados

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

  select.onchange = () => {
    mostrarPagina(parseInt(select.value));
  };

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

function iniciarPanelUsuarios() {
  // Elementos modal
  const modal = document.getElementById('modalConfirmacion');
  const modalMensaje = document.getElementById('modalMensaje');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelar');

  let idPendiente = null;
  let estadoPendiente = null;

  window.confirmarCambioEstado = function (id, estado) {
    idPendiente = id;
    estadoPendiente = estado;
    modalMensaje.textContent = `¿Seguro que desea cambiar el estado del usuario ${id} a "${estado}"?`;
    modal.classList.remove('hidden');
  };

  btnConfirmar.onclick = () => {
    if (idPendiente !== null && estadoPendiente !== null) {
      fetch('cambiarEstado.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idPendiente, estado: estadoPendiente })
      })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            usuariosGlobal = usuariosGlobal.map(u =>
              u.id === idPendiente ? { ...u, estado: estadoPendiente } : u
            );
            mostrarPagina(paginaActual);
          } else {
            alert("Error al cambiar estado");
          }
          modal.classList.add('hidden');
          idPendiente = null;
          estadoPendiente = null;
        });
    }
  };

  btnCancelar.onclick = () => {
    modal.classList.add('hidden');
    idPendiente = null;
    estadoPendiente = null;
  };
}
