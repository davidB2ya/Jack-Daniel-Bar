// server.js - Servidor Node.js para pedidos en tiempo real
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Almacenamiento en memoria (en producción usa una base de datos)
let orders = [];
let orderIdCounter = 1;

// Rutas API
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const { name, cocktail, notes } = req.body;
    
    if (!name || !cocktail) {
        return res.status(400).json({ error: 'Nombre y bebida son requeridos' });
    }

    const order = {
        id: orderIdCounter++,
        name: name.trim(),
        cocktail: cocktail.trim(),
        notes: notes ? notes.trim() : '',
        status: 'pendiente',
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
    };

    orders.push(order);
    
    // Emitir nuevo pedido a todos los clientes conectados
    io.emit('new-order', order);
    
    res.status(201).json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const validStatuses = ['pendiente', 'preparando', 'listo', 'entregado'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    // Emitir actualización de estado
    io.emit('order-status-updated', {
        id: orderId,
        status: status,
        order: orders[orderIndex]
    });
    
    res.json(orders[orderIndex]);
});

app.delete('/api/orders/:id', (req, res) => {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const deletedOrder = orders.splice(orderIndex, 1)[0];
    
    // Emitir eliminación de pedido
    io.emit('order-deleted', { id: orderId });
    
    res.json(deletedOrder);
});

app.delete('/api/orders', (req, res) => {
    orders = [];
    orderIdCounter = 1;
    
    // Emitir limpieza de todos los pedidos
    io.emit('orders-cleared');
    
    res.json({ message: 'Todos los pedidos eliminados' });
});

// Estadísticas
app.get('/api/stats', (req, res) => {
    const stats = {
        total: orders.length,
        pendiente: orders.filter(o => o.status === 'pendiente').length,
        preparando: orders.filter(o => o.status === 'preparando').length,
        listo: orders.filter(o => o.status === 'listo').length,
        entregado: orders.filter(o => o.status === 'entregado').length
    };
    res.json(stats);
});

// Exportar pedidos
app.get('/api/export', (req, res) => {
    const csvHeader = 'ID,Nombre,Bebida,Notas,Estado,Fecha Creación,Última Actualización\n';
    const csvData = orders.map(order => 
        `${order.id},"${order.name}","${order.cocktail}","${order.notes || ''}","${order.status}","${order.createdAt}","${order.updatedAt || order.createdAt}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pedidos.csv"');
    res.send(csvHeader + csvData);
});

// Socket.io para tiempo real
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    // Enviar pedidos existentes al nuevo cliente
    socket.emit('orders-loaded', orders);
    
    // Manejar solicitud de admin (opcional)
    socket.on('request-admin', (password) => {
        if (password === 'admin123') {
            socket.emit('admin-authenticated', true);
        } else {
            socket.emit('admin-authenticated', false);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index-realtime.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📱 Abre http://localhost:${PORT} en tu navegador`);
});

module.exports = app;