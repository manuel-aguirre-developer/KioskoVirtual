const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2');
const crypto = require('crypto');
const { DateTime } = require('luxon');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/payment.routes');

const app = express();
const port =  3006;
const BASE_URL = process.env.BASE_URL;
const WS_URL = process.env.WS_URL;


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
// Solo exponer carpetas públicas
app.use('/adminK', express.static(path.join(__dirname, '..', 'admin')));
app.use('/client', express.static(path.join(__dirname, '..', 'cliente')));

// Rutas
app.use('/api/payments', paymentRoutes);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});
const paymentController = require('./controllers/payment.controller');
// Servidor HTTP + WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
paymentController.initSockets(wss);

// Conexión MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kiosko'
});

// Función de hash
function calcularHash(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');

  let lastUsuariosHash = '';
  let lastProductosHash = '';
  let lastPedidosHash = '';

  // Intervalo para usuarios
  const usuariosInterval = setInterval(() => {
    db.query("SELECT id, usuario, email, estado FROM usuarios ORDER BY id DESC", (err, usuarios) => {
      if (err) return console.error('Error usuarios:', err);
      const hash = calcularHash(usuarios);
      if (hash !== lastUsuariosHash) {
        lastUsuariosHash = hash;
        ws.send(JSON.stringify({ tipo: 'usuarios', usuarios }));
      }
    });
  }, 3000);

  // Intervalo para productos activos
  const productosInterval = setInterval(() => {
    db.query("SELECT id, nombre, tipo, precio, imagen, estado FROM productos WHERE estado = 'activo'", (err, productos) => {
      if (err) return console.error('Error productos:', err);
      const hash = calcularHash(productos);
      if (hash !== lastProductosHash) {
        lastProductosHash = hash;
        ws.send(JSON.stringify({ tipo: 'productos', productos }));
      }
    });
  }, 1000);

  // Intervalo para todos los pedidos (vista general)
  const pedidosInterval = setInterval(() => {
    db.query(
      `SELECT v.id, v.id_usuario, u.usuario AS nombre_usuario, v.estado_pedido, v.fecha_venta, v.total, v.mensaje, v.pago_en, v.codigo_retiro
       FROM ventas v LEFT JOIN usuarios u ON v.id_usuario = u.id ORDER BY v.fecha_venta DESC`,
      (err, results) => {
        if (err) return console.error('Error pedidos:', err);

        const pedidosFormateados = results.map(p => {
          p.fecha_venta = p.fecha_venta
            ? DateTime.fromJSDate(p.fecha_venta, { zone: 'utc' }).setZone('America/Argentina/Buenos_Aires').toFormat('yyyy-MM-dd HH:mm:ss')
            : null;
          return p;
        });

        const hash = calcularHash(pedidosFormateados);
        if (hash !== lastPedidosHash) {
          lastPedidosHash = hash;
          ws.send(JSON.stringify({ tipo: 'pedidos', pedidos: pedidosFormateados }));
        }
      }
    );
  }, 5000);

  // Manejo de mensajes
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.tipo === 'obtener_pedidos_usuario' && data.id_usuario) {
        const idUsuario = parseInt(data.id_usuario);
        if (isNaN(idUsuario)) return;

        db.query(
          `SELECT v.id, v.id_usuario, u.usuario AS nombre_usuario, v.estado_pedido, v.fecha_venta, v.total, v.mensaje, v.pago_en
   FROM ventas v 
   LEFT JOIN usuarios u ON v.id_usuario = u.id
   WHERE v.id_usuario = ? 
   ORDER BY v.fecha_venta DESC`,
          [idUsuario],
          (err, pedidos) => {
            if (err) {
              ws.send(JSON.stringify({ tipo: 'error', mensaje: 'Error al obtener pedidos del usuario' }));
              return;
            }

            const formateados = pedidos.map(p => {
              p.fecha_venta = p.fecha_venta
                ? DateTime.fromJSDate(p.fecha_venta, { zone: 'utc' }).setZone('America/Argentina/Buenos_Aires').toFormat('yyyy-MM-dd HH:mm:ss')
                : null;
              return p;
            });

            ws.send(JSON.stringify({ tipo: 'pedidos_usuario', pedidos: formateados }));
          }
        );
      }

      if (data.tipo === 'obtener_venta' && data.id_venta) {
        const idVenta = parseInt(data.id_venta);
        if (isNaN(idVenta)) return;

        db.query(
          `SELECT dp.cantidad, dp.subtotal, p.nombre AS nombre_producto, v.pago_en, v.mensaje
           FROM detalle_venta dp
           JOIN productos p ON dp.id_producto = p.id
           JOIN ventas v ON dp.id_venta = v.id
           WHERE dp.id_venta = ?`,
          [idVenta],
          (err, detalles) => {
            if (err) {
              ws.send(JSON.stringify({ tipo: 'error', mensaje: 'Error al obtener detalles de la venta' }));
              return;
            }

            ws.send(JSON.stringify({ tipo: 'venta_detallada', venta: { productos: detalles } }));
          }
        );
      }

    } catch (err) {
      console.error('Error al procesar mensaje WebSocket:', err);
    }
  });

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    clearInterval(usuariosInterval);
    clearInterval(productosInterval);
    clearInterval(pedidosInterval);
  });
});
 
// Iniciar servidor
server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
