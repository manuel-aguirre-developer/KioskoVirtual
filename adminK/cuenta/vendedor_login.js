const BASE_URL = "http://localhost/kiosko";
const WS_URL = "ws://localhost:3006/kiosko";

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
