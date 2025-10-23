const BASE_URL = "http://localhost/kiosko";
const WS_URL = "ws://localhost:3006/kiosko";
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar error
  const errorDiv = document.getElementById('error-message');
  const errorMessage = sessionStorage.getItem('admin_login_error');

  if (errorMessage) {
    errorDiv.textContent = errorMessage;
    errorDiv.classList.remove('hidden');
    sessionStorage.removeItem('admin_login_error');
  }

  // Verificar login para redirigir
  fetch('obtener_admin.php')
    .then(res => res.json())
    .then(data => {
      if (data.logueado && (data.rol == 'admin' || data.rol == 'vendedor')) {
        location.href = BASE_URL + 'adminK/panel/panel.html';
      }
    })
    .catch(() => {
      location.href = BASE_URL + "/index.html";
    });
});
