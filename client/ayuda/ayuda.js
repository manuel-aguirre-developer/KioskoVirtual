function abrirModal(tipo) {
  const modal = document.getElementById('modalInfo');
  const titulo = document.getElementById('modalTitulo');
  const contenido = document.getElementById('modalContenido');

  if (tipo === 'privacidad') {
    titulo.textContent = 'Política de Privacidad';
    contenido.innerHTML = `
      <p><em>Última actualización: 24 de mayo de 2025</em></p>

<p>La privacidad de nuestros usuarios es importante. A continuación, te explicamos cómo recopilamos, usamos y protegemos tu información personal.</p>

<p><strong>1. Información que recopilamos</strong><br>
Podemos recopilar la siguiente información:<br>
- Nombre y apellido.<br>
- Dirección de correo electrónico.<br>
- Teléfono.<br>
- Datos de sesión o navegación (cookies, dirección IP, tipo de dispositivo).<br>
- Datos de actividad dentro de la aplicación, como registros de ventas o pagos realizados.<br>
- Información financiera relacionada con los ingresos generados a través del uso de la plataforma, con el fin de evaluar el desempeño comercial del producto o servicio ofrecido.<br>
</p>


<p><strong>2. Cómo usamos la información</strong><br>
Usamos la información para:<br>
- Procesar compras y pedidos.<br>
- Contactarte en relación con tus pedidos o tu cuenta.<br>
- Mejorar el sitio web y la experiencia del usuario.<br>
- Registrar y analizar transacciones y pagos realizados para evaluar el rendimiento comercial y las ganancias generadas.</p>


<p><strong>3. Protección de datos</strong><br>
Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales. Aunque hacemos nuestro mejor esfuerzo, ningún sistema es 100% seguro.</p>

<p><strong>4. Compartir información</strong><br>
<strong>No vendemos, alquilamos ni compartimos tu información personal</strong> con terceros, excepto en los siguientes casos:<br>
- Servicios de pago y envío (proveedores externos con los que trabajamos)<br>
- Cuando sea requerido por ley o autoridad judicial.</p>

<p><strong>5. Cookies</strong><br>
Este sitio utiliza cookies para mejorar la experiencia del usuario. Puedes configurar tu navegador para bloquearlas, pero algunas funciones pueden verse afectadas.</p>

<p><strong>6. Tus derechos</strong><br>
Tienes derecho a:<br>
- Acceder a tus datos personales.<br>
- Corregir información incorrecta.<br>
- Solicitar la eliminación de tu cuenta y datos.<br>
Para ejercer estos derechos, escríbenos a: <strong>aapc.arg@gmail.com</strong></p>

<p><strong>7. Cambios en la política</strong><br>
Nos reservamos el derecho a modificar esta política de privacidad. Los cambios serán efectivos al ser publicados en esta página.</p>
    `;
  } else if (tipo === 'terminos') {
    titulo.textContent = 'Términos y Condiciones';
    contenido.innerHTML = `
      <p><em>Última actualización: 24 de mayo de 2025</em></p>

<p>Bienvenido/a a <strong>A.A.P.C</strong>. Al acceder o usar este sitio web, aceptas cumplir con los siguientes Términos y Condiciones. Si no estás de acuerdo con ellos, por favor, no utilices el sitio.</p>

<p><strong>1. Aceptación de los términos</strong><br>
Al utilizar nuestros servicios, aceptas estos términos en su totalidad. Si usas el sitio en representación de una empresa u otra entidad, aseguras que tienes la autoridad legal para obligarla a estos términos.</p>

<p><strong>2. Uso del sitio</strong><br>
Puedes usar el sitio solo para fines legales y conforme a nuestras políticas. No puedes:<br>
- Utilizar bots, scrapers u otras herramientas automáticas para acceder al sitio.<br>
- Interferir con el funcionamiento del sitio o sus funciones.<br>
- Utilizar información falsa o suplantar identidades al registrarte o realizar compras.</p>

<p><strong>3. Registro de usuario</strong><br>
Al registrarte, te comprometes a proporcionar información veraz, completa y actualizada. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>

<p><strong>4. Compras</strong><br>
Al realizar una compra en el sitio:<br>
- Aceptas proporcionar información válida para el pago.<br>
- Aceptas que los precios y disponibilidad pueden cambiar sin previo aviso.<br>
- Nos reservamos el derecho de rechazar o cancelar pedidos si se detectan errores, fraude, o cualquier violación a estos términos.</p>

<p><strong>5. Propiedad intelectual</strong><br>
Todo el contenido de este sitio (texto, imágenes, logos, diseño, etc.) es propiedad de <strong>A.A.P.C</strong>, y está protegido por derechos de autor y otras leyes. No está permitido copiar, reproducir o distribuir el contenido sin autorización previa por escrito.</p>

<p><strong>6. Derechos de autor © 2025 A.A.P.C</strong><br>
Todos los derechos reservados. Ninguna parte de este sitio web, incluyendo pero no limitándose a textos, gráficos, logotipos, iconos de botones, imágenes, clips de audio, descargas digitales y compilaciones de datos, puede ser reproducida, copiada, transmitida, distribuida, descargada o publicada de ninguna manera sin el permiso previo por escrito de A.A.P.C.<br>
El uso no autorizado puede violar las leyes de copyright, marcas registradas y otras regulaciones aplicables. Para consultas sobre permisos, por favor contáctanos en: <a href="mailto:aapc.arg@gmail.com">aapc.arg@gmail.com</a>.</p>

<p><strong>7. Modificaciones</strong><br>
Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones se harán efectivas una vez publicadas en esta misma página. Es tu responsabilidad revisarlas periódicamente.</p>

<p><strong>8. Limitación de responsabilidad</strong><br>
No nos hacemos responsables por:<br>
- Daños directos, indirectos, incidentales o consecuentes por el uso del sitio.<br>
- Errores en el contenido o interrupciones del servicio.<br>
- Virus o ataques que puedan afectar tus dispositivos.</p>
    `;
  }

  modal.classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modalInfo').classList.add('hidden');
} 