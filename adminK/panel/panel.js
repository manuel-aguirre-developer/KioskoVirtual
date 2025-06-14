const logo = document.getElementById("logo");
const bienvenidoText = document.getElementById("bienvenido");
const splash = document.getElementById("splash");
const contenido = document.getElementById("contenidoPrincipal");

function mostrarSplash() {
  splash.classList.add("visible");
  contenido.classList.remove("visible");

  setTimeout(() => {
    logo.classList.add("logo-animado");
    logo.style.opacity = "1";
  }, 300);

  cargarTextoBienvenida();

  setTimeout(() => {
    splash.classList.add("fade-out");
    contenido.classList.add("visible");

    setTimeout(() => {
      splash.style.display = "none";
    }, 1000);
  }, 4500);
}

function cargarTextoBienvenida() {
  let textoBienvenida = "Kiosko Virtual";
  fetch('http://localhost/kioskoTecnica4/adminK/obtener_admin.php')
    .then(response => response.json())
    .then(data => {
      if (data.logueado) {
        let nombreCompleto = data.nombre.trim();
        let primerNombre = nombreCompleto.split(' ')[0];

        if (primerNombre.toUpperCase() === "AAPC") {
          textoBienvenida = "Bienvenido señor";
        } else {
          if (primerNombre.length > 17) {
            primerNombre = primerNombre.substring(0, 17) + '...';
          }
          textoBienvenida = `Bienvenido ${primerNombre}`;
        }
      }

      bienvenidoText.classList.add(
        "text-center", "text-white", "px-4", "font-semibold", "tracking-wide"
      );

      if (textoBienvenida === "Kiosko Virtual") {
        bienvenidoText.classList.add("text-[10px]");
      }

      setTimeout(() => {
        bienvenidoText.textContent = textoBienvenida;
        bienvenidoText.classList.add("fade-in-zoom");
        bienvenidoText.style.opacity = "1";
      }, 1600);
    })
    .catch(error => {
      console.error('Error al verificar sesión:', error);
    });
}


function ocultarSplash() {
  splash.style.display = "none";
  contenido.classList.add("visible");
}

window.addEventListener("load", () => {
  const splashYaMostrado = sessionStorage.getItem("splashYaMostrado");

  if (!splashYaMostrado) {
    mostrarSplash();
    sessionStorage.setItem("splashYaMostrado", "true");
  } else {
    ocultarSplash();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Check admin logueado
  fetch('../obtener_admin.php')
    .then(res => res.json())
    .then(data => {
      if (!data.logueado) {
        location.href = '../../index.html';
      }
    });

  const confirmToggleBtn = document.getElementById('confirmToggleBtn');
  const abrirModalBtn = document.getElementById('abrirModalBtn');
  const modalAlert = document.getElementById('modalAlert');
  const estadoContainer = document.getElementById('estadoProductos');
  const modal = document.getElementById('confirmModal');

  let estadoActual = ''; // Guardar el estado globalmente

  // Al iniciar, muestro texto de carga
  estadoContainer.textContent = 'Estado actual de productos: cargando...';

  function actualizarEstadoUI(estado) {
    estadoActual = estado;
    estadoContainer.textContent = `Estado actual de productos: ${estado}`;
    const textoBoton = (estado === 'activo')
      ? 'Desactivar todos los productos'
      : 'Activar todos los productos';

    confirmToggleBtn.textContent = textoBoton;
    abrirModalBtn.textContent = textoBoton;
  }

  // Esto se ejecuta SIN hacer click y actualiza estado al cargar la página
  fetch('obtener_estado_producto.php')
    .then(res => res.json())
    .then(data => {
      if (data.estado) {
        actualizarEstadoUI(data.estado);
      } else {
        estadoContainer.textContent = 'No se pudo obtener el estado';
      }
    })
    .catch(error => {
      console.error('Error al obtener estado:', error);
      estadoContainer.textContent = 'Error al obtener el estado de productos';
    });

  // Modal solo cambia texto del botón cuando se muestra
  modal.addEventListener('show.bs.modal', () => {
    confirmToggleBtn.textContent = (estadoActual === 'activo')
      ? 'Desactivar todos los productos'
      : 'Activar todos los productos';
  });

  // Cambiar estado al confirmar
  confirmToggleBtn.addEventListener('click', async () => {
    modalAlert.innerHTML = '';

    try {
      const response = await fetch('logicaStatus.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'toggle' })
      });

      const data = await response.json();

      if (data.nuevoEstado) {
        actualizarEstadoUI(data.nuevoEstado);

        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
      } else if (data.error) {
        modalAlert.innerHTML = `<div class="alert alert-danger" role="alert">
          Error: ${data.error}
        </div>`;
      }
    } catch (error) {
      modalAlert.innerHTML = `<div class="alert alert-danger" role="alert">
        Error al cambiar el estado de productos
      </div>`;
      console.error(error);
    }
  });
});
