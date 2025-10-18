# 🍹 Sistema de Pedidos en Tiempo Real - Coctelería
## ✨ Solución Completa para Vercel + Firebase

### 🎯 **LA SOLUCIÓN PERFECTA**
**Un solo sistema que funciona perfecto para desplegar en Vercel**

- 🌐 **Link para clientes**: Comparten pedidos desde cualquier dispositivo
- 💻 **Panel admin en tu PC**: Recibes pedidos en tiempo real
- 🚀 **Deploy en Vercel**: Gratis y automático
- 🔥 **Firebase**: Base de datos en tiempo real
- 📱 **100% Responsive**: Funciona en móviles y PC

## � **DESPLIEGUE SÚPER FÁCIL**

### ⚡ Paso 1: Configurar Firebase (5 min)
Ver guía completa en → **[GUIA_VERCEL.md](GUIA_VERCEL.md)**

### ⚡ Paso 2: Subir a Vercel (2 min)
```bash
git add .
git commit -m "Sistema completo"
git push origin main
```
Luego conectar en vercel.com

### ⚡ Paso 3: ¡LISTO!
Tu link será: `https://cocteles-tu-usuario.vercel.app`

## � **CÓMO FUNCIONA**

### 👥 **Para tus clientes:**
1. Les das tu link de Vercel
2. Escriben nombre + seleccionan bebida
3. Pueden agregar notas especiales
4. ¡El pedido llega a tu PC al instante!

### 👨‍💼 **Para ti (Admin):**
1. Abres el mismo link en tu PC
2. Botón "📋 Admin" → contraseña: `admin123`
3. ¡Ves todos los pedidos en tiempo real!
4. Cambias estados: Pendiente → Preparando → Listo → Entregado

## ✨ **CARACTERÍSTICAS**

- ✅ **100% Tiempo Real**: Los pedidos aparecen al instante
- ✅ **Estados Visuales**: Colores para cada estado del pedido
- ✅ **Notificaciones**: Sonido + alerta cuando llegan pedidos
- ✅ **Estadísticas**: Contadores por estado
- ✅ **Exportar CSV**: Descargar reporte de pedidos
- ✅ **Responsive**: Perfecto en móviles
- ✅ **Offline**: Si se pierde conexión, guarda localmente
- ✅ **Notas**: Los clientes pueden agregar instrucciones

## 🔧 **PERSONALIZAR**

### Cambiar contraseña:
En `scripts.js` línea 202:
```javascript
if (pwd !== 'tu_nueva_contraseña') {
```

### Agregar bebidas:
Solo agrega secciones en `index.html` siguiendo el patrón.

## 🎯 **EL RESULTADO**
- **Clientes**: Envían pedidos desde sus teléfonos
- **Tú**: Recibes pedidos en tiempo real en tu PC
- **Gratis**: Vercel + Firebase no cuestan nada
- **Profesional**: Se ve y funciona como una app real