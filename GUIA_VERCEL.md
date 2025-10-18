# 🍹 Configuración Completa para Vercel + Firebase

## 🚀 PASO A PASO PARA DESPLEGAR

### 1. Configurar Firebase (5 minutos)

1. **Crear proyecto Firebase:**
   - Ve a https://console.firebase.google.com/
   - Clic en "Crear un proyecto"
   - Nombre: `cocteles-pedidos` (o el que prefieras)

2. **Configurar Realtime Database:**
   - En el menú lateral: "Realtime Database"
   - Clic "Crear base de datos"
   - Selecciona "Comenzar en modo de prueba"
   - Región: us-central1

3. **Obtener configuración:**
   - Ve a "Configuración del proyecto" (⚙️)
   - Pestaña "General" → "Tus aplicaciones"
   - Clic en "</>" (icono web)
   - Nombre: "Cocteles Web"
   - Copia la configuración que te dan

4. **Actualizar scripts.js:**
   Reemplaza esta parte en `scripts.js` líneas 4-11:
   ```javascript
   const firebaseConfig = {
       apiKey: "TU_API_KEY_REAL",
       authDomain: "tu-proyecto.firebaseapp.com",
       databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com/",
       projectId: "tu-proyecto",
       storageBucket: "tu-proyecto.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   };
   ```

### 2. Desplegar en Vercel (2 minutos)

1. **Subir a GitHub:**
   ```bash
   git add .
   git commit -m "Sistema de pedidos completo"
   git push origin main
   ```

2. **Conectar con Vercel:**
   - Ve a https://vercel.com
   - Crea cuenta con GitHub
   - Clic "New Project"
   - Selecciona tu repositorio `cocteles`
   - Clic "Deploy"

3. **¡Listo!** Tu link será algo como:
   `https://cocteles-tu-usuario.vercel.app`

### 3. Configurar Reglas de Firebase

En Firebase Console → Realtime Database → Reglas:

**Para desarrollo (más permisivo):**
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

**Para producción (más seguro):**
```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true,
      ".validate": "newData.hasChildren(['id', 'name', 'cocktail', 'status', 'timestamp'])"
    }
  }
}
```

## 📱 CÓMO USAR EL SISTEMA

### Para tus clientes:
1. Les envías el link de Vercel
2. Entran, escriben su nombre
3. Seleccionan la bebida
4. Opcionalmente agregan notas
5. Envían el pedido

### Para ti (Admin):
1. Abres el mismo link en tu PC
2. Clic en "📋 Admin"
3. Contraseña: `admin123`
4. ¡Ves todos los pedidos en tiempo real!

## 🔧 PERSONALIZACIÓN

### Cambiar contraseña de admin:
En `scripts.js` línea 202:
```javascript
if (pwd !== 'TU_NUEVA_CONTRASEÑA') {
```

### Agregar más bebidas:
Solo agrega más secciones en `index.html` siguiendo el patrón existente.

## ✅ FUNCIONALIDADES INCLUIDAS

- ✅ **Tiempo real**: Los pedidos aparecen instantáneamente
- ✅ **Estados**: Pendiente → Preparando → Listo → Entregado
- ✅ **Notificaciones**: Sonido y notificaciones del navegador
- ✅ **Estadísticas**: Contador por estado
- ✅ **Exportar**: Descargar pedidos en CSV
- ✅ **Responsive**: Funciona perfecto en móviles
- ✅ **Notas**: Los clientes pueden agregar instrucciones especiales
- ✅ **Offline**: Si pierde conexión, guarda localmente

## 🔄 ACTUALIZACIONES

Para hacer cambios:
1. Edita los archivos
2. `git add .` y `git commit -m "cambios"`
3. `git push origin main`
4. Vercel se actualiza automáticamente

## 🆘 SOLUCIÓN DE PROBLEMAS

### "🔴 Desconectado"
- Verifica configuración de Firebase
- Revisa la consola del navegador (F12)

### No aparecen pedidos
- Confirma que las reglas de Firebase permiten lectura/escritura
- Verifica que el proyecto Firebase esté activo

### Error al enviar pedido
- Revisa la configuración de Firebase
- Confirma que el proyecto no esté pausado

## 🎯 RESULTADO FINAL

- **Link para clientes**: `https://tu-proyecto.vercel.app`
- **Panel admin**: Mismo link + botón Admin
- **Contraseña**: `admin123` (cámbiala!)
- **Tiempo real**: Los pedidos aparecen al instante en tu PC

¡Tu sistema estará 100% funcional y profesional!