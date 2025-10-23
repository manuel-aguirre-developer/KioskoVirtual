const BASE_URL = "http://localhost/kiosko";
const WS_URL = "ws://localhost:3006/kiosko";

verificarSesionYBaneo();  
mostrarCarrito();
async function verificarSesionYBaneo() {
  try {
    const resUsuario = await fetch(`${BASE_URL}/client/login/obtener_usuario.php`);
    const data = await resUsuario.json();

    const nombreUsuarioSpan = document.getElementById('nombreUsuario');
    const botonLogin = document.getElementById('botonlogin');

    if (data.logueado) {
      if (nombreUsuarioSpan) {
        nombreUsuarioSpan.textContent = data.usuario;
      }
      if (botonLogin) {
        botonLogin.setAttribute('onclick', 'irAPerfil()');
      }

      // Verifica si está baneado
      const resBaneo = await fetch(`${BASE_URL}/client/login/obtenerBaneo.php?id=${data.id_usuario}`);
      const baneoData = await resBaneo.json();

      if (baneoData.baneado) {
        // Oculta botones y muestra modal
        const catalogo = document.getElementById('catalogo');
        if (catalogo) catalogo.innerHTML = '';

        const carritoBtn = document.querySelector('#boton-carrito');
        const hamburguesaBtn = document.querySelector('#hamburguesa');
        const verMasBtn = document.getElementById('verMas');

        if (carritoBtn) carritoBtn.style.display = 'none';
        if (hamburguesaBtn) hamburguesaBtn.style.display = 'none';
        if (verMasBtn) verMasBtn.classList.add('hidden');

        // Ocultar también el botón de login para evitar acciones si está baneado
        if (botonLogin) botonLogin.style.display = 'none';

        // Mostrar modal baneado
        const modalBaneado = document.getElementById('modalBaneado');
        if (modalBaneado) {
          modalBaneado.classList.remove('hidden');

          // Poner ID usuario en el modal
          const userIdSpan = modalBaneado.querySelector('.userId');
          if (userIdSpan) userIdSpan.textContent = baneoData.id || data.id_usuario || '';
        }
      } else {
        // En caso de que no esté baneado, aseguramos que botones estén visibles
        const carritoBtn = document.querySelector('#boton-carrito');
        const hamburguesaBtn = document.querySelector('#hamburguesa');
        const verMasBtn = document.getElementById('verMas');

        if (carritoBtn) carritoBtn.style.display = '';
        if (hambuesaBtn) hamburguesaBtn.style.display = '';
        if (verMasBtn) verMasBtn.classList.remove('hidden');

        if (botonLogin) botonLogin.style.display = '';
      }

    } else {
      if (nombreUsuarioSpan) {
        nombreUsuarioSpan.textContent = 'Registrarse';
      }
      if (botonLogin) {
        botonLogin.setAttribute('onclick', 'irALogin()');
        botonLogin.style.display = ''; // Asegura que botón esté visible para login
      }
    }
  } catch (error) {
    console.error('Error al verificar sesión y baneo:', error);
  }
}


function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('carrito');
  const total = document.getElementById('total');

  const btnComprar = document.getElementById("btnComprar");
  const btnVaciar = document.getElementById("btnVaciar");

  contenedor.innerHTML = '';
  let suma = 0;

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p class="text-gray-600">No hay productos en el carrito.</p>';
    total.textContent = '';
    return;
  }

  carrito.forEach((p, index) => {
    suma += p.precio * p.cantidad;

    const item = document.createElement('div');
    item.className = 'bg-white p-4 rounded shadow flex justify-between items-center';

    item.innerHTML = `
      <div>
        <h3 class="font-semibold">${p.nombre}</h3>
        <p class="text-sm text-gray-600">$${p.precio} c/u</p>
        <div class="flex items-center mt-2">
          <button onclick="cambiarCantidad(${index}, -1)" class="px-2 bg-gray-300 text-black rounded-l">−</button>
          <span class="px-3 border-t border-b" id="cantidad-${index}">${p.cantidad}</span>
          <button onclick="cambiarCantidad(${index}, 1)" class="px-2 bg-gray-300 text-black rounded-r">+</button>
        </div>
      </div>
      <button onclick="eliminarProducto(${index})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>
    `;

    contenedor.appendChild(item);
  });

  total.textContent = `Total: $${suma.toFixed(2)}`;
}

