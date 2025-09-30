const BASE_URL = process.env.BASE_URL;
const WS_URL = process.env.WS_URL;

const mercadopago = require('mercadopago');
require('dotenv').config();
const { db } = require('../config');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const usuariosConectados = new Map();

exports.initSockets = (wss) => {
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.tipo === 'registrar_usuario' && data.id_usuario) {
          if (!usuariosConectados.has(data.id_usuario)) {
            usuariosConectados.set(data.id_usuario, new Set());
          }
          usuariosConectados.get(data.id_usuario).add(ws);
          ws._id_usuario = data.id_usuario;
        }
      } catch (err) {
        console.error('Error al procesar mensaje WebSocket:', err);
      }
    });

    ws.on('close', () => {
      const id_usuario = ws._id_usuario;
      if (id_usuario && usuariosConectados.has(id_usuario)) {
        usuariosConectados.get(id_usuario).delete(ws);
        if (usuariosConectados.get(id_usuario).size === 0) {
          usuariosConectados.delete(id_usuario);
        }
      }
    });
  });
};

const notificarUsuario = (id_usuario, mensaje) => {
  const sockets = usuariosConectados.get(id_usuario);
  if (sockets) {
    sockets.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(mensaje));
      }
    });
  }
};

// ================= FUNCIONES AUXILIARES ===================

const insertarPagoPendiente = (usuario, pago, productos, fecha) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO pagos_pendientes (id_usuario, fecha_venta, total, estado_pedido, pago_en, mensaje, id_pago_mp) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [usuario, fecha, pago.transaction_amount, 'pendiente', pago.metadata.pago_en, pago.metadata.mensaje, pago.id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
};

const insertarDetallesPendientes = (id_pago_pendiente, productos) => {
  return Promise.all(productos.map(prod => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO detalles_pendientes (id_venta, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)",
        [id_pago_pendiente, prod.id_pro, prod.quantity, prod.unit_price * prod.quantity],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }));
};
  
const moverPendienteAVenta = async (id_pago_mp) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM pagos_pendientes WHERE id_pago_mp = ?", [id_pago_mp], async (err, pagos) => {
      if (err || pagos.length === 0) return reject(err || 'No se encontró el pago pendiente');

      const venta = pagos[0];
      db.query(
        "INSERT INTO ventas (id_usuario, fecha_venta, total, estado_pedido, pago_en, mensaje) VALUES (?, ?, ?, ?, ?, ?)",
        [venta.id_usuario, venta.fecha_venta, venta.total, 'esperando', venta.pago_en, venta.mensaje],
        (err, result) => {
          if (err) return reject(err);
          const nuevaVentaId = result.insertId;

          db.query("SELECT * FROM detalles_pendientes WHERE id_venta = ?", [venta.id], (err, detalles) => {
            if (err) return reject(err);

            const insertPromises = detalles.map(det => {
              return new Promise((resolve2, reject2) => {
                db.query(
                  "INSERT INTO detalles_venta (id_venta, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)",
                  [nuevaVentaId, det.id_producto, det.cantidad, det.subtotal],
                  (err) => {
                    if (err) return reject2(err);
                    resolve2();
                  }
                );
              });
            });

            Promise.all(insertPromises)
              .then(() => {
                db.query("DELETE FROM pagos_pendientes WHERE id = ?", [venta.id]);
                db.query("DELETE FROM detalles_pendientes WHERE id_venta = ?", [venta.id]);
                resolve(nuevaVentaId);
              })
              .catch(reject);
          });
        }
      );
    });
  });
};

// =================== CREAR PREFERENCIA ======================

exports.createPreference = async (req, res) => {
  const { items, usuario, pago_en, mensaje } = req.body;
  const id_usuario = usuario?.id;

  if (!id_usuario) {
    return res.status(400).json({ error: 'Falta id_usuario en la solicitud' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan productos en la preferencia' });
  }

  const productosParaMetadata = items.map(p => ({
    id_pro: p.id,
    quantity: p.quantity,
    unit_price: p.unit_price
  }));

  const preference = {
    items: items.map(p => ({
      title: p.title,
      quantity: p.quantity,
      unit_price: p.unit_price
    })),
    notification_url: "${BASE_URL}/api/payments/webhook",
    back_urls: {
      success: "${BASE_URL}/mp/gracias.html",
      failure: "${BASE_URL}/mp/fallo.html",
      pending: "${BASE_URL}/mp/pendiente.html"
    },
    auto_return: "approved",
    metadata: {
      id_usuario,
      productos: JSON.stringify(productosParaMetadata),
      pago_en,
      mensaje
    },
    payment_methods: {
      excluded_payment_types: [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "ticket" },
        { id: "atm" }
      ],
      default_payment_type_id: "bank_transfer"
    }
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ payment_url: response.body.init_point });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error al crear preferencia' });
  }
};

// =================== WEBHOOK ======================

exports.webhook = async (req, res) => {
  console.log('📡 Webhook recibido:', JSON.stringify(req.body, null, 2));

  try {
    const body = req.body;
    let paymentId = null;
    let topic = body.type || null;
    const action = body.action || null;

    if ((action === 'payment.created' || action === 'payment.updated') && body.data?.id) {
      paymentId = body.data.id;
      topic = 'payment';
    }

    if (topic === 'payment' && paymentId) {
      let payment;
      try {
        payment = await mercadopago.payment.findById(paymentId);
      } catch (err) {
        console.warn(`❗ Error al consultar pago ${paymentId}:`, err.message);
        return res.sendStatus(200);
      }

      const estado = payment.body.status;
      const meta = payment.body.metadata;
      const id_usuario = meta.id_usuario;
      const productos = JSON.parse(meta.productos || "[]");
      const fecha = new Date();

      if (estado === 'approved') {
        console.log('✅ Pago aprobado. Moviendo desde pendientes...');
        try {
          const id_venta = await moverPendienteAVenta(paymentId);
          localStorage.removeItem("carrito");
          localStorage.removeItem("mensajePedidoPersonalizado");
          notificarUsuario(id_usuario, {
            tipo: 'pago_aprobado',
            estado: estado,
            id_venta,
            mensaje: 'Tu pago fue aprobado.'
          });
        } catch (err) {
          console.error('❌ Error al mover de pendiente a venta:', err);
          return res.sendStatus(500);
        }

      } else if (estado === 'pending') {
        console.log('⌛ Pago pendiente. Guardando...');
        try {
          const id_pendiente = await insertarPagoPendiente(id_usuario, payment.body, productos, fecha);
          await insertarDetallesPendientes(id_pendiente, productos);

          notificarUsuario(id_usuario, {
            tipo: 'pago_pendiente',
            estado: estado,
            mensaje: 'Tu pago está pendiente.'
          });
        } catch (err) {
          console.error('❌ Error guardando pago pendiente:', err);
          return res.sendStatus(500);
        }

      } else if (estado === 'rejected') {
        console.log('❌ Pago rechazado.');
        notificarUsuario(id_usuario, {
          tipo: 'pago_rechazado',
          estado: estado,
          mensaje: 'Tu pago fue rechazado.'
        });
      }

      return res.sendStatus(200);
    } else {
      console.warn('⚠️ Evento no manejado:', body);
      return res.sendStatus(400);
    }

  } catch (error) {
    console.error('💥 Error en webhook:', error);
    return res.sendStatus(500);
  }
};
