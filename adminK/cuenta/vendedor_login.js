const BASE_URL = process.env.BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
  fetch('../obtener_admin.php')
    .then(res => res.json())
    .then(data => {
      if (!data.logueado || data.rol !== 'admin') {
        location.href = BASE_URL + '/index.html';
      }
    })
    .catch(() => {
      location.href = BASE_URL + '/index.html';
    });
});