function cambiarCantidad(index, delta) {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if (!carrito[index]) return;

  carrito[index].cantidad += delta;
  if (carrito[index].cantidad < 1) carrito[index].cantidad = 1;

  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
}

function eliminarProducto(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
}

function vaciarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  if (total < 1) {
    mostrarNotificacion("El carrito ya está vacío");
    return;
  }

  document.getElementById('modalConfirmarVaciado').classList.remove('hidden');
}

function confirmarVaciado() {
  localStorage.removeItem('carrito');
  localStorage.removeItem('mensajePedidoPersonalizado');
  cerrarModal('modalConfirmarVaciado');
  mostrarCarrito();
}

function abrirMetodoPago() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  if (total < 1) {
    mostrarNotificacion("No hay productos en el carrito.");
    return;
  }

  document.getElementById("modalMetodo").classList.remove("hidden");
}

function cerrarMetodo() {
  document.getElementById("modalMetodo").classList.add("hidden");
}

function pagarEfectivo() {
  fetch(`${BASE_URL}/client/carrito/obtener_user_compra.php`)
    .then(response => response.json())
    .then(data => {
      cerrarMetodo();

      if (!data.logueado) {
        document.getElementById("modalLogin").classList.remove("hidden");
        return;
      }

      switch (data.estado) {
        case "pendiente":
          document.getElementById("modalPendiente").classList.remove("hidden");
          break;
        case "baneado":
          document.getElementById("modalBaneado").classList.remove("hidden");
          break;
        case "aprobado":
          window.location.href = "../pagos/comprar.html?metodo=efectivo";
          break;
        default:
          console.error("Estado de cuenta desconocido");
      }
    })
    .catch(error => {
      console.error('Error al verificar sesión:', error);
    });
}

function mostrarNotificacion(mensaje) {
  const noti = document.getElementById("notificacion");
  noti.innerHTML = `<span>${mensaje}</span>`;
  noti.classList.add("mostrar");
  setTimeout(() => {
    noti.classList.remove("mostrar");
  }, 4000);
}

document.getElementById('pagarTransferencia').addEventListener('click', async () => {
  const userRes = await fetch(`${BASE_URL}/client/carrito/obtener_user_compra.php`);
  const userData = await userRes.json();
    
  if (!userData.logueado) {
    cerrarMetodo();
    document.getElementById("modalLogin").classList.remove("hidden");
    return;
  }

  if (userData.estado == "baneado") {
    document.getElementById("modalBaneado").classList.remove("hidden");
    return;
  }

  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const mensaje = localStorage.getItem("mensajePedidoPersonalizado") || '';

  const itemsMP = carrito.map(p => ({
    id: p.id,
    title: p.nombre,
    unit_price: Number(p.precio),
    quantity: p.cantidad
  }));

  try {
    const res = await fetch('/api/payments/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: itemsMP,
        usuario: { id: userData.id_usuario },
        pago_en: 'transferencia',
        mensaje: mensaje,
        total
      })
    });
    
     if (!res.ok) {
      // Si el backend responde con error, lo detectamos acá
      const errorText = await res.text();
      throw new Error(`Error en respuesta del servidor: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();

    if (data && data.payment_url) {
      window.location.href = data.payment_url;
    } else {
      alert("Error al generar el link de pago.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un problema al conectarse con Mercado Pago.");
  }
});

function redirigirLogin() {
  window.location.href = "../login/login.html";
}

function cerrarLoginModal() {
  document.getElementById("modalLogin").classList.add("hidden");
}

function cerrarModal() {
  document.getElementById("modalPendiente").classList.add("hidden");
  document.getElementById("modalBaneado").classList.add("hidden");
  document.getElementById("modalConfirmarVaciado").classList.add("hidden");
}

// Función para guardar el mensaje personalizado
function guardarMensajePersonalizado() {
  const mensaje = document.getElementById('mensajePersonalizado').value.trim();
  localStorage.setItem('mensajePedidoPersonalizado', mensaje);
  document.getElementById('modalMensaje').classList.add('hidden');
  mostrarNotificacion("Mensaje guardado para tu pedido");
}

mostrarCarrito();
