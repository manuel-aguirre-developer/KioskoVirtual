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
        location.href = 'panel/panel.html';
      }
    })
    .catch(() => {
      location.href = '../index.html';
    });
});
