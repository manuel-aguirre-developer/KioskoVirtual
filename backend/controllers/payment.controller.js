const mercadopago = require('mercadopago');
require('dotenv').config();
const { db } = require('../config');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// CREAR PREFERENCIA
exports.createPreference = async (req, res) => {
  const { items, usuario, pago_en, mensaje } = req.body;
  const id_usuario = usuario?.id;

  if (!id_usuario) {
    return res.status(400).json({ error: 'Falta id_usuario en la solicitud' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan productos en la preferencia' });
  }

  // Aseguramos que cada producto tenga id_pro para luego insertar en detalles_venta
  const productosParaMetadata = items.map(p => ({
    id_pro: p.id,         // <-- Aquí aseguramos enviar el id correcto del producto
    quantity: p.quantity,
    unit_price: p.unit_price
  }));

  const preference = {
  items: items.map(p => ({
    title: p.title,
    quantity: p.quantity,
    unit_price: p.unit_price
  })),
  notification_url: "https://591e-186-158-220-100.ngrok-free.app/api/payments/webhook",
  back_urls: {
    success: "https://591e-186-158-220-100.ngrok-free.app/index.js",
    failure: "https://591e-186-158-220-100.ngrok-free.app/failure",
    pending: "https://591e-186-158-220-100.ngrok-free.app/pending"
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

// WEBHOOK
exports.webhook = async (req, res) => {
  console.log('Webhook recibido:', JSON.stringify(req.body, null, 2));

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
        console.warn(`Pago con ID ${paymentId} no encontrado o error al consultar:`, err.message);
        return res.sendStatus(200); // Para que MP no siga reintentando
      }

      if (payment.body.status === 'approved') {
        const meta = payment.body.metadata;
        const id_usuario = meta.id_usuario;
        const pago_en = meta.pago_en;
        const mensaje = meta.mensaje;
        const productos = JSON.parse(meta.productos || "[]");
        const fecha = new Date();

        console.log('Productos para insertar detalles:', productos);
        
        // Inserción de venta
        const insertarVenta = () => {
          return new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO ventas (id_usuario, fecha_venta, total, estado_pedido, pago_en, mensaje) VALUES (?, ?, ?, ?, ?, ?)",
              [id_usuario, fecha, payment.body.transaction_amount, 'esperando', pago_en, mensaje],
              (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
              }
            );
          });
        };

        // Inserción de detalles_venta
        const insertarDetalles = (id_venta) => {
          return Promise.all(productos.map(prod => {
            console.log('Insertando detalle con:', {
              id_producto: prod.id_pro,
              cantidad: prod.quantity,
              subtotal: prod.unit_price * prod.quantity
            });

            return new Promise((resolve, reject) => {
              db.query(
                "INSERT INTO detalles_venta (id_venta, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)",
                [
                  id_venta,
                  prod.id_pro,
                  prod.quantity,
                  prod.unit_price * prod.quantity,
                ],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
          }));
        };

        try {
          const id_venta = await insertarVenta();
          await insertarDetalles(id_venta);
        } catch (err) {
          console.error('Error guardando datos en BD:', err);
          return res.sendStatus(500);
        }
      }

      return res.sendStatus(200);
    }
    else if (topic === 'merchant_order' && body.resource) {
      return res.sendStatus(200);
    } else {
      console.warn('Evento no manejado o faltan datos:', body);
      return res.sendStatus(400);
    }

  } catch (error) {
    console.error('Error en webhook:', error);
    return res.sendStatus(500);
  }
};