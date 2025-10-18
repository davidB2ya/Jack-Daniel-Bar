// scripts-firebase.js - Sistema de pedidos en tiempo real con Firebase
(function () {
    // Configuración de Firebase (necesitas reemplazar con tu configuración)
    const firebaseConfig = {
        apiKey: "TU_API_KEY",
        authDomain: "TU_PROJECT_ID.firebaseapp.com",
        databaseURL: "https://TU_PROJECT_ID-default-rtdb.firebaseio.com/",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_PROJECT_ID.appspot.com",
        messagingSenderId: "TU_SENDER_ID",
        appId: "TU_APP_ID"
    };

    // Inicializar Firebase
    let database;
    let ordersRef;

    function qs(sel, ctx = document) { return ctx.querySelector(sel); }
    function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

    // Verificar si Firebase está disponible
    function initFirebase() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase no está cargado. Usando localStorage como respaldo.');
            return false;
        }
        
        try {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            ordersRef = database.ref('orders');
            return true;
        } catch (error) {
            console.error('Error inicializando Firebase:', error);
            return false;
        }
    }

    // Sistema de respaldo con localStorage
    const ORDER_KEY = 'cocteles_pedidos_v1';
    function loadOrdersLocal() {
        try {
            return JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }
    function saveOrdersLocal(orders) {
        localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
    }

    // Obtener nombres de bebidas desde el DOM
    function getDrinksFromDOM() {
        const names = new Set();
        const sections = qsa('main.cocteles > section');
        sections.forEach(s => {
            const nameEl = s.querySelector('p');
            if (nameEl && nameEl.textContent.trim()) names.add(nameEl.textContent.trim());
        });
        const coronaPs = qsa('footer .coronas p');
        coronaPs.forEach(p => { if (p.textContent.trim()) names.add(p.textContent.trim()); });
        const footerLis = qsa('footer ul li');
        footerLis.forEach(li => { if (li.textContent.trim()) names.add(li.textContent.trim()); });
        return Array.from(names);
    }

    function populateSelect() {
        const select = qs('#cocktail-select');
        select.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
        const drinks = getDrinksFromDOM();
        drinks.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
        });
    }

    // Sistema de pedidos con Firebase o localStorage
    function addOrder(name, cocktail) {
        const order = { 
            id: Date.now() + '-' + Math.random().toString(36).slice(2,8), 
            timestamp: Date.now(), 
            name, 
            cocktail,
            status: 'pendiente'
        };

        if (ordersRef) {
            // Usar Firebase
            ordersRef.push(order).then(() => {
                console.log('Pedido enviado a Firebase');
            }).catch(error => {
                console.error('Error enviando pedido:', error);
                // Respaldo con localStorage
                const orders = loadOrdersLocal();
                orders.push(order);
                saveOrdersLocal(orders);
            });
        } else {
            // Usar localStorage como respaldo
            const orders = loadOrdersLocal();
            orders.push(order);
            saveOrdersLocal(orders);
        }
    }

    function deleteOrder(orderId) {
        if (ordersRef) {
            // Buscar y eliminar en Firebase
            ordersRef.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const order = childSnapshot.val();
                    if (order.id === orderId) {
                        childSnapshot.ref.remove();
                    }
                });
            });
        } else {
            // Eliminar de localStorage
            const orders = loadOrdersLocal().filter(o => o.id !== orderId);
            saveOrdersLocal(orders);
            renderOrdersLocal();
        }
    }

    function clearAllOrders() {
        if (ordersRef) {
            ordersRef.remove();
        } else {
            localStorage.removeItem(ORDER_KEY);
            renderOrdersLocal();
        }
    }

    function updateOrderStatus(orderId, newStatus) {
        if (ordersRef) {
            ordersRef.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const order = childSnapshot.val();
                    if (order.id === orderId) {
                        childSnapshot.ref.update({ status: newStatus });
                    }
                });
            });
        }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
    }

    function renderOrder(order, firebaseKey = null) {
        const div = document.createElement('div');
        div.className = `order-item status-${order.status || 'pendiente'}`;
        
        const statusColor = {
            'pendiente': '#ff9800',
            'preparando': '#2196f3',
            'listo': '#4caf50',
            'entregado': '#9e9e9e'
        };

        div.innerHTML = `
            <div class="order-header">
                <strong>${escapeHtml(order.cocktail)}</strong>
                <span class="order-status" style="background: ${statusColor[order.status] || '#ff9800'}">
                    ${order.status || 'pendiente'}
                </span>
            </div>
            <small>Pedido por: ${escapeHtml(order.name)} — ${new Date(order.timestamp).toLocaleString()}</small>
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

        // Event listeners para cambio de estado
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

    function renderOrdersFirebase() {
        const container = qs('#orders-list');
        
        ordersRef.on('value', (snapshot) => {
            container.innerHTML = '';
            const orders = [];
            
            snapshot.forEach((childSnapshot) => {
                const order = childSnapshot.val();
                orders.push(order);
            });

            if (!orders.length) {
                container.innerHTML = '<p>No hay pedidos</p>';
                return;
            }

            // Ordenar por timestamp (más recientes primero)
            orders.sort((a, b) => b.timestamp - a.timestamp);
            
            orders.forEach(order => {
                container.appendChild(renderOrder(order));
            });

            // Mostrar notificación de nuevos pedidos
            showNewOrderNotification(orders.length);
        });
    }

    function renderOrdersLocal() {
        const container = qs('#orders-list');
        const orders = loadOrdersLocal();
        container.innerHTML = '';
        
        if (!orders.length) {
            container.innerHTML = '<p>No hay pedidos</p>';
            return;
        }

        orders.slice().reverse().forEach(order => {
            container.appendChild(renderOrder(order));
        });
    }

    let lastOrderCount = 0;
    function showNewOrderNotification(currentCount) {
        if (lastOrderCount > 0 && currentCount > lastOrderCount) {
            // Mostrar notificación visual
            const notification = document.createElement('div');
            notification.className = 'new-order-notification';
            notification.textContent = '¡Nuevo pedido recibido!';
            document.body.appendChild(notification);
            
            // Reproducir sonido (opcional)
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfiUFJnbJ8N2QQAoUX7Pp66hVFApGnt/yvmMcBSuL1O/kfQIoEwl0');
                audio.play().catch(() => {}); // Ignore errors
            } catch (e) {}
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        lastOrderCount = currentCount;
    }

    function openAdminPanel() {
        const pwd = prompt('Ingrese contraseña de superadmin:');
        if (pwd !== 'admin123') {
            alert('Contraseña incorrecta');
            return;
        }
        const panel = qs('#admin-panel');
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden', 'false');
        
        if (ordersRef) {
            renderOrdersFirebase();
        } else {
            renderOrdersLocal();
        }
    }

    function closeAdminPanel() {
        const panel = qs('#admin-panel');
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');
        
        // Detener escucha de Firebase si está activa
        if (ordersRef) {
            ordersRef.off();
        }
    }

    // Inicialización
    document.addEventListener('DOMContentLoaded', () => {
        const firebaseAvailable = initFirebase();
        
        if (!firebaseAvailable) {
            console.log('Usando sistema local (localStorage)');
        } else {
            console.log('Sistema Firebase inicializado');
        }

        populateSelect();

        const form = qs('#order-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = qs('#customer-name').value.trim();
            const cocktail = qs('#cocktail-select').value;
            if (!name || !cocktail) return;
            
            addOrder(name, cocktail);
            qs('#order-msg').textContent = 'Pedido enviado. ¡Gracias!';
            form.reset();
            setTimeout(() => { qs('#order-msg').textContent = ''; }, 2500);
        });

        qs('#admin-btn').addEventListener('click', openAdminPanel);
        qs('#admin-close').addEventListener('click', closeAdminPanel);
        qs('#clear-orders').addEventListener('click', () => {
            if (confirm('¿Borrar todos los pedidos?')) {
                clearAllOrders();
            }
        });
    });
})();