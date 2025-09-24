window.addEventListener('DOMContentLoaded', () => {
  // Primero intento obtener sesión y datos de usuario logueado
  fetch('http://138.219.42.29/client/login/obtener_usuario.php')
    .then(response => response.json())
    .then(data => {
      if (data.logueado) {
        // Si está logueado, verifico si está baneado
        fetch(`http://138.219.42.29/client/login/obtenerBaneo.php?id=${data.id_usuario}`)
          .then(response => response.json())
          .then(baneoData => {
            if (baneoData.baneado) {
              // Mostrar modal de baneo
              mostrarModalBaneo(baneoData.id);
            } else {
              // No baneado y logueado: redirigir a index o catálogo para no permitir login/registro
              window.location.href = '../../index.html';
            }
          })
          .catch(() => {
            // Si falla la verificación de baneo, por seguridad también redirijo
            window.location.href = '../../index.html';
          });
      } else {
        // No está logueado: mostrar formularios y errores normalmente
        procesarErroresYNotificaciones();
      }
    })
    .catch(() => {
      // Si falla la verificación de usuario, muestro formularios y errores igual
      procesarErroresYNotificaciones();
    });
});

function mostrarModalBaneo(idUsuario) {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div style="
        background: white; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center;">
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">🚫 Usuario Baneado</h2>
        <p>Tu ID de usuario es: <strong>${idUsuario}</strong></p>
        <p style="margin-top: 1rem;">Deberás comunicarte con el kiosko para resolver esta situación.</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden'; // bloqueo scroll/interacciones
}

function procesarErroresYNotificaciones() {
  const loginError = sessionStorage.getItem('login_error');
  if (loginError) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = loginError;
    errorDiv.classList.remove('hidden');
    sessionStorage.removeItem('login_error');
  }

  const errorRegistro = sessionStorage.getItem('registro_error');
  if (errorRegistro) {
    const div = document.getElementById('registro-error');
    div.textContent = errorRegistro.replace(/\\n/g, '\n');
    div.classList.remove('hidden');
    mostrarRegistro();
    sessionStorage.removeItem('registro_error');
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("cerrado") === "1") {
    const noti = document.getElementById("notificacion");
    noti.classList.remove("hidden");
    setTimeout(() => noti.classList.add("hidden"), 4000);
  }
}

function mostrarRegistro() {
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
}

function mostrarLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

function cerrarNotificacion() {
  document.getElementById("notificacion").classList.add("hidden");
}
