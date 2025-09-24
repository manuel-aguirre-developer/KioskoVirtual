document.addEventListener('DOMContentLoaded', () => {
  verificarSesionYBaneo();
});

async function verificarSesionYBaneo() {
  try {
    const resUsuario = await fetch('http://138.219.42.29/client/login/obtener_usuario.php');
    const data = await resUsuario.json();

    const botonLogin = document.getElementById('botonlogin');

    if (data.logueado) {
      if (botonLogin) {
        botonLogin.setAttribute('onclick', 'irAPerfil()');
      }

      // Verifica si está baneado
      const resBaneo = await fetch(`http://138.219.42.29/client/login/obtenerBaneo.php?id=${data.id_usuario}`);
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

        if (botonLogin) botonLogin.style.display = 'none';

        // Mostrar modal baneado
        const modalBaneado = document.getElementById('modalBaneado');
        if (modalBaneado) {
          modalBaneado.classList.remove('hidden');
          modalBaneado.style.display = 'flex';  // Asegurar display flex

          const userIdSpan = modalBaneado.querySelector('.userId');
          if (userIdSpan) userIdSpan.textContent = baneoData.id || data.id_usuario || '';
        }
      } else {
        // Mostrar botones si no está baneado
        const carritoBtn = document.querySelector('#boton-carrito');
        const hamburguesaBtn = document.querySelector('#hamburguesa');
        const verMasBtn = document.getElementById('verMas');

        if (carritoBtn) carritoBtn.style.display = '';
        if (hamburguesaBtn) hamburguesaBtn.style.display = '';
        if (verMasBtn) verMasBtn.classList.remove('hidden');

        if (botonLogin) botonLogin.style.display = '';
      }

    } else {
      if (botonLogin) {
        botonLogin.setAttribute('onclick', 'irALogin()');
        botonLogin.style.display = '';
      }
    }
  } catch (error) {
    console.error('Error al verificar sesión y baneo:', error);
  }
}

function ajustarBotonesSesion(logueado) {
  const btnCerrar = document.getElementById('botonCerrarSesion');
  if (btnCerrar) {
    btnCerrar.style.display = logueado ? 'block' : 'none';
  }
}

function cargarPerfil() {
  fetch('http://138.219.42.29/client/perfil/perfil.php')
    .then(response => response.json())
    .then(data => {
      const form = document.getElementById('usuarioForm');

      ajustarBotonesSesion(data.logueado);

      if (data.logueado) {
        const u = data.usuario;

        form.innerHTML = `
          <div><strong>ID:</strong> ${u.id}</div>

          <div>
            <label class="block font-semibold">Nombre:</label>
            <input type="text" name="usuario" value="${u.usuario}" class="border p-2 w-full rounded" />
          </div>

          <div>
            <label class="block font-semibold">Email:</label>
            <input type="email" name="email" value="${u.email}" class="border p-2 w-full rounded" />
          </div>

          <div>
            <label class="block font-semibold">Curso:</label>
            <input type="text" name="curso" value="${u.curso ? u.curso : "Curso no ingresado"}" class="border p-2 w-full rounded" />
          </div>

          <div>
            <label class="block font-semibold">Teléfono:</label>
            <input type="text" name="telefono" value="${u.telefono}" class="border p-2 w-full rounded" />
          </div>

          <div><strong>Estado:</strong> ${u.estado}</div>
          <div id="registro-error" class="mt-2 text-sm text-center text-red-600 hidden"></div>
          <input type="hidden" name="id" value="${u.id}" />
        `;

        // Contenedor para botones alineados
        let botonesDiv = document.getElementById('botonesAccion');
        if (!botonesDiv) {
          botonesDiv = document.createElement('div');
          botonesDiv.id = 'botonesAccion';
          botonesDiv.className = 'flex justify-end mt-6 space-x-4'; // separación entre botones
          form.appendChild(botonesDiv);
        }
        botonesDiv.innerHTML = ''; // limpiar

        // Botón Modificar
        const modificarBtn = document.createElement('button');
        modificarBtn.type = 'button';
        modificarBtn.id = 'modifyButton';
        modificarBtn.textContent = 'Modificar';
        modificarBtn.className = 'px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-300';

        // Botón Cerrar sesión
        const cerrarSesionBtn = document.createElement('button');
        cerrarSesionBtn.type = 'button';
        cerrarSesionBtn.id = 'botonCerrarSesion';
        cerrarSesionBtn.textContent = 'Cerrar sesión';
        cerrarSesionBtn.className = 'px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition duration-300';

        botonesDiv.appendChild(modificarBtn);
        botonesDiv.appendChild(cerrarSesionBtn);

        asignarEventos();
      } else {
        mostrarLoginModal();
      }
    })
    .catch(error => {
      console.error('Error al obtener los datos del usuario:', error);
    });
}

function asignarEventos() {
  const modifyButton = document.getElementById('modifyButton');
  if (modifyButton) {
    modifyButton.addEventListener('click', () => {
      document.getElementById('confirmModal').classList.remove('hidden');
      const errorDiv = document.getElementById('registro-error');
      if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';
      }
    });
  }

  const cancelButton = document.getElementById('cancelButton');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      document.getElementById('confirmModal').classList.add('hidden');
    });
  }

  const confirmButton = document.getElementById('confirmButton');
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      const form = document.getElementById('usuarioForm');
      const formData = new FormData(form);

      fetch('http://138.219.42.29/client/configuracion/config.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(response => {
        document.getElementById('confirmModal').classList.add('hidden');

        if (response.success) {
          const errorDiv = document.getElementById('registro-error');
          if (errorDiv) {
            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
          }
          document.getElementById('successModal').classList.remove('hidden');

          setTimeout(() => {
            cargarPerfil();
          }, 1500);
        } else {
          const errorDiv = document.getElementById('registro-error');
          if (errorDiv) {
            errorDiv.textContent = response.message;
            errorDiv.classList.remove('hidden');
          }
        }
      })
      .catch(error => {
        document.getElementById('confirmModal').classList.add('hidden');
        console.error('Error al guardar los datos:', error);
      });
    });
  }

  const closeSuccessModal = document.getElementById('closeSuccessModal');
  if (closeSuccessModal) {
    closeSuccessModal.addEventListener('click', () => {
      document.getElementById('successModal').classList.add('hidden');
    });
  }

  const btnCerrarSesion = document.getElementById('botonCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      const modalCerrarSesion = document.getElementById('cerrarSesionModal');
      if (modalCerrarSesion) {
        modalCerrarSesion.classList.remove('hidden');
      }
    });
  }
}

function mostrarLoginModal() {
  const modal = document.getElementById('modalLogin');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function redirigirLogin() {
  window.location.href = "../login/login.html";
}

function cerrarLoginModal() {
  window.location.href = "../../index.html";
}

function accionCerrarSesion() {
  fetch('http://138.219.42.29/client/login/obtener_usuario.php')
    .then(response => response.json())
    .then(data => {
      if (!data.logueado) {
        alert("No se puede cerrar sesión porque aún no se ha iniciado sesión.");
      } else {
        window.location.href = "http://138.219.42.29/client/login/cerrarsesion.php";
      }
    })
    .catch(error => {
      console.error('Error al verificar sesión:', error);
    });
}

function cerrarCerrarSesionModal() {
  const modalCerrarSesion = document.getElementById('cerrarSesionModal');
  if (modalCerrarSesion) {
    modalCerrarSesion.classList.add('hidden');
  }
}

window.onload = cargarPerfil;
