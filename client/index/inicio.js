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

  fetch('http://localhost/kioskoTecnica4/client/login/obtener_usuario.php')
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
      console.error('Error al verificar sesión:', error);
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

//   // Después de mostrar splash, hacer fade out y mostrar contenido
//   setTimeout(() => {
//     splash.classList.add("fade-out");
//     contenido.classList.add("visible");

//     setTimeout(() => {
//       splash.style.display = "none"; // Ocultar completamente splash
//       localStorage.setItem("splashShown", "true"); // Guardar para no mostrar más
//     }, 1000);
//   }, 4500);
// }

// function cargarTextoBienvenida() {
//   let textoBienvenida = "Kiosko Virtual"; // default si no está logueado

//   fetch('http://localhost/kioskoTecnica4/client/login/obtener_usuario.php')
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
//       console.error('Error al verificar sesión:', error);
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
//     // Si ya se mostró el splash alguna vez, ocultar directo sin animación
//     ocultarSplashDirecto();
//   } else {
//     // Mostrar splash con animación
//     mostrarSplash();
//   }
// });

// Conectar al WebSocket del servidor
const socket = new WebSocket('ws://localhost:3006');

socket.onopen = () => {
  console.log('Conectado al servidor WebSocket para productos');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.tipo === 'productos') {
    window.productos = data.productos;
    indiceProducto = 0;
    productosCargados = true;  // ✅ Activa la bandera
    document.getElementById('catalogo').innerHTML = '';
    cargarCatalogo();
  }
};

socket.onclose = () => {
  console.log('Conexión WebSocket cerrada');
  spinner.style.display = 'none';
  document.getElementById('catalogo').innerHTML = '';  // <-- limpiar catálogo
  document.getElementById('sinProductos').classList.remove('hidden');
  document.getElementById('verMas').classList.add('hidden');
};

socket.onerror = (error) => {
  console.error('Error en WebSocket:', error);
  spinner.style.display = 'none';
  document.getElementById('catalogo').innerHTML = '';  // <-- limpiar catálogo
  document.getElementById('sinProductos').classList.remove('hidden');
  document.getElementById('verMas').classList.add('hidden');//boton puto aparece en todos lados

};
// Primero obtienes datos del usuario (sin baneado aún)
fetch('http://localhost/kioskoTecnica4/client/login/obtener_usuario.php')
  .then(response => response.json())
  .then(data => {
    const nombreUsuarioSpan = document.getElementById('nombreUsuario');
    const botonLogin = document.getElementById('botonlogin');

    if (data.logueado) {
      if (nombreUsuarioSpan) {
        nombreUsuarioSpan.textContent = data.usuario;
      }
      botonLogin.setAttribute('onclick', 'irAPerfil()');

      // Ahora verificamos si está baneado haciendo una segunda petición con su ID
      fetch(`http://localhost/kioskoTecnica4/client/login/obtenerBaneo.php?id=${data.id_usuario}`)
        .then(response => response.json())
        .then(baneoData => {
          if (baneoData.baneado) {
            // Si está baneado, bloqueamos botones y mostramos modal
            document.getElementById('catalogo').innerHTML = '';
            const carritoBtn = document.querySelector('#boton-carrito');
            const hamburguesaBtn = document.querySelector('#hamburguesa');
            const verMasBtn = document.getElementById('verMas');

            if (carritoBtn) carritoBtn.style.display = 'none';
            if (hamburguesaBtn) hamburguesaBtn.style.display = 'none';
            if (verMasBtn) verMasBtn.classList.add('hidden');

            const modal = document.createElement('div');
            modal.innerHTML = `
              <div style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div style="
                  background: white; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center;">
                  <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">🚫 Usuario Baneado</h2>
                  <p>Tu ID de usuario es: <strong>${baneoData.id}</strong></p>
                  <p style="margin-top: 1rem;">Deberás comunicarte con el kiosko para resolver esta situación.</p>
                </div>
              </div>
            `;
            document.body.appendChild(modal);
          }
        })
        .catch(err => {
          console.error('Error al verificar baneo:', err);
        });

    } else {
      if (nombreUsuarioSpan) {
        nombreUsuarioSpan.textContent = 'Registrarse';
      }
      botonLogin.setAttribute('onclick', 'irALogin()');
    }
  })
  .catch(error => {
    console.error('Error al verificar sesión:', error);
  });

// Función para mostrar el menú lateral
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
}

function accionInicio() {
  window.location.href = "index.html";
}

function verPedidos() {
  window.location.href = "http://localhost/kioskoTecnica4/client/verPedidos/verPedidos.html";
}

