document.addEventListener("DOMContentLoaded", async () => {
  const idInput = document.getElementById("id");
  const usuarioInput = document.getElementById("usuario");
  const emailInput = document.getElementById("email");
  const cursoInput = document.getElementById("curso");
  const productosContenedor = document.getElementById("productos");
  const totalContenedor = document.getElementById("total");

  let id_usuario = null;

  try {
    const res = await fetch("./carrito/obtener_user_compra.php");
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

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
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
  const inputAbono = document.getElementById("abono");
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

  const abonoGuardado = localStorage.getItem("abono");
  if (abonoGuardado) {
    inputAbono.value = abonoGuardado;
    const abono = parseFloat(abonoGuardado);
    if (!isNaN(abono) && abono >= total) {
      btnComprar.classList.remove("hidden");
    }
  }

  inputAbono.addEventListener("input", () => {
    const abono = parseFloat(inputAbono.value);
    localStorage.setItem("abono", inputAbono.value);
    if (!isNaN(abono) && abono >= total) {
      btnComprar.classList.remove("hidden");
    } else {
      btnComprar.classList.add("hidden");
    }
  });

  const modalConfirmacion = document.getElementById("modalConfirmacion");
  const modalConfirmacionCompra = document.getElementById("modalConfirmacionCompra");
  const modalProcesando = document.getElementById("modalProcesando");
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

      modalConfirmacion.classList.add("hidden");
      modalProcesando.classList.remove("hidden");

      const pago_en = "efectivo";
      const estado_pedido = "esperando";
      const mensaje = localStorage.getItem("mensajePedidoPersonalizado") || '';
      const abono = parseFloat(localStorage.getItem("abono"));
      const vuelto = abono - total;
      localStorage.setItem(`vuelto_${id_usuario}`, vuelto.toFixed(2));

      try {
        const response = await fetch("./pagos/insertar_venta.php", {
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
          modalProcesando.classList.add("hidden");
          modalConfirmacionCompra.classList.remove("hidden");

          localStorage.removeItem("carrito");
          localStorage.removeItem("mensajePedidoPersonalizado");
          localStorage.removeItem("abono");
        } else {
          modalProcesando.classList.add("hidden");
          alert("Hubo un error al realizar la compra: " + (data.error || "Error desconocido."));
          console.error(data);
        }
      } catch (error) {
        modalProcesando.classList.add("hidden");
        alert("Error de red al procesar la compra.");
        console.error(error);
      }
    });
  }

  if (btnCerrarConfirmacion) {
    btnCerrarConfirmacion.addEventListener("click", () => {
      modalConfirmacionCompra.classList.add("hidden");
      window.location.href = "./../verPedidos/verPedidos.html";
    });
  }
});
