let noti;

document.addEventListener('DOMContentLoaded', function () {
  // Primero verificamos si el admin está logueado
  fetch('../obtener_admin.php')
    .then(res => res.json())
    .then(data => {
      if (!data.logueado) {
        // Si no está logueado, redirigimos al index
        location.href = '../../index.html';
      } else {
        // Si está logueado, inicializamos todo el panel de productos
        iniciarPanelProductos();
      }
    })
    .catch(err => {
      console.error("Error al verificar login:", err);
      location.href = '../../index.html';
    });

  function iniciarPanelProductos() {
    const tablaProductos = document.getElementById('tablaProductos');
    const modalModificar = document.getElementById('modalModificar');
    const modalEliminar = document.getElementById('modalEliminar');
    const cancelarEliminar = document.getElementById('cancelarEliminar');
    const confirmarEliminar = document.getElementById('confirmarEliminar');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const formulario = document.getElementById('formModificarProducto');
    const modalAgregar = document.getElementById('modalAgregar');
    const abrirModalAgregar = document.getElementById('abrirModalAgregar');
    const cancelarAgregar = document.getElementById('cancelarAgregar');
    const formAgregarProducto = document.getElementById('formAgregarProducto');
    noti = document.getElementById("notificacion");
    let productoIdEliminar = null;

    let productosPorPagina = 10;
    let paginaActual = 1;
    let productos = [];

    // Cargar productos al inicio
    function cargarProductos() {
      fetch('../../bd/obtener_productos.php?action=get')
        .then(response => response.json())
        .then(data => {
          productos = data;
          mostrarProductos(paginaActual);
          renderizarPaginacion();
        })
        .catch(error => {
          console.error('Error al cargar productos:', error);
        });
    }

    const buscador = document.getElementById('buscador');
    let textoBusqueda = '';

    buscador.addEventListener('input', () => {
      textoBusqueda = buscador.value.trim().toLowerCase();
      paginaActual = 1; // reiniciar a página 1 al buscar
      mostrarProductos(paginaActual);
      renderizarPaginacion();
    });

    function mostrarProductos(pagina) {
      tablaProductos.innerHTML = '';

      // Filtrar productos según textoBusqueda
      let productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(textoBusqueda) ||
        producto.tipo.toLowerCase().includes(textoBusqueda) ||
        producto.precio.toString().includes(textoBusqueda) ||
        producto.estado.toLowerCase().includes(textoBusqueda)
      );

      const inicio = (pagina - 1) * productosPorPagina;
      const fin = inicio + productosPorPagina;
      const productosPagina = productosFiltrados.slice(inicio, fin);

      productosPagina.forEach(producto => {
        const row = tablaProductos.insertRow();
         row.classList.add('border-b', 'border-black');  // borde solo en la fila
  row.innerHTML = `
    <td class="py-2 px-4">${producto.id}</td>
    <td class="py-2 px-4">${producto.nombre}</td>
    <td class="py-2 px-4">${producto.precio}</td>
    <td class="py-2 px-4">${producto.tipo}</td>
    <td class="py-2 px-4 flex space-x-2 justify-start w-48">
      <button class="modificarBtn px-4 py-3 text-xs bg-blue-500 text-white rounded whitespace-nowrap" data-id="${producto.id}">
  <i class="fi fi-rs-edit text-lg"></i>
</button>
<button class="borrarBtn px-4 py-3 text-xs bg-red-500 text-white rounded whitespace-nowrap" data-id="${producto.id}">
  <i class="fi fi-rs-trash text-lg"></i>
</button>
<button class="estadoBtn px-4 py-3 text-xs rounded ${producto.estado === 'activo' ? 'bg-yellow-500' : 'bg-gray-500'} text-white whitespace-nowrap"
  data-id="${producto.id}" data-estado="${producto.estado}">
  ${producto.estado === 'activo'
    ? '<i class="fi fi-rs-eye text-lg"></i>'
    : '<i class="fi fi-rr-eye-crossed text-lg"></i>'}
</button>
 
    </td>
    `;
      });

      // Actualizar paginación para productos filtrados
      renderizarPaginacion(productosFiltrados.length);

      // Reasignar listeners estado (porque la tabla fue regenerada)
      document.querySelectorAll('.estadoBtn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const estadoActual = btn.dataset.estado;
          const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';

          fetch(`cambiar_estado_producto.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, estado: nuevoEstado })
          })
            .then(res => res.json())
            .then(response => {
              if (response.success) {
                mostrarNotificacion(`Producto ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`);
                cargarProductos();
              } else {
                mostrarNotificacion('Error al cambiar el estado');
              }
            })
            .catch(err => {
              console.error('Error en fetch:', err);
              mostrarNotificacion('Error de conexión al cambiar estado');
            });
        });
      });
    }
    function renderizarPaginacion() {
      const totalPaginas = Math.ceil(productos.length / productosPorPagina);
      const contenedor = document.getElementById("paginacion");
      contenedor.innerHTML = "";

      // Contenedor principal (flex)
      const wrapper = document.createElement("div");
      wrapper.className = "flex justify-center items-center gap-2";

      // Contenedor botones izquierda
      const contIzquierda = document.createElement("div");
      contIzquierda.className = "flex items-center gap-1";

      if (paginaActual > 1) {
        const btnPrimera = document.createElement("button");
        btnPrimera.innerHTML = "&laquo;";
        btnPrimera.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
        btnPrimera.onclick = () => {
          paginaActual = 1;
          mostrarProductos(paginaActual);
          renderizarPaginacion();
        };
        contIzquierda.appendChild(btnPrimera);

        const btnAnterior = document.createElement("button");
        btnAnterior.innerHTML = "&lt;";
        btnAnterior.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
        btnAnterior.onclick = () => {
          paginaActual--;
          mostrarProductos(paginaActual);
          renderizarPaginacion();
        };
        contIzquierda.appendChild(btnAnterior);
      } else {
        contIzquierda.innerHTML = `
      <button class="px-3 py-1 invisible">«</button>
      <button class="px-3 py-1 invisible"><</button>
    `;
      }

      // Select centrado
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
      select.onchange = () => {
        paginaActual = parseInt(select.value);
        mostrarProductos(paginaActual);
        renderizarPaginacion();
      };
      contCentro.appendChild(select);

      // Contenedor botones derecha
      const contDerecha = document.createElement("div");
      contDerecha.className = "flex items-center gap-1";

      if (paginaActual < totalPaginas) {
        const btnSiguiente = document.createElement("button");
        btnSiguiente.innerHTML = "&gt;";
        btnSiguiente.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
        btnSiguiente.onclick = () => {
          paginaActual++;
          mostrarProductos(paginaActual);
          renderizarPaginacion();
        };
        contDerecha.appendChild(btnSiguiente);

        const btnUltima = document.createElement("button");
        btnUltima.innerHTML = "&raquo;";
        btnUltima.className = "px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded";
        btnUltima.onclick = () => {
          paginaActual = totalPaginas;
          mostrarProductos(paginaActual);
          renderizarPaginacion();
        };
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

    // Delegación para botones modificar, eliminar y cancelar modal
    document.addEventListener('click', function (event) {
      // Modificar producto
      if (event.target.classList.contains('modificarBtn')) {
        const productoId = event.target.dataset.id;
        fetch(`productos.php?action=get&id=${productoId}`)
          .then(response => response.json())
          .then(producto => {
            document.getElementById('productoId').value = producto.id;
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('precio').value = producto.precio;
            document.getElementById('tipo').value = producto.tipo;
            document.getElementById('imagen_actual').value = producto.imagen;

            const imgContainer = document.getElementById('imagenProducto');
            const urlBase = 'http://localhost/kioskoTecnica4/';
            imgContainer.innerHTML = `<img src="${urlBase}${producto.imagen}" alt="Imagen del producto" class="w-full h-auto rounded-lg">`;
            modalModificar.classList.remove('hidden');
          })
          .catch(error => console.error('Error al obtener producto:', error));
      }

      // Cancelar modificación
      if (event.target.id === 'cancelarBtn') {
        formulario.reset();
        document.getElementById('imagenProducto').innerHTML = '';
        modalModificar.classList.add('hidden');
      }

      // Eliminar producto - abrir modal
      if (event.target.classList.contains('borrarBtn')) {
        productoIdEliminar = event.target.dataset.id;
        modalEliminar.classList.remove('hidden');
      }

      // Cancelar eliminar
      if (event.target.id === 'cancelarEliminar') {
        modalEliminar.classList.add('hidden');
      }

      // Confirmar eliminar
      if (event.target.id === 'confirmarEliminar') {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', productoIdEliminar);

        fetch('productos.php', {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            mostrarNotificacion("Producto eliminado correctamente.");
            modalEliminar.classList.add('hidden');
            cargarProductos();
          })
          .catch(error => {
            mostrarNotificacion("Error al eliminar producto.");
            console.error('Error al eliminar producto:', error);
          });
      }
    });

    // Modificar producto (submit)
    formulario.addEventListener('submit', function (event) {
      event.preventDefault();

      const id = document.getElementById('productoId').value;
      const nombre = document.getElementById('nombre').value;
      const precio = document.getElementById('precio').value;
      const imagenInput = document.getElementById('imagen');
      const imagenArchivo = imagenInput.files[0];
      const tipo = document.getElementById('tipo').value;
      const imagenActual = document.getElementById('imagen_actual').value;

      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('id', id);
      formData.append('nombre', nombre);
      formData.append('precio', precio);
      if (imagenArchivo) {
        formData.append('imagen', imagenArchivo);
      }
      formData.append('imagen_actual', imagenActual);
      formData.append('tipo', tipo);

      fetch('productos.php', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          mostrarNotificacion("Producto modificado correctamente.");
          modalModificar.classList.add('hidden');
          formulario.reset();
          document.getElementById('imagenProducto').innerHTML = '';
          cargarProductos();
        })
        .catch(error => {
          mostrarNotificacion("Error al modificar producto.");
          console.error(error);
        });
    });

    // Abrir modal agregar producto
    abrirModalAgregar.addEventListener('click', () => {
      modalAgregar.classList.remove('hidden');
    });

    // Cancelar agregar producto
    cancelarAgregar.addEventListener('click', () => {
      modalAgregar.classList.add('hidden');
      formAgregarProducto.reset();
      if (previewImagenAgregar) previewImagenAgregar.innerHTML = `<span class="text-gray-400">Vista previa</span>`;
    });

    // Agregar producto (submit)
    formAgregarProducto.addEventListener('submit', function (event) {
      event.preventDefault();

      const nombre = document.getElementById('nuevoNombre').value;
      const precio = document.getElementById('nuevoPrecio').value;
      const imagenInput = document.getElementById('nuevaImagen');
      const imagenArchivo = imagenInput.files[0];
      const tipo = document.getElementById('nuevoTipo').value;

      const formData = new FormData();
      formData.append('action', 'insert');
      formData.append('nombre', nombre);
      formData.append('precio', precio);
      if (imagenArchivo) {
        formData.append('imagen', imagenArchivo);
      }
      formData.append('tipo', tipo);

      fetch('productos.php', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          mostrarNotificacion("Producto agregado correctamente.");
          modalAgregar.classList.add('hidden');
          formAgregarProducto.reset();
          if (previewImagenAgregar) previewImagenAgregar.innerHTML = `<span class="text-gray-400">Vista previa</span>`;
          cargarProductos();
        })
        .catch(error => {
          mostrarNotificacion("No se pudo insertar producto.");
          console.error(error);
        });
    });

    // Previsualización de imagen para agregar
    const nuevaImagenInput = document.getElementById('nuevaImagen');
    const previewImagenAgregar = document.getElementById('previewImagenAgregar');

    if (nuevaImagenInput && previewImagenAgregar) {
      nuevaImagenInput.addEventListener('change', function () {
        const archivo = nuevaImagenInput.files[0];

        if (archivo && archivo.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = function (e) {
            previewImagenAgregar.innerHTML = `
              <img src="${e.target.result}" alt="Vista previa" class="rounded-lg max-h-64 object-contain">
            `;
          };
          reader.readAsDataURL(archivo);
        } else {
          previewImagenAgregar.innerHTML = `<span class="text-gray-400">Vista previa</span>`;
        }
      });
    }

    function mostrarNotificacion(mensaje) {
      if (!noti) return;
      noti.innerHTML = `<span>${mensaje}</span>`;
      noti.classList.add('mostrar');
      noti.style.display = 'block';

      setTimeout(() => {
        noti.classList.remove('mostrar');
        noti.style.display = 'none';
      }, 3000);
    }

    // Carga inicial de productos
    cargarProductos();
  }
});