function irAPerfil() {
  // Redirige al usuario a la carpeta ../perfil
  window.location.href = "http://localhost/kioskoTecnica4/client/perfil/index.html";
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
  fetch('http://localhost/kioskoTecnica4/client/login/obtener_usuario.php')  // Asegúrate de que esta ruta sea correcta
    .then(response => response.json())
    .then(data => {
      if (!data.logueado) {
        // Si no está logueado, muestra un mensaje de error
        const noti = document.getElementById("notificacion");
        noti.innerHTML = "<span>No se puede cerrar sesión porque aún no se ha iniciado sesión.</span>";
        noti.classList.add("mostrar");
        setTimeout(() => {
          noti.classList.remove("mostrar");
        }, 4000);
      } else {
        // Si está logueado, redirige al servidor para cerrar sesión
        window.location.href = "http://localhost/kioskoTecnica4/client/login/cerrarsesion.php";
      }
    })
    .catch(error => {
      console.error('Error al verificar sesión:', error);
    });
}

function recargarPagina() {
  location.reload();
}

function irALogin() {
  window.location.href = "client/login/login.html";
}

window.productos = [];  // Array que almacenará todos los productos
let indiceProducto = 0;  // Indice para controlar qué productos se muestran
let cantProductos = 16;  // Cantidad de productos que se muestran en la página (usar numeros pares para evitar problemas de diseño

//TODO ESTO ES PARA EVITAR EL PARPADEO DE SPINNER; NO HAY PRODUCTOS ; SPINNER
let productosCargados = false; // Bandera global para controlar si ya llegaron los productos
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('verMas').classList.add('hidden');//oculto boton ver mas q veia al principio de recargar
  spinner.style.display = 'flex'; //oculto siempre por defecto el boton ver mas
  const carritoBtn = document.querySelector('#boton-carrito');//oculto por defecto el boton carrito 
  carritoBtn.style.display = 'none';
});

