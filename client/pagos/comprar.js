document.addEventListener("DOMContentLoaded", async () => {
  const idInput = document.getElementById("id");
  const usuarioInput = document.getElementById("usuario");
  const emailInput = document.getElementById("email");
  const cursoInput = document.getElementById("curso");
  const productosContenedor = document.getElementById("productos");
  const totalContenedor = document.getElementById("total");

  let id_usuario = null;

  // Obtener datos del usuario
  try {
    const res = await fetch("http://localhost/kioskoTecnica4/client/carrito/obtener_user_compra.php");
    const data = await res.json();

    if (data.logueado) {
      id_usuario = data.id_usuario;
      idInput.value = data.id_usuario;
      usuarioInput.value = data.usuario;
      emailInput.value = data.email;
      cursoInput.value = data.curso ? data.curso : "Curso no ingresado";
    } else {
      alert("No estás logueado.");
    }
  } catch (error) {
    alert("Error de red al obtener datos del usuario.");
    console.error(error);
  }

  // Obtener productos del localStorage
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Agrupar productos por ID
  const productosAgrupados = carrito.reduce((acc, producto) => {
    const existente = acc.find(p => p.id === producto.id);
    if (existente) {
      existente.cantidad += producto.cantidad;
    } else {
      acc.push({ ...producto });
    }
    return acc;
  }, []);

  let total = 0;
  const inputAbono = document.getElementById("abono"); // ahora es abono
  const btnComprar = document.getElementById("btnComprar");

  if (productosAgrupados.length === 0) {
    productosContenedor.innerHTML = "<p>No hay productos en el carrito.</p>";
    totalContenedor.textContent = "$0.00";
    return;
  }

  productosContenedor.innerHTML = "";
  productosAgrupados.forEach(p => {
    const item = document.createElement("div");
    item.className = "mb-2";
    item.innerHTML = `<p><strong>${p.nombre}</strong> - $${p.precio} x ${p.cantidad}</p>`;
    productosContenedor.appendChild(item);
    total += p.precio * p.cantidad;
  });

  totalContenedor.textContent = `$${total.toFixed(2)}`;

  // Cargar abono guardado (antes era montoIngresado)
  const abonoGuardado = localStorage.getItem("abono");
if (abonoGuardado) {
  inputAbono.value = abonoGuardado;
  const abono = parseFloat(abonoGuardado);
  console.log("Abono guardado:", abonoGuardado);
  console.log("Abono guardado parseado:", abono);
  if (!isNaN(abono) && abono >= total) {
    btnComprar.classList.remove("hidden");
    console.log("Botón mostrado al cargar");
  }
}


inputAbono.addEventListener("input", () => {
  const abono = parseFloat(inputAbono.value);
  console.log("Input abono:", inputAbono.value);
  console.log("Abono parseado:", abono);
  console.log("Total:", total);

  localStorage.setItem("abono", inputAbono.value);

  if (!isNaN(abono) && abono >= total) {
    btnComprar.classList.remove("hidden");
    console.log("Botón mostrar");
  } else {
    btnComprar.classList.add("hidden");
    console.log("Botón ocultar");
  }
});


  // Modales
  const modalConfirmacion = document.getElementById("modalConfirmacion");
  const modalConfirmacionCompra = document.getElementById("modalConfirmacionCompra");
  const btnConfirmarCompra = document.getElementById("btnConfirmarCompra");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnCerrarConfirmacion = document.getElementById("btnCerrarConfirmacion");

  if (btnComprar && modalConfirmacion) {
    btnComprar.addEventListener("click", () => {
      modalConfirmacion.classList.remove("hidden");
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      modalConfirmacion.classList.add("hidden");
    });
  }

  if (btnConfirmarCompra) {
    btnConfirmarCompra.addEventListener("click", async () => {
      if (productosAgrupados.length === 0) {
        alert("El carrito está vacío.");
        modalConfirmacion.classList.add("hidden");
        return;
      }

      const pago_en = "efectivo";
      const estado_pedido = "esperando";
      const mensaje = localStorage.getItem("mensajePedidoPersonalizado") || '';
      const abono = parseFloat(localStorage.getItem("abono"));
      const vuelto = abono - total;
      localStorage.setItem(`vuelto_${id_usuario}`, vuelto.toFixed(2)); // opcional

      try {
        const response = await fetch("http://localhost/kioskoTecnica4/client/pagos/insertar_venta.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario,
            productos: productosAgrupados,
            mensaje,
            estado_pedido,
            pago_en,
            abono: abono.toFixed(2)
          })
        });

        const data = await response.json();

        if (data.success) {
          modalConfirmacion.classList.add("hidden");
          modalConfirmacionCompra.classList.remove("hidden");

          localStorage.removeItem("carrito");
          localStorage.removeItem("mensajePedidoPersonalizado");
          localStorage.removeItem("abono");
        } else {
          alert("Hubo un error al realizar la compra: " + (data.error || "Error desconocido."));
          console.error(data);
          modalConfirmacion.classList.add("hidden");
        }
      } catch (error) {
        alert("Error de red al procesar la compra.");
        console.error(error);
        modalConfirmacion.classList.add("hidden");
      }
    });
  }

  if (btnCerrarConfirmacion) {
    btnCerrarConfirmacion.addEventListener("click", () => {
      modalConfirmacionCompra.classList.add("hidden");
      window.location.href = "../../index.html";
    });
  }
});
