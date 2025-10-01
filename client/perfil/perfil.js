// Función para cargar los datos del usuario
fetch('./perfil/perfil.php')
  .then(response => response.json())
  .then(data => {
    const usuarioDatos = document.getElementById('usuarioDatos');

    if (data.logueado) {
      const usuario = data.usuario;
      
      usuarioDatos.innerHTML = `
        <div class="flex flex-col space-y-2">
          <div><strong>ID:</strong> ${usuario.id}</div>
          <div><strong>Nombre:</strong> ${usuario.usuario}</div>
          <div><strong>Email:</strong> ${usuario.email}</div>
          <div><strong>Curso:</strong> ${usuario.curso ? usuario.curso : "Curso no ingresado" }</div>
          <div><strong>Teléfono:</strong> ${usuario.telefono}</div>
          <div><strong>Estado:</strong> ${usuario.estado}</div>
        </div>
      `;
    } else {
      // Si no está logueado, mostrar un mensaje
      usuarioDatos.innerHTML = `
        <div class="text-red-500">No estás logueado. Inicia sesión para ver tu perfil.</div>
      `;
    }
  })
  .catch(error => {
    console.error('Error al obtener los datos del usuario:', error);
  });