async function cargarCatalogo() {
  if (!productosCargados) return; // Detener si los productos aún no han llegado

  const catalogo = document.getElementById('catalogo');
  const spinner = document.getElementById('spinner');
  const verMasBtn = document.getElementById('verMas');
  const sinProductos = document.getElementById('sinProductos');
  const carritoBtn = document.querySelector('#boton-carrito');

  // 🟡 Mostrar el spinner y ocultar el botón mientras carga
  spinner.style.display = 'flex';
  verMasBtn.classList.add('hidden'); // ⬅️ OCULTAR BOTÓN
  sinProductos.classList.add('hidden');
  carritoBtn.style.display = 'none';

  await new Promise(resolve => setTimeout(resolve, 500)); // Simula una carga mínima

  try {
    if (!window.productos || window.productos.length === 0) {
      sinProductos.classList.remove('hidden');
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

    // ✅ Mostrar el botón solo si quedan productos por cargar
    if (indiceProducto < window.productos.length) {
      verMasBtn.classList.remove('hidden'); // ⬅️ MOSTRAR BOTÓN SI AÚN HAY PRODUCTOS
    } else {
      verMasBtn.classList.add('hidden'); // ⬅️ OCULTAR SI YA NO HAY MÁS
    }

    spinner.style.display = 'none';
    carritoBtn.style.display = 'block';
    ajustarBotonCarrito();

  } catch (error) {
    console.error('Error al cargar catálogo:', error);
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
    // Borraste la búsqueda, limpiar catálogo y cargar con paginación
    indiceProducto = 0;
    document.getElementById('catalogo').innerHTML = "";
    // No mostrar el botón aquí
    cargarCatalogo();  // carga y decide cuándo mostrar el botón
    return;
  }

  // Cuando hay búsqueda, ocultar botón y mostrar resultados filtrados
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
  } else {
    filtroDrawer.classList.remove('-translate-x-full');
    filtroDrawer.classList.add('translate-x-0');
    filtroOverlay.classList.remove('hidden');
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

  lista.filter(p => p.estado === 'activo').forEach(p => {
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

function abrirModal(tipo) {
  const modal = document.getElementById('modalInfo');
  const titulo = document.getElementById('modalTitulo');
  const contenido = document.getElementById('modalContenido');

  if (tipo === 'privacidad') {
    titulo.textContent = 'Política de Privacidad';
    contenido.innerHTML = `
      <p><em>Última actualización: 24 de mayo de 2025</em></p>

<p>La privacidad de nuestros usuarios es importante. A continuación, te explicamos cómo recopilamos, usamos y protegemos tu información personal.</p>

<p><strong>1. Información que recopilamos</strong><br>
Podemos recopilar la siguiente información:<br>
- Nombre y apellido<br>
- Dirección de correo electrónico<br>
- Teléfono<br>
- Datos de sesión o navegación (cookies, dirección IP, tipo de dispositivo)<br>
- Datos de actividad dentro de la aplicación, como registros de ventas o pagos realizados<br>
- Información financiera relacionada con los ingresos generados a través del uso de la plataforma, con el fin de evaluar el desempeño comercial del producto o servicio ofrecido<br>
</p>


<p><strong>2. Cómo usamos la información</strong><br>
Usamos la información para:<br>
- Procesar compras y pedidos<br>
- Contactarte en relación con tus pedidos o tu cuenta<br>
- Mejorar el sitio web y la experiencia del usuario<br>
- Registrar y analizar transacciones y pagos realizados para evaluar el rendimiento comercial y las ganancias generadas</p>


<p><strong>3. Protección de datos</strong><br>
Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales. Aunque hacemos nuestro mejor esfuerzo, ningún sistema es 100% seguro.</p>

<p><strong>4. Compartir información</strong><br>
<strong>No vendemos, alquilamos ni compartimos tu información personal</strong> con terceros, excepto en los siguientes casos:<br>
- Servicios de pago y envío (proveedores externos con los que trabajamos)<br>
- Cuando sea requerido por ley o autoridad judicial</p>

<p><strong>5. Cookies</strong><br>
Este sitio utiliza cookies para mejorar la experiencia del usuario. Puedes configurar tu navegador para bloquearlas, pero algunas funciones pueden verse afectadas.</p>

<p><strong>6. Tus derechos</strong><br>
Tienes derecho a:<br>
- Acceder a tus datos personales<br>
- Corregir información incorrecta<br>
- Solicitar la eliminación de tu cuenta y datos<br>
Para ejercer estos derechos, escríbenos a: <strong>aapc.arg@gmail.com</strong></p>

<p><strong>7. Cambios en la política</strong><br>
Nos reservamos el derecho a modificar esta política de privacidad. Los cambios serán efectivos al ser publicados en esta página.</p>
    `;
  } else if (tipo === 'terminos') {
    titulo.textContent = 'Términos y Condiciones';
    contenido.innerHTML = `
      <p><em>Última actualización: 24 de mayo de 2025</em></p>

<p>Bienvenido/a a <strong>A.A.P.C</strong>. Al acceder o usar este sitio web, aceptas cumplir con los siguientes Términos y Condiciones. Si no estás de acuerdo con ellos, por favor, no utilices el sitio.</p>

<p><strong>1. Aceptación de los términos</strong><br>
Al utilizar nuestros servicios, aceptas estos términos en su totalidad. Si usas el sitio en representación de una empresa u otra entidad, aseguras que tienes la autoridad legal para obligarla a estos términos.</p>

<p><strong>2. Uso del sitio</strong><br>
Puedes usar el sitio solo para fines legales y conforme a nuestras políticas. No puedes:<br>
- Utilizar bots, scrapers u otras herramientas automáticas para acceder al sitio.<br>
- Interferir con el funcionamiento del sitio o sus funciones.<br>
- Utilizar información falsa o suplantar identidades al registrarte o realizar compras.</p>

<p><strong>3. Registro de usuario</strong><br>
Al registrarte, te comprometes a proporcionar información veraz, completa y actualizada. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>

<p><strong>4. Compras</strong><br>
Al realizar una compra en el sitio:<br>
- Aceptas proporcionar información válida para el pago.<br>
- Aceptas que los precios y disponibilidad pueden cambiar sin previo aviso.<br>
- Nos reservamos el derecho de rechazar o cancelar pedidos si se detectan errores, fraude, o cualquier violación a estos términos.</p>

<p><strong>5. Propiedad intelectual</strong><br>
Todo el contenido de este sitio (texto, imágenes, logos, diseño, etc.) es propiedad de <strong>A.A.P.C</strong>, y está protegido por derechos de autor y otras leyes. No está permitido copiar, reproducir o distribuir el contenido sin autorización previa por escrito.</p>

<p><strong>6. Derechos de autor © 2025 A.A.P.C</strong><br>
Todos los derechos reservados. Ninguna parte de este sitio web, incluyendo pero no limitándose a textos, gráficos, logotipos, iconos de botones, imágenes, clips de audio, descargas digitales y compilaciones de datos, puede ser reproducida, copiada, transmitida, distribuida, descargada o publicada de ninguna manera sin el permiso previo por escrito de A.A.P.C.<br>
El uso no autorizado puede violar las leyes de copyright, marcas registradas y otras regulaciones aplicables. Para consultas sobre permisos, por favor contáctanos en: <a href="mailto:aapc.arg@gmail.com">aapc.arg@gmail.com</a>.</p>

<p><strong>7. Modificaciones</strong><br>
Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones se harán efectivas una vez publicadas en esta misma página. Es tu responsabilidad revisarlas periódicamente.</p>

<p><strong>8. Limitación de responsabilidad</strong><br>
No nos hacemos responsables por:<br>
- Daños directos, indirectos, incidentales o consecuentes por el uso del sitio.<br>
- Errores en el contenido o interrupciones del servicio.<br>
- Virus o ataques que puedan afectar tus dispositivos.</p>
    `;
  }

  modal.classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modalInfo').classList.add('hidden');
} 