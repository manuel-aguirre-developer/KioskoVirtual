document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión
  fetch('../obtener_admin.php')
    .then(res => res.json())
    .then(data => {
      if (!data.logueado || (data.rol !== 'admin' && data.rol !== 'vendedor')) {
        location.href = '../../index.html';
      }
    })
    .catch(() => location.href = '../../index.html');
  const filtroSelect = document.getElementById('filtro');
  const mychart = document.getElementById("GraficoVentas");
  let graficoVentas; // Referencia al gráfico Chart.js

  const cargarGraficoPorTipo = (periodo) => {
    fetch(`estadisticas_tipo.php?periodo=${periodo}`)
      .then(response => {
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data.datos)) throw new Error("Datos inválidos para el gráfico");

        const clases = data.datos.map(item => item.tipo);
        const dinero = data.datos.map(item => parseFloat(item.total_generado));
        const totalGlobal = dinero.reduce((acc, val) => acc + val, 0);

        const totalGeneradoEl = document.getElementById('totalGenerado');
        if (totalGeneradoEl) {
          totalGeneradoEl.innerHTML =
            `<span class="text-gray-700">Total generado: </span>
             <span class="text-green-600 font-bold">$${totalGlobal.toFixed(2)}</span>`;
        }

        if (graficoVentas) {
          graficoVentas.destroy(); // Destruir gráfico anterior
        }

        graficoVentas = new Chart(mychart, {
          type: 'pie',
          data: {
            labels: clases,
            datasets: [{
              label: 'Dinero tipo',
              data: dinero,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(199, 199, 199, 0.2)',
                'rgba(83, 102, 255, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
                'rgba(83, 102, 255, 1)'
              ],
              borderWidth: 1
            }]
          }
        });
      })
      .catch(error => console.error("Error al cargar datos para el gráfico:", error));
  };

  const cargarPagosPorPeriodo = (periodo) => {
  fetch(`estadisticas_por_pago.php?periodo=${periodo}`)
    .then(response => response.json())
    .then(data => {
      const containerHoy = document.getElementById('dineroDeHoy');
      const comparacionClick = document.getElementById('comparacionClick');
      const contenedorPago = document.getElementById('resumenPagos');
      if (!containerHoy || !comparacionClick || !contenedorPago) return;

      let efectivo = 0;
      let transferencia = 0;

      if (Array.isArray(data.pagos)) {
        data.pagos.forEach(item => {
          if (item.pago_en === 'efectivo') efectivo = parseFloat(item.total_pago);
          else if (item.pago_en === 'transferencia') transferencia = parseFloat(item.total_pago);
        });
      }

      totalGeneradoActual = data.total_generado || 0;

      const totalActual = data.total_generado || 0;
      const totalPasado = data.total_pasado || 0;

      if (totalPasado > 0) {
        const porcentaje = ((totalActual - totalPasado) / totalPasado) * 100;
        const simbolo = porcentaje >= 0 ? '▲' : '▼';
        const clase = porcentaje >= 0 ? 'text-green-600' : 'text-red-600';

        let textoComparacion = '';
        if (periodo === 'semana') textoComparacion = 'la semana pasada';
        else if (periodo === 'mes') textoComparacion = 'el mes pasado';
        else textoComparacion = '';

        comparacionClick.innerHTML = `
          <div class="mt-2">
            <span class="text-gray-700">Comparado con ${textoComparacion}: </span>
            <span id="porcentajeClick" class="${clase} font-bold cursor-pointer underline">${simbolo} ${Math.abs(porcentaje).toFixed(2)}%</span>
          </div>
        `;

        const toggleSpan = document.getElementById('porcentajeClick');
        let mostrandoPorcentaje = true;

        toggleSpan.onclick = () => {
          if (mostrandoPorcentaje) {
            toggleSpan.textContent = `$${totalPasado.toFixed(2)}`;
            toggleSpan.className = 'text-green-600 font-bold cursor-pointer'; // verde y sin underline
          } else {
            toggleSpan.textContent = `${simbolo} ${Math.abs(porcentaje).toFixed(2)}%`;
            toggleSpan.className = `${clase} font-bold cursor-pointer underline`;
          }
          mostrandoPorcentaje = !mostrandoPorcentaje;
        };

      } else {
        comparacionClick.innerHTML = `<div class="mt-2 text-gray-500 italic">Sin datos del período anterior</div>`;
      }

      containerHoy.innerHTML = `
        <span class="text-gray-700">Dinero generado hoy: </span>
        <span class="text-green-600 font-bold">$${(data.total_hoy || 0).toFixed(2)}</span>
      `;

      contenedorPago.innerHTML = `
        <div><span class="text-gray-700">Efectivo: </span><span class="text-green-600 font-bold">$${efectivo.toFixed(2)}</span></div>
        <div><span class="text-gray-700">Transferencia: </span><span class="text-green-600 font-bold">$${transferencia.toFixed(2)}</span></div>
      `;
    })
    .catch(error => console.error("Error al cargar datos de pagos:", error));
};

  const cargarTopProductos = (periodo) => {
    fetch(`tops_productos.php?periodo=${periodo}`)
      .then(response => response.json())
      .then(data => {
        const listaMas = document.getElementById('top-productos');
        const listaMenos = document.getElementById('top-productos-menos');

        if (!listaMas || !listaMenos) {
          console.warn("Listas de productos no encontradas en el DOM");
          return;
        }

        listaMas.innerHTML = '';
        if (Array.isArray(data.mas_vendidos)) {
          data.mas_vendidos.forEach((producto, index) => {
            const item = document.createElement('li');
            item.innerHTML = `
              <div class="flex justify-between items-center bg-green-100 p-3 rounded-lg shadow-sm">
                <span class="font-medium">${index + 1}. ${producto.nombre}</span>
                <span class="text-sm text-gray-600">
                  ${producto.total_vendido} vendidos 
                  ($${parseFloat(producto.total_generado).toFixed(2)})
                </span>
              </div>
            `;
            listaMas.appendChild(item);
          });
        }

        listaMenos.innerHTML = '';
        if (Array.isArray(data.menos_vendidos)) {
          data.menos_vendidos.forEach((producto, index) => {
            const item = document.createElement('li');
            item.innerHTML = `
              <div class="flex justify-between items-center bg-red-100 p-3 rounded-lg shadow-sm">
                <span class="font-medium">${index + 1}. ${producto.nombre}</span>
                <span class="text-sm text-gray-600">
                  ${producto.total_vendido} vendidos 
                  ($${parseFloat(producto.total_generado).toFixed(2)})
                </span>
              </div>
            `;
            listaMenos.appendChild(item);
          });
        }
      })
      .catch(error => console.error('Error al obtener top productos:', error));
  };

  const actualizarEstadisticas = (periodo) => {
    periodoSeleccionado = periodo; // 🔥 Actualizar global
    cargarGraficoPorTipo(periodo);
    cargarPagosPorPeriodo(periodo);
    cargarTopProductos(periodo);
  };

  filtroSelect.addEventListener('change', () => {
    const periodo = filtroSelect.value;
    actualizarEstadisticas(periodo);
  });
  actualizarEstadisticas(filtroSelect.value); // carga inicial
});
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;

  const elemento = document.body; // Podés cambiarlo a otro contenedor si querés solo parte

  html2canvas(elemento, {
    scrollY: -window.scrollY, // Captura desde arriba
    scale: 2 // Mejora calidad
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let position = 0;

    if (imgHeight < pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Si se pasa de una hoja
      let heightLeft = imgHeight;
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = -pageHeight;
        }
      }
    }

    pdf.save("rendimiento.pdf");
  });
});
