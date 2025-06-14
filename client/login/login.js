const loginError = sessionStorage.getItem('login_error');
if (loginError) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = loginError;
  errorDiv.classList.remove('hidden');
  sessionStorage.removeItem('login_error');
}

// Función para mostrar formulario de registro
function mostrarRegistro() {
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
}

// Función para mostrar formulario de login
function mostrarLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

// Notificación de sesión cerrada (URL ?cerrado=1)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("cerrado") === "1") {
  const noti = document.getElementById("notificacion");
  noti.classList.remove("hidden");
  setTimeout(() => noti.classList.add("hidden"), 4000);
}

function cerrarNotificacion() {
  document.getElementById("notificacion").classList.add("hidden");
}
window.addEventListener('DOMContentLoaded', () => {
    const error = sessionStorage.getItem('registro_error');
    if (error) {
        const div = document.getElementById('registro-error');
        div.textContent = error.replace(/\\n/g, '\n');
        div.classList.remove('hidden');
        mostrarRegistro(); // Mostrar el formulario de registro directamente
        sessionStorage.removeItem('registro_error');
    }
});