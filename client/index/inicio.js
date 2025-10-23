const BASE_URL = "http://localhost/kiosko";
const WS_URL = "ws://localhost:3006/kiosko";

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

  fetch(`${BASE_URL}/client/login/obtener_usuario.php`)
    .then(response => response.json())
    .then(data => {
      if (data.logueado) {
        let nombreCompleto = data.usuario.trim();
        let primerNombre = nombreCompleto.split(' ')[0];
        if (primerNombre.length > 17) {
          primerNombre = primerNombre.substring(0, 17) + '...';
        }
        textoBienvenida = `Bienvenido ${primerNombre}`;
      }
    })
    .catch(error => {
      console.error('Error al verificar sesiÃ³n:', error);
    })
    .finally(() => {
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


//POR SI NO FUNCIONA EN CELU ELIMINAR LO DE ARRIBA Y PEGAR LO DE ABAJOOO CUIDADO
// const logo = document.getElementById("logo");  
// const bienvenidoText = document.getElementById("bienvenido");
// const splash = document.getElementById("splash");
// const contenido = document.getElementById("contenidoPrincipal");

// function mostrarSplash() {
//   // Mostrar splash sin parpadeo
//   splash.classList.add("visible");
//   contenido.classList.remove("visible");

//   // Animar logo
//   setTimeout(() => {
//     logo.classList.add("logo-animado");
//     logo.style.opacity = "1";
//   }, 300);

//   // Cargar texto bienvenida y animarlo
//   cargarTextoBienvenida();

//   // DespuÃ©s de mostrar splash, hacer fade out y mostrar contenido
//   setTimeout(() => {
//     splash.classList.add("fade-out");
//     contenido.classList.add("visible");

//     setTimeout(() => {
//       splash.style.display = "none"; // Ocultar completamente splash
//       localStorage.setItem("splashShown", "true"); // Guardar para no mostrar mÃ¡s
//     }, 1000);
//   }, 4500);
// }

// function cargarTextoBienvenida() {
//   let textoBienvenida = "Kiosko Virtual"; // default si no estÃ¡ logueado

//   fetch('${BASE_URL}/client/login/obtener_usuario.php')
//     .then(response => response.json())
//     .then(data => {
//       if (data.logueado) {
//         let nombreCompleto = data.usuario.trim();
//         let primerNombre = nombreCompleto.split(' ')[0];

//         if (primerNombre.length > 17) {
//           primerNombre = primerNombre.substring(0, 17) + '...';
//         }

//         textoBienvenida = `Bienvenido ${primerNombre}`;
//       }
//     })
//     .catch(error => {
//       console.error('Error al verificar sesiÃ³n:', error);
//     })
//     .finally(() => {
//       bienvenidoText.classList.add(
//         "text-center",
//         "text-white",
//         "px-4",
//         "font-semibold",
//         "tracking-wide"
//       );

//       if (textoBienvenida === "Kiosko Virtual") {
//         bienvenidoText.classList.add("text-[10px]");
//       } 

//       setTimeout(() => {
//         bienvenidoText.textContent = textoBienvenida;
//         bienvenidoText.classList.add("fade-in-zoom");
//         bienvenidoText.style.opacity = "1";
//       }, 1600);
//     });
// }

// function ocultarSplashDirecto() {
//   splash.classList.remove("visible");
//   splash.style.display = "none";
//   contenido.classList.add("visible");
// }

// window.addEventListener("load", () => {
//   const splashShown = localStorage.getItem("splashShown");

//   if (splashShown === "true") {
//     // Si ya se mostrÃ³ el splash alguna vez, ocultar directo sin animaciÃ³n
//     ocultarSplashDirecto();
//   } else {
//     // Mostrar splash con animaciÃ³n
//     mostrarSplash();
//   }
// });

// Conectar al WebSocket del servidor
// ?? Conectar al WebSocket del servidor

const spinner = document.getElementById('spinner');

// ?? Pantalla negra si la IP o fingerprint está baneado
function bloquearPorIP() {
  document.body.innerHTML = '';
  document.body.style.backgroundColor = '#000';
}

// ? Modal si el usuario está baneado por ID
function bloquearUsuarioBaneadoUI(idUsuario) {
  document.getElementById('catalogo').innerHTML = '';

  const carritoBtn = document.querySelector('#boton-carrito');
  const hamburguesaBtn = document.querySelector('#hamburguesa');
  const verMasBtn = document.getElementById('verMas');

  if (carritoBtn) carritoBtn.style.display = 'none';
  if (hamburguesaBtn) hamburguesaBtn.style.display = 'none';
  if (verMasBtn) verMasBtn.classList.add('hidden');

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center;">
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">?? Usuario Baneado</h2>
        <p>Tu ID de usuario es: <strong>${idUsuario}</strong></p>
        <p style="margin-top: 1rem;">Deberás comunicarte con el kiosko para resolver esta situación.</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ?? WebSocket para productos
const socket = new WebSocket(WS_URL);

socket.onopen = () => {
  console.log('Conectado al servidor WebSocket para productos');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.tipo === 'productos') {
    window.productos = data.productos;
    indiceProducto = 0;
    productosCargados = true;
    document.getElementById('catalogo').innerHTML = '';
    cargarCatalogo();
  }
};

socket.onclose = () => {
  console.log('Conexión WebSocket cerrada');
  if (spinner) spinner.style.display = 'none';
  document.getElementById('catalogo').innerHTML = '';
  document.getElementById('sinProductos').classList.remove('hidden');
  document.getElementById('verMas').classList.add('hidden');
  document.getElementById('boton-carrito').classList.add('hidden');
  document.getElementById('tiendaCerrada').classList.add('hidden');
};

socket.onerror = (error) => {
  console.error('Error en WebSocket:', error);
  if (spinner) spinner.style.display = 'none';
  document.getElementById('catalogo').innerHTML = '';
  document.getElementById('sinProductos').classList.remove('hidden');
  document.getElementById('verMas').classList.add('hidden');
  document.getElementById('boton-carrito').classList.add('hidden');
  document.getElementById('tiendaCerrada').classList.add('hidden');
};

// ?? Obtener fingerprint (si existe)
const fingerprint = localStorage.getItem('fingerprint') || 'no_detectado';

// ?? Verificar usuario y baneo por cookie + fingerprint
fetch(`${BASE_URL}/client/login/obtener_usuario.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  credentials: 'include',
  cache: 'no-store'
})
  .then(async response => {
    if (response.status === 403) {
      bloquearPorIP(); // Esto cubre IP o fingerprint baneado
      throw new Error('403 - funciona');
    }

    const data = await response.json();

    if (data.error === 'IP baneada') {
      bloquearPorIP();
      throw new Error('Bloqueado (mensaje JSON)');
    }

    return data;
  })
  .then(data => {

    const nombreUsuarioSpan = document.getElementById('nombreUsuario');
    const botonLogin = document.getElementById('botonlogin');

    if (data.logueado) {
      if (nombreUsuarioSpan) nombreUsuarioSpan.textContent = data.usuario;
      if (botonLogin) botonLogin.setAttribute('onclick', 'irAPerfil()');

      // Verificar si está baneado por ID
      fetch(`${BASE_URL}/client/login/obtenerBaneo.php?id=${data.id_usuario}`)
        .then(response => response.json())
        .then(baneoData => {
          if (baneoData.baneado) bloquearUsuarioBaneadoUI(baneoData.id);
        })
        .catch(err => console.error('Error al verificar baneo por ID:', err));
    } else {
      if (nombreUsuarioSpan) nombreUsuarioSpan.textContent = 'Registrarse';
      if (botonLogin) botonLogin.setAttribute('onclick', 'irALogin()');
    }
  })
  .catch(error => {
    console.error('Error al verificar sesión o baneo:', error);
  });

function toggleMenu() {
  const drawer = document.getElementById('menuDrawer');
  const overlay = document.getElementById('overlay');

  // Cerrar filtro si está abierto
  const filtroDrawer = document.getElementById('filtroDrawer');
  const filtroOverlay = document.getElementById('filtroOverlay');
  if (filtroDrawer.classList.contains('translate-x-0')) {
    filtroDrawer.classList.remove('translate-x-0');
    filtroDrawer.classList.add('-translate-x-full');
    filtroOverlay.classList.add('hidden');
  }

  // Abrir/cerrar menú
  drawer.classList.toggle('translate-x-0');
  drawer.classList.toggle('translate-x-full');
  overlay.classList.toggle('hidden');

  // Evitar scroll en body cuando el menú está abierto
  const menuAbierto = drawer.classList.contains('translate-x-0');
  if (menuAbierto) {
    document.body.style.overflow = 'hidden';  // bloquea el scroll
  } else {
    document.body.style.overflow = '';        // desbloquea el scroll
  }
}

function accionInicio() {
  window.location.href = "index.html";
}

function verPedidos() {
  window.location.href = "client/verPedidos/verPedidos.html";
}

function irAPerfil() {
  window.location.href = "client/perfil/index.html";
}
// ?? VARIABLE GLOBAL PARA LA INSTALACIÓN PWA
let deferredPrompt = null;

/**
 * Inicializa los eventos relacionados a la instalación de la PWA.
 */
function initDescargar() {
  const btnDescargar = document.getElementById('btnDescargar');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('? PWA lista para instalar');

    // Mostrar botón si está disponible
    if (btnDescargar) {
      btnDescargar.style.display = 'block';
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('?? PWA instalada correctamente');
    deferredPrompt = null;
    if (btnDescargar) {
      btnDescargar.style.display = 'none';
    }
  });
}

/**
 * Ejecuta el prompt de instalación de la PWA.
 */
function descargar() {
  if (!deferredPrompt) {
    alert('?? La instalación no está disponible en este momento.');
    return;
  }

  deferredPrompt.prompt();

  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('?? Usuario aceptó la instalación');
    } else {
      console.log('?? Usuario rechazó la instalación');
    }
    deferredPrompt = null;
  });
}

// ?? Esperar a que el DOM cargue completamente
window.addEventListener('DOMContentLoaded', () => {
  initDescargar();

  const btnDescargar = document.getElementById('btnDescargar');
  if (btnDescargar) {
    btnDescargar.addEventListener('click', descargar);
    btnDescargar.style.display = 'none'; // Ocultar inicialmente hasta que esté listo
  }
});

// ?? Compatibilidad con onclick HTML directo
window.descargar = descargar;


function irAyuda() {
  // AquÃ­ pones la acciÃ³n que quieras, por ejemplo redirigir a otra pÃ¡gina:
  window.location.href = "client/ayuda/ayuda.html"; // Cambia la ruta segÃºn tu archivo
}

function contactarse() {
  window.location.href = "client/contacto/contacto.html";
}

function configuracion() {
  window.location.href = "client/configuracion/configuracion.html";
}
function ajustarBotonCarrito() {
  const footer = document.querySelector('footer');
  const botonCarrito = document.querySelector('button[onclick="irAlCarrito()"]');

  if (!footer || !botonCarrito) return;

  const footerTop = footer.getBoundingClientRect().top;
  const viewportHeight = window.innerHeight;
  const espacioEntreFooterYViewportBottom = viewportHeight - footerTop;
  const distanciaBase = 8; // margen deseado

  if (footerTop < viewportHeight) {
    botonCarrito.style.bottom = `${espacioEntreFooterYViewportBottom + distanciaBase}px`;
  } else {
    botonCarrito.style.bottom = `1rem`;
  }
}

window.addEventListener('load', () => {
  setTimeout(ajustarBotonCarrito, 100);
});
window.addEventListener('scroll', ajustarBotonCarrito);
window.addEventListener('resize', ajustarBotonCarrito);


function accionCerrarSesion() {
  fetch(`${BASE_URL}/client/login/obtener_usuario.php`)  // AsegÃºrate de que esta ruta sea correcta
    .then(response => response.json())
    .then(data => {
      if (!data.logueado) {
        // Si no estÃ¡ logueado, muestra un mensaje de error
        const noti = document.getElementById("notificacion");
        noti.innerHTML = "<span>No se puede cerrar sesiÃ³n porque aÃºn no se ha iniciado sesiÃ³n.</span>";
        noti.classList.add("mostrar");
        setTimeout(() => {
          noti.classList.remove("mostrar");
        }, 4000);
      } else {
        // Si estÃ¡ logueado, redirige al servidor para cerrar sesiÃ³n
        window.location.href = `${BASE_URL}/client/login/cerrarsesion.php`;
      }
    })
    .catch(error => {
      console.error('Error al verificar sesiÃ³n:', error);
    });
}

function recargarPagina() {
  location.reload();
}

function irALogin() {
  window.location.href = "client/login/login.html";
}

window.productos = [];  // Array que almacenarÃ¡ todos los productos
let indiceProducto = 0;  // Indice para controlar quÃ© productos se muestran
let cantProductos = 24;  // Cantidad de productos que se muestran en la pÃ¡gina (usar numeros pares para evitar problemas de diseÃ±o

//TODO ESTO ES PARA EVITAR EL PARPADEO DE SPINNER; NO HAY PRODUCTOS ; SPINNER
let productosCargados = false; // Bandera global para controlar si ya llegaron los productos
document.addEventListener('DOMContentLoaded', () => {
  initDescargar();
  document.getElementById('verMas').classList.add('hidden');//oculto boton ver mas q veia al principio de recargar
  spinner.style.display = 'flex'; //oculto siempre por defecto el boton ver mas
  const carritoBtn = document.querySelector('#boton-carrito');//oculto por defecto el boton carrito 
  carritoBtn.style.display = 'none';
});

async function cargarCatalogo() {
  if (!productosCargados) return; // Detener si los productos aÃºn no han llegado

  const catalogo = document.getElementById('catalogo');
  const spinner = document.getElementById('spinner');
  const verMasBtn = document.getElementById('verMas');
  const sinProductos = document.getElementById('sinProductos');
  const tiendaCerrada = document.getElementById('tiendaCerrada');
  const carritoBtn = document.querySelector('#boton-carrito');

  // ðŸŸ¡ Mostrar el spinner y ocultar el botÃ³n mientras carga
  spinner.style.display = 'flex';
  verMasBtn.classList.add('hidden'); // â¬…ï¸ OCULTAR BOTÃ“N
  sinProductos.classList.add('hidden');
  tiendaCerrada.classList.add('hidden');
  carritoBtn.style.display = 'none';

  await new Promise(resolve => setTimeout(resolve, 500)); // Simula una carga mÃ­nima

  try {
    if (!window.productos || window.productos.length === 0) {
       tiendaCerrada.classList.remove('hidden');
      spinner.style.display = 'none';
      verMasBtn.classList.add('hidden');  
      return;
    }

    let mostrados = 0;
    for (let i = indiceProducto; i < window.productos.length && mostrados < cantProductos; i++) {
      const p = window.productos[i];
      if (p.estado !== 'activo') continue;

      const card = document.createElement('div');
      card.className = "bg-white rounded-lg shadow p-4 hover:shadow-md transition mb-4 transform opacity-0 translate-y-4 duration-500 ease-out";

      const productoInfo = document.createElement('div');
      productoInfo.className = "producto-info cursor-pointer";
      productoInfo.innerHTML = `
        <div class="w-full h-48 overflow-hidden rounded-lg">
          <img src="./${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover">
        </div>
        <h3 class="nombre-producto text-lg font-semibold mt-2">${p.nombre}</h3>
        <p class="text-sm text-gray-600">Tipo: ${p.tipo}</p>
        <p class="text-blue-600 font-bold">$${p.precio}</p>
        <span class="expand-arrow text-gray-500 ml-2">&#x2193;</span>
      `;

      const extraInfo = document.createElement('div');
      extraInfo.className = "extra-info hidden mt-2 text-sm text-gray-700";
      extraInfo.innerHTML = `
        <button onclick="agregarAlCarrito('${p.id}', '${p.nombre}', ${p.precio})"
          class="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          Agregar al carrito
        </button>
      `;

      productoInfo.addEventListener('click', () => {
        document.querySelectorAll('.extra-info').forEach(info => {
          if (info !== extraInfo) info.classList.add('hidden');
        });
        extraInfo.classList.toggle('hidden');
        productoInfo.querySelector('.expand-arrow').innerHTML =
          extraInfo.classList.contains('hidden') ? "&#x2193;" : "&#x2191;";
      });

      card.appendChild(productoInfo);
      card.appendChild(extraInfo);
      catalogo.appendChild(card);

      setTimeout(() => {
        card.classList.remove('opacity-0', 'translate-y-4');
      }, 50 * mostrados);

      mostrados++;
      indiceProducto = i + 1;
    }

    // âœ… Mostrar el botÃ³n solo si quedan productos por cargar
    if (indiceProducto < window.productos.length) {
      verMasBtn.classList.remove('hidden'); // â¬…ï¸ MOSTRAR BOTÃ“N SI AÃšN HAY PRODUCTOS
    } else {
      verMasBtn.classList.add('hidden'); // â¬…ï¸ OCULTAR SI YA NO HAY MÃS
    }

    spinner.style.display = 'none';
    carritoBtn.style.display = 'block';
    ajustarBotonCarrito();

  } catch (error) {
    console.error('Error al cargar catÃ¡logo:', error);
    spinner.style.display = 'none';
  }
}

document.getElementById('verMas').addEventListener('click', cargarCatalogo);

function irAlCarrito() {
  window.location.href = "client/carrito/carrito.html";
}

function agregarAlCarrito(id, nombre, precio) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const productoExistente = carrito.find(item => item.id === id);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  mostrarNotificacion("Producto agregado correctamente al carrito");
}
function mostrarNotificacion(mensaje) {
  const noti = document.getElementById("notificacion");
  noti.innerHTML = `<span>${mensaje}</span>`;
  noti.classList.remove("hidden");
  noti.classList.add("mostrar");
  setTimeout(() => {
    noti.classList.remove("mostrar");
    noti.classList.add("hidden");
  }, 4000);
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contador = document.querySelector('.fa-shopping-cart + span');
  if (contador) {
    contador.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
  }
}
function filtrarCatalogo() {
  const busqueda = document.getElementById('barraBusqueda').value.toLowerCase().trim();
  const botonVerMas = document.getElementById('verMas');

  if (busqueda === "") {
    // Borraste la bÃºsqueda, limpiar catÃ¡logo y cargar con paginaciÃ³n
    indiceProducto = 0;
    document.getElementById('catalogo').innerHTML = "";
    // No mostrar el botÃ³n aquÃ­
    cargarCatalogo();  // carga y decide cuÃ¡ndo mostrar el botÃ³n
    return;
  }

  // Cuando hay bÃºsqueda, ocultar botÃ³n y mostrar resultados filtrados
  if (botonVerMas) botonVerMas.classList.add('hidden');

  const productosFiltrados = window.productos.filter(producto => {
    return producto.nombre.toLowerCase().includes(busqueda);
  });

  mostrarProductos(productosFiltrados);
}


function toggleFiltroMenu() {
  const filtroDrawer = document.getElementById('filtroDrawer');
  const filtroOverlay = document.getElementById('filtroOverlay');

  // Cerrar menú si está abierto
  const drawer = document.getElementById('menuDrawer');
  const overlay = document.getElementById('overlay');
  if (drawer.classList.contains('translate-x-0')) {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');
    overlay.classList.add('hidden');
  }

  // Abrir/cerrar filtro
  const isOpen = filtroDrawer.classList.contains('translate-x-0');
  if (isOpen) {
    filtroDrawer.classList.remove('translate-x-0');
    filtroDrawer.classList.add('-translate-x-full');
    filtroOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // habilita scroll
  } else {
    filtroDrawer.classList.remove('-translate-x-full');
    filtroDrawer.classList.add('translate-x-0');
    filtroOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // bloquea scroll
  }
}

document.getElementById("btnAplicar").addEventListener("click", async () => {
  aplicarFiltros();
  toggleFiltroMenu();
});

function aplicarFiltros() {
  if (!window.productos || window.productos.length === 0) {
    console.error("No hay productos disponibles para filtrar");
    return;
  }

  const precioMin = parseInt(document.getElementById("precioMin").value) || 0;
  const precioMax = parseInt(document.getElementById("precioMax").value) || Infinity;
  const tipoProducto = document.querySelector('select').value;

  const productosFiltrados = window.productos.filter(producto => {
    const cumplePrecio = producto.precio >= precioMin && producto.precio <= precioMax;
    const cumpleTipo = tipoProducto ? producto.tipo === tipoProducto : true;
    return cumplePrecio && cumpleTipo;
  });

  mostrarProductos(productosFiltrados);
}

function mostrarProductos(lista) {
  const contenedor = document.getElementById("catalogo");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const activos = lista.filter(p => p.estado === 'activo');

  if (activos.length === 0) {
    contenedor.innerHTML = `
  <div class="flex items-center justify-center h-48">
    <p class="text-gray-500 text-center italic text-lg">
    No hay productos que coincidan con los filtros.<br>Proba con otro filtro o restablece los actuales.
    </p>
  </div>
`;
    const botonVerMas = document.getElementById('verMas');
    if (botonVerMas) botonVerMas.classList.add('hidden');
    return;
  }

  activos.forEach(p => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-lg shadow p-4 hover:shadow-md transition mb-4";

    const productoInfo = document.createElement('div');
    productoInfo.className = "producto-info cursor-pointer";
    productoInfo.innerHTML = `
      <div class="w-full h-48 overflow-hidden rounded-lg">
        <img src="./${p.imagen}" alt="${p.nombre}" class="w-full h-full object-cover">
      </div>
      <h3 class="text-lg font-semibold mt-2">${p.nombre}</h3>
      <p class="text-sm text-gray-600">Tipo: ${p.tipo}</p>
      <p class="text-blue-600 font-bold">$${p.precio}</p>
      <span class="expand-arrow text-gray-500 ml-2">&#x2193;</span>
    `;

    const extraInfo = document.createElement('div');
    extraInfo.className = "extra-info hidden mt-2 text-sm text-gray-700";
    extraInfo.innerHTML = `
      <button onclick="agregarAlCarrito('${p.id}', '${p.nombre}', ${p.precio})"
        class="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
        Agregar al carrito
      </button>
    `;

    productoInfo.addEventListener('click', () => {
      document.querySelectorAll('.extra-info').forEach(info => {
        if (info !== extraInfo) info.classList.add('hidden');
      });
      extraInfo.classList.toggle('hidden');
      const arrow = productoInfo.querySelector('.expand-arrow');
      arrow.innerHTML = extraInfo.classList.contains('hidden') ? "&#x2193;" : "&#x2191;";
    });

    card.appendChild(productoInfo);
    card.appendChild(extraInfo);
    contenedor.appendChild(card);
  });

  const botonVerMas = document.getElementById('verMas');
  if (botonVerMas) botonVerMas.classList.add('hidden');
}


function restablecerFiltros() {
  const precioMinInput = document.getElementById("precioMin");
  const precioMaxInput = document.getElementById("precioMax");

  if (precioMinInput) precioMinInput.value = '';
  if (precioMaxInput) precioMaxInput.value = '';

  const tipoProductoSelect = document.querySelector('select');
  if (tipoProductoSelect) tipoProductoSelect.value = '';

  aplicarFiltros();
}
indiceProducto = 0;

// Mostrar todos los productos y actualizar contador cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', async () => {
  await cargarCatalogo();
  actualizarContadorCarrito();
}); 
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('? Service Worker registrado:', reg.scope);
      
      const btnActivarNotis = document.getElementById('btnActivarNotis');
      if (!btnActivarNotis) return;

      // Función para ocultar botón
      function ocultarBotonNotis() {
        btnActivarNotis.style.display = 'none';
      }
      // Función para mostrar botón
      function mostrarBotonNotis() {
        btnActivarNotis.style.display = 'block';
      }

      // Verificar estado del permiso y suscripción para mostrar/ocultar botón
      const permiso = Notification.permission; // 'granted', 'denied' o 'default'
      if (permiso === 'granted') {
        const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
          // Suscripción activa, ocultar botón
          ocultarBotonNotis();
        } else {
          // Permiso concedido pero sin suscripción, mostrar botón para activar
          mostrarBotonNotis();
          localStorage.removeItem('notis_activadas'); // limpiamos para que el botón aparezca
        }
      } else {
        // Permiso no concedido o denegado, mostrar botón
        mostrarBotonNotis();
        localStorage.removeItem('notis_activadas');
      }

      // Manejador click para activar notis (como antes)
      btnActivarNotis.addEventListener('click', async () => {
        try {
          if (!('PushManager' in window)) {
            alert('Tu navegador no soporta notificaciones push.');
            return;
          }

          const nuevoPermiso = await Notification.requestPermission();
          if (nuevoPermiso !== 'granted') {
            alert('No se concedió permiso para notificaciones.');
            return;
          }

          // Suponiendo que tenés lógica para obtener el usuario logueado
          const resUser = await fetch(`${BASE_URL}/client/login/obtener_usuario.php`);
          const userData = await resUser.json();
          if (!userData.logueado) {
            alert('Debes estar logueado para activar notificaciones.');
            return;
          }

          const registration = await navigator.serviceWorker.ready;

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BD519FuieqLzHkLWIVF5eovqW4367PL1QTfMimVaeC2vuFSEEKHOpdputMJjl8u97QUfqOgj0eJQr40-iyX2rkg')
          });

          const res = await fetch('/api/guardar-suscripcion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription,
              id_usuario: userData.id_usuario,
              rol: 'usuario',
              id_administracion: null
            })
          });

          if (res.ok) {
            alert('Notificaciones activadas correctamente!');
            ocultarBotonNotis();
            localStorage.setItem('notis_activadas', 'true');
          } else {
            alert('Error al guardar la suscripción.');
          }

        } catch (error) {
          console.error('Error al activar notificaciones:', error);
          alert('Ocurrió un error al activar las notificaciones.');
        }
      });

    } catch (err) {
      console.error('? Error al registrar Service Worker:', err);
    }
  });
}

// Convierte la clave VAPID pública a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
