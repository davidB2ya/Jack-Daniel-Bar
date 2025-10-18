// scripts.js - Sistema de pedidos en tiempo real con Firebase para Vercel
(function () {
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAguetom2XTrA-6YtKd4uxSXgS7aVgq41o",
        authDomain: "cocteles-pedidos.firebaseapp.com",
        databaseURL: "https://cocteles-pedidos-default-rtdb.firebaseio.com",
        projectId: "cocteles-pedidos",
        storageBucket: "cocteles-pedidos.firebasestorage.app",
        messagingSenderId: "881739110629",
        appId: "1:881739110629:web:60de8ba697e5ae2ed45c0c",
        measurementId: "G-JF66L3JHHP"
    };

    // Estado de la aplicación
    let database;
    let ordersRef;
    let isFirebaseConnected = false;
    let isAdminAuthenticated = false;
    let currentOrders = [];

    // Inicializar Firebase
    function initFirebase() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('Firebase no está disponible. Usando modo local.');
                updateConnectionStatus(false);
                return false;
            }

            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            ordersRef = database.ref('orders');

            // Verificar conexión
            const connectedRef = database.ref('.info/connected');
            connectedRef.on('value', (snapshot) => {
                isFirebaseConnected = snapshot.val() === true;
                updateConnectionStatus(isFirebaseConnected);
            });

            console.log('✅ Firebase inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            updateConnectionStatus(false);
            return false;
        }
    }

    // Funciones de utilidad
    function qs(sel, ctx = document) { return ctx.querySelector(sel); }
    function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function updateConnectionStatus(connected) {
        const statusEl = qs('#connection-status');
        if (!statusEl) return;

        if (connected) {
            statusEl.textContent = '🟢 Conectado';
            statusEl.className = 'connection-status connection-online';
        } else {
            statusEl.textContent = '🔴 Desconectado';
            statusEl.className = 'connection-status connection-offline';
        }
    }

    // Obtener bebidas del DOM
    function getDrinksFromDOM() {
        const names = new Set();

        // Cocteles principales
        const sections = qsa('main.cocteles > section');
        sections.forEach(section => {
            const nameEl = section.querySelector('p');
            if (nameEl && nameEl.textContent.trim()) {
                names.add(nameEl.textContent.trim());
            }
        });

        // Coronas del footer
        const coronaPs = qsa('footer .coronas p');
        coronaPs.forEach(p => {
            if (p.textContent.trim()) {
                names.add(p.textContent.trim());
            }
        });

        // Lista sin alcohol
        const footerLis = qsa('footer ul li');
        footerLis.forEach(li => {
            if (li.textContent.trim()) {
                names.add(li.textContent.trim());
            }
        });

        return Array.from(names);
    }

    function populateSelect() {
        const select = qs('#cocktail-select');
        if (!select) return;

        // Limpiar opciones existentes excepto la primera
        const existingOptions = select.querySelectorAll('option:not([value=""])');
        existingOptions.forEach(option => option.remove());

        const drinks = getDrinksFromDOM();
        drinks.forEach(drink => {
            const option = document.createElement('option');
            option.value = drink;
            option.textContent = drink;
            select.appendChild(option);
        });
    }

    // Gestión de pedidos
    async function addOrder(name, cocktail, notes = '') {
        const order = {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            name: name.trim(),
            cocktail: cocktail.trim(),
            notes: notes.trim(),
            status: 'pendiente',
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        };

        if (isFirebaseConnected && ordersRef) {
            try {
                await ordersRef.push(order);
                console.log('✅ Pedido enviado a Firebase');
            } catch (error) {
                console.error('❌ Error enviando pedido:', error);
                throw error;
            }
        } else {
            // Fallback a localStorage
            const orders = getLocalOrders();
            orders.push(order);
            saveLocalOrders(orders);
            console.log('📱 Pedido guardado localmente');
        }
    }

    function updateOrderStatus(orderId, newStatus) {
        if (isFirebaseConnected && ordersRef) {
            ordersRef.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const order = childSnapshot.val();
                    if (order.id === orderId) {
                        childSnapshot.ref.update({
                            status: newStatus,
                            updatedAt: new Date().toISOString()
                        });
                    }
                });
            });
        }
    }

    function deleteOrder(orderId) {
        if (isFirebaseConnected && ordersRef) {
            ordersRef.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const order = childSnapshot.val();
                    if (order.id === orderId) {
                        childSnapshot.ref.remove();
                    }
                });
            });
        }
    }

    function clearAllOrders() {
        if (isFirebaseConnected && ordersRef) {
            ordersRef.remove();
        } else {
            localStorage.removeItem('cocteles_pedidos');
            renderOrders([]);
        }
    }

    // Sistema local de respaldo
    function getLocalOrders() {
        try {
            return JSON.parse(localStorage.getItem('cocteles_pedidos') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveLocalOrders(orders) {
        localStorage.setItem('cocteles_pedidos', JSON.stringify(orders));
    }

    // Renderizado de pedidos
    function renderOrder(order) {
        const div = document.createElement('div');
        div.className = `order-item status-${order.status}`;
        div.dataset.orderId = order.id;

        const statusColors = {
            'pendiente': '#ff9800',
            'preparando': '#2196f3',
            'listo': '#4caf50',
            'entregado': '#9e9e9e'
        };

        const notesHtml = order.notes ?
            `<div class="order-notes">📝 ${escapeHtml(order.notes)}</div>` : '';

        div.innerHTML = `
            <div class="order-header">
                <strong>${escapeHtml(order.cocktail)}</strong>
                <span class="order-status" style="background: ${statusColors[order.status]}">
                    ${order.status.toUpperCase()}
                </span>
            </div>
            <small>👤 ${escapeHtml(order.name)} • 🕐 ${new Date(order.timestamp).toLocaleString()}</small>
            ${notesHtml}
            <div class="order-actions">
                <select class="status-select" data-order-id="${order.id}">
                    <option value="pendiente" ${order.status === 'pendiente' ? 'selected' : ''}>🟠 Pendiente</option>
                    <option value="preparando" ${order.status === 'preparando' ? 'selected' : ''}>🔵 Preparando</option>
                    <option value="listo" ${order.status === 'listo' ? 'selected' : ''}>🟢 Listo</option>
                    <option value="entregado" ${order.status === 'entregado' ? 'selected' : ''}>⚪ Entregado</option>
                </select>
                <button class="delete-btn" data-order-id="${order.id}">🗑️ Eliminar</button>
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
        if (!container) return;

        currentOrders = orders;
        container.innerHTML = '';

        if (!orders.length) {
            container.innerHTML = '<p style="text-align: center; color: #666;">📭 No hay pedidos</p>';
            updateStats(orders);
            return;
        }

        // Ordenar por timestamp (más recientes primero)
        const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

        sortedOrders.forEach(order => {
            container.appendChild(renderOrder(order));
        });

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

    // Notificaciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Sonido para nuevos pedidos (solo admin)
        if (type === 'new-order' && isAdminAuthenticated) {
            playNotificationSound();
            showDesktopNotification(message);
        }

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    function playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('No se pudo reproducir sonido');
        }
    }

    function showDesktopNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🍹 Nuevo pedido', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍹</text></svg>'
            });
        }
    }

    // Panel de administración
    function openAdminPanel() {
        const pwd = prompt('🔐 Ingrese contraseña de administrador:');
        if (pwd !== 'admin123') {
            alert('❌ Contraseña incorrecta');
            return;
        }

        isAdminAuthenticated = true;
        const panel = qs('#admin-panel');
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden', 'false');

        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification('✅ Notificaciones activadas', 'success');
                }
            });
        }

        console.log('👨‍💼 Panel de admin abierto');
    }

    function closeAdminPanel() {
        isAdminAuthenticated = false;
        const panel = qs('#admin-panel');
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');

        console.log('👨‍💼 Panel de admin cerrado');
    }

    function exportOrders() {
        if (!currentOrders.length) {
            alert('📭 No hay pedidos para exportar');
            return;
        }

        const csvHeader = 'ID,Nombre,Bebida,Notas,Estado,Fecha,Hora\n';
        const csvData = currentOrders.map(order => {
            const date = new Date(order.timestamp);
            return `"${order.id}","${order.name}","${order.cocktail}","${order.notes || ''}","${order.status}","${date.toLocaleDateString()}","${date.toLocaleTimeString()}"`;
        }).join('\n');

        const blob = new Blob([csvHeader + csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        showNotification('📄 Archivo exportado correctamente', 'success');
    }

    // Configurar listeners de Firebase
    function setupFirebaseListeners() {
        if (!ordersRef) return;

        ordersRef.on('value', (snapshot) => {
            const orders = [];
            snapshot.forEach((childSnapshot) => {
                orders.push(childSnapshot.val());
            });

            // Detectar nuevos pedidos para notificaciones
            const newOrdersCount = orders.length;
            const oldOrdersCount = currentOrders.length;

            if (isAdminAuthenticated && newOrdersCount > oldOrdersCount && oldOrdersCount > 0) {
                const newOrders = orders.filter(order =>
                    !currentOrders.some(existing => existing.id === order.id)
                );

                newOrders.forEach(order => {
                    showNotification(`${order.cocktail} para ${order.name}`, 'new-order');
                });
            }

            renderOrders(orders);
        });
    }

    // Inicialización
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🍹 Iniciando sistema de cocteles...');

        // Inicializar componentes
        populateSelect();
        updateConnectionStatus(false);

        // Inicializar Firebase
        const firebaseReady = initFirebase();
        if (firebaseReady) {
            setupFirebaseListeners();
        }

        // Configurar formulario de pedidos
        const form = qs('#order-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = qs('#customer-name').value.trim();
                const cocktail = qs('#cocktail-select').value;
                const notes = qs('#customer-notes').value.trim();

                if (!name || !cocktail) {
                    showNotification('❌ Completa todos los campos requeridos', 'error');
                    return;
                }

                try {
                    await addOrder(name, cocktail, notes);
                    qs('#order-msg').textContent = '✅ ¡Pedido enviado correctamente!';
                    qs('#order-msg').style.color = '#4caf50';
                    form.reset();

                    setTimeout(() => {
                        qs('#order-msg').textContent = '';
                        qs('#order-msg').style.color = '';
                    }, 3000);

                } catch (error) {
                    qs('#order-msg').textContent = '❌ Error enviando pedido. Intenta de nuevo.';
                    qs('#order-msg').style.color = '#f44336';

                    setTimeout(() => {
                        qs('#order-msg').textContent = '';
                        qs('#order-msg').style.color = '';
                    }, 3000);
                }
            });
        }

        // Configurar botones de admin
        const adminBtn = qs('#admin-btn');
        if (adminBtn) {
            adminBtn.addEventListener('click', openAdminPanel);
        }

        const adminClose = qs('#admin-close');
        if (adminClose) {
            adminClose.addEventListener('click', closeAdminPanel);
        }

        const clearBtn = qs('#clear-orders');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('🗑️ ¿Borrar todos los pedidos? Esta acción no se puede deshacer.')) {
                    clearAllOrders();
                    showNotification('🗑️ Todos los pedidos eliminados', 'success');
                }
            });
        }

        const exportBtn = qs('#export-orders');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportOrders);
        }

        console.log('✅ Sistema inicializado correctamente');
    });

})();
