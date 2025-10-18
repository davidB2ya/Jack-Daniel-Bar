# Configuración de Firebase para Sistema de Pedidos en Tiempo Real

## Pasos para configurar Firebase:

### 1. Crear proyecto en Firebase
1. Ve a https://console.firebase.google.com/
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: "cocteles-pedidos" (o el que prefieras)
4. Acepta los términos y crea el proyecto

### 2. Configurar Realtime Database
1. En la consola de Firebase, ve a "Realtime Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (para desarrollo)
4. Elige una ubicación (recomendado: us-central1)

### 3. Obtener configuración
1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. En la pestaña "General", busca "Tus aplicaciones"
3. Haz clic en el ícono web (</>) para agregar una app web
4. Nombre de la app: "Cocteles Web"
5. Copia la configuración que aparece

### 4. Actualizar scripts-firebase.js
Reemplaza la configuración en `scripts-firebase.js`:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com/",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 5. Reglas de seguridad de Realtime Database
Para desarrollo, puedes usar estas reglas (NO para producción):

```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```

Para producción, usa reglas más seguras:

```json
{
  "rules": {
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 6. Usar el sistema
1. Cambia `scripts.js` por `scripts-firebase.js` en tu HTML
2. O usa `index-firebase.html` que ya tiene todo configurado
3. Los pedidos se sincronizarán en tiempo real entre todos los dispositivos

## Características del sistema:

✅ **Tiempo real**: Los pedidos aparecen instantáneamente en todos los dispositivos
✅ **Estados de pedido**: Pendiente → Preparando → Listo → Entregado
✅ **Notificaciones visuales**: Alertas cuando llegan nuevos pedidos
✅ **Sonidos**: Notificación auditiva opcional
✅ **Estadísticas**: Contador de pedidos por estado
✅ **Responsive**: Funciona en móviles y tablets
✅ **Exportar datos**: Función para exportar pedidos
✅ **Respaldo offline**: Si Firebase falla, usa localStorage

## Alternativas sin Firebase:

### Opción 1: Servidor Node.js simple (recomendado si tienes hosting)
### Opción 2: JSON Server (para desarrollo rápido)
### Opción 3: Supabase (alternativa gratuita a Firebase)
### Opción 4: WebSockets simples con Socket.io

¿Quieres que implemente alguna de estas alternativas?