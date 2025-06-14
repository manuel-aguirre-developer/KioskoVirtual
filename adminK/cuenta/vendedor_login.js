document.addEventListener('DOMContentLoaded', () => {
  fetch('../obtener_admin.php')
    .then(res => res.json())
    .then(data => {
      if (!data.logueado || data.rol !== 'admin') {
        location.href = '../../index.html';
      }
    })
    .catch(() => {
      location.href = '../../index.html';
    });
});
