// scripts-realtime.js - Cliente para tiempo real con Node.js + Socket.io
(function () {
    // Conectar al servidor Socket.io
    const socket = io(); // Se conecta automáticamente al servidor actual
    let isAdminAuthenticated = false;

    function qs(sel, ctx = document) { return ctx.querySelector(sel); }
    function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

    // Obtener nombres de bebidas desde el DOM
    function getDrinksFromDOM() {
        const names = new Set();
        const sections = qsa('main.cocteles > section');
        for (const s of sections) {
            const nameEl = s.querySelector('p');
            if (nameEl?.textContent?.trim()) {
                names.add(nameEl.textContent.trim());
            }
        }
        const coronaPs = qsa('footer .coronas p');
        for (const p of coronaPs) {
            if (p.textContent?.trim()) {
                names.add(p.textContent.trim());
            }
        }
        const footerLis = qsa('footer ul li');
        for (const li of footerLis) {
            if (li.textContent?.trim()) {
                names.add(li.textContent.trim());
            }
        }
        return Array.from(names);
    }

    function populateSelect() {
        const select = qs('#cocktail-select');
        const currentOptions = select.querySelectorAll('option:not([value=""])');
        for (const option of currentOptions) {
            option.remove();
        }
        
        const drinks = getDrinksFromDOM();
        for (const drink of drinks) {
            const opt = document.createElement('option');
            opt.value = drink;
            opt.textContent = drink;
            select.appendChild(opt);
        }
    }

    // Funciones API
    async function addOrder(name, cocktail, notes = '') {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, cocktail, notes })
            });
            
            if (!response.ok) {
                throw new Error('Error enviando pedido');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) {
                throw new Error('Error actualizando estado');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function deleteOrder(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Error eliminando pedido');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function clearAllOrders() {
        try {
            const response = await fetch('/api/orders', {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Error limpiando pedidos');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function escapeHtml(s) {
        return String(s).replaceAll(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
    }

    function renderOrder(order) {
        const div = document.createElement('div');
        div.className = `order-item status-${order.status}`;
        div.dataset.orderId = order.id;
        
        const statusColor = {
            'pendiente': '#ff9800',
            'preparando': '#2196f3',
            'listo': '#4caf50',
            'entregado': '#9e9e9e'
        };

        const notesHtml = order.notes ? `<div class="order-notes">📝 ${escapeHtml(order.notes)}</div>` : '';

        div.innerHTML = `
            <div class="order-header">
                <strong>${escapeHtml(order.cocktail)}</strong>
                <span class="order-status" style="background: ${statusColor[order.status]}">
                    ${order.status}
                </span>
            </div>
            <small>Pedido por: ${escapeHtml(order.name)} — ${new Date(order.timestamp).toLocaleString()}</small>
            ${notesHtml}
            <div class="order-actions">
                <select class="status-select" data-order-id="${order.id}">
                    <option value="pendiente" ${order.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="preparando" ${order.status === 'preparando' ? 'selected' : ''}>Preparando</option>
                    <option value="listo" ${order.status === 'listo' ? 'selected' : ''}>Listo</option>
                    <option value="entregado" ${order.status === 'entregado' ? 'selected' : ''}>Entregado</option>
                </select>
                <button class="delete-btn" data-order-id="${order.id}">Eliminar</button>
            </div>
        `;

        // Event listeners
        const statusSelect = div.querySelector('.status-select');
        statusSelect.addEventListener('change', (e) => {
            updateOrderStatus(order.id, e.target.value);
        });

        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('¿Eliminar este pedido?')) {
                deleteOrder(order.id);
            }
        });

        return div;
    }

    function renderOrders(orders) {
        const container = qs('#orders-list');
        container.innerHTML = '';
        
        if (!orders.length) {
            container.innerHTML = '<p>No hay pedidos</p>';
            updateStats(orders);
            return;
        }

        // Ordenar por timestamp (más recientes primero)
        const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);
        
        for (const order of sortedOrders) {
            container.appendChild(renderOrder(order));
        }

        updateStats(orders);
    }

    function updateStats(orders) {
        const stats = {
            total: orders.length,
            pendiente: orders.filter(o => o.status === 'pendiente').length,
            preparando: orders.filter(o => o.status === 'preparando').length,
            listo: orders.filter(o => o.status === 'listo').length,
            entregado: orders.filter(o => o.status === 'entregado').length
        };

        const totalEl = qs('#total-orders');
        const pendingEl = qs('#pending-orders');
        const readyEl = qs('#ready-orders');

        if (totalEl) totalEl.textContent = `Total: ${stats.total}`;
        if (pendingEl) pendingEl.textContent = `Pendientes: ${stats.pendiente}`;
        if (readyEl) readyEl.textContent = `Listos: ${stats.listo}`;
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Sonido para nuevos pedidos
        if (type === 'new-order' && isAdminAuthenticated) {
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfQo');
                audio.play().catch(() => {});
            } catch (e) {}
            
            // Notificación del navegador
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Nuevo pedido recibido', {
                    body: message,
                    icon: '/favicon.ico'
                });
            }
        }
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    function updateConnectionStatus(connected) {
        const statusEl = qs('#connection-status');
        if (connected) {
            statusEl.textContent = 'Conectado ✅';
            statusEl.className = 'connection-status connection-online';
        } else {
            statusEl.textContent = 'Desconectado ❌';
            statusEl.className = 'connection-status connection-offline';
        }
    }

    function openAdminPanel() {
        const pwd = prompt('Ingrese contraseña de superadmin:');
        if (pwd !== 'admin123') {
            alert('Contraseña incorrecta');
            return;
        }
        
        isAdminAuthenticated = true;
        const panel = qs('#admin-panel');
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden', 'false');
    }

    function closeAdminPanel() {
        isAdminAuthenticated = false;
        const panel = qs('#admin-panel');
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');
    }

    function exportOrders() {
        window.open('/api/export', '_blank');
    }

    // Socket.io event listeners
    socket.on('connect', () => {
        console.log('Conectado al servidor');
        updateConnectionStatus(true);
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor');
        updateConnectionStatus(false);
    });

    socket.on('orders-loaded', (orders) => {
        renderOrders(orders);
    });

    socket.on('new-order', (order) => {
        // Actualizar la vista agregando el nuevo pedido
        const container = qs('#orders-list');
        if (container.querySelector('p')) { // Si mostraba "No hay pedidos"
            container.innerHTML = '';
        }
        container.insertBefore(renderOrder(order), container.firstChild);
        
        // Actualizar estadísticas
        fetch('/api/orders')
            .then(res => res.json())
            .then(orders => updateStats(orders))
            .catch(console.error);
        
        showNotification(`Nuevo pedido: ${order.cocktail} para ${order.name}`, 'new-order');
    });

    socket.on('order-status-updated', (data) => {
        const orderEl = qs(`[data-order-id="${data.id}"]`);
        if (orderEl) {
            const statusEl = orderEl.querySelector('.order-status');
            const selectEl = orderEl.querySelector('.status-select');
            const statusColors = {
                'pendiente': '#ff9800',
                'preparando': '#2196f3',
                'listo': '#4caf50',
                'entregado': '#9e9e9e'
            };
            
            statusEl.textContent = data.status;
            statusEl.style.background = statusColors[data.status];
            selectEl.value = data.status;
            orderEl.className = `order-item status-${data.status}`;
        }
        
        // Actualizar estadísticas
        fetch('/api/orders')
            .then(res => res.json())
            .then(orders => updateStats(orders))
            .catch(console.error);
    });

    socket.on('order-deleted', (data) => {
        const orderEl = qs(`[data-order-id="${data.id}"]`);
        if (orderEl) {
            orderEl.remove();
        }
        
        // Actualizar estadísticas
        fetch('/api/orders')
            .then(res => res.json())
            .then(orders => {
                updateStats(orders);
                if (orders.length === 0) {
                    qs('#orders-list').innerHTML = '<p>No hay pedidos</p>';
                }
            })
            .catch(console.error);
    });

    socket.on('orders-cleared', () => {
        qs('#orders-list').innerHTML = '<p>No hay pedidos</p>';
        updateStats([]);
    });

    // Inicialización
    document.addEventListener('DOMContentLoaded', () => {
        populateSelect();

        const form = qs('#order-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = qs('#customer-name').value.trim();
            const cocktail = qs('#cocktail-select').value;
            const notes = qs('#customer-notes').value.trim();
            
            if (!name || !cocktail) return;
            
            try {
                await addOrder(name, cocktail, notes);
                qs('#order-msg').textContent = 'Pedido enviado. ¡Gracias!';
                form.reset();
                setTimeout(() => { qs('#order-msg').textContent = ''; }, 2500);
            } catch (error) {
                qs('#order-msg').textContent = 'Error enviando pedido. Intenta de nuevo.';
                qs('#order-msg').style.color = 'red';
                setTimeout(() => { 
                    qs('#order-msg').textContent = ''; 
                    qs('#order-msg').style.color = '';
                }, 3000);
            }
        });

        qs('#admin-btn').addEventListener('click', openAdminPanel);
        qs('#admin-close').addEventListener('click', closeAdminPanel);
        qs('#clear-orders').addEventListener('click', async () => {
            if (confirm('¿Borrar todos los pedidos?')) {
                await clearAllOrders();
            }
        });
        
        const exportBtn = qs('#export-orders');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportOrders);
        }

        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    });
})();