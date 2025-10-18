# 🍹 Sistema de Pedidos en Tiempo Real - Coctelería

## 🎯 Solución Completa para Vercel + Firebase

Sistema profesional de pedidos en tiempo real para tu coctelería. Los clientes piden desde sus teléfonos y tú recibes los pedidos instantáneamente en tu PC.

### ✨ Características Principales

- 🌐 **Link único**: Comparte un solo link con todos tus clientes
- 💻 **Panel de admin**: Gestiona pedidos en tiempo real desde tu PC
- 📱 **Responsive**: Funciona perfecto en móviles, tablets y PC
- 🔔 **Notificaciones**: Sonidos y alertas cuando llegan nuevos pedidos
- 📊 **Estados**: Pendiente → Preparando → Listo → Entregado
- 📄 **Exportar**: Descarga reportes de pedidos en CSV
- ⚡ **Tiempo real**: Sincronización instantánea con Firebase
- 🆓 **Gratis**: Deploy en Vercel y Firebase sin costo

## 🚀 Despliegue en 3 Pasos

### 1️⃣ Configurar Firebase (5 minutos)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crear proyecto → Nombre: `cocteles-pedidos`
3. Realtime Database → Crear base de datos → Modo de prueba
4. Configuración del proyecto → Agregar app web
5. Copia tu configuración y pégala en `scripts.js` (líneas 4-11)

**Ver guía detallada**: [GUIA_VERCEL.md](GUIA_VERCEL.md)

### 2️⃣ Subir a GitHub

```bash
git add .
git commit -m "Sistema de pedidos listo"
git push origin main
```

### 3️⃣ Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa tu repositorio
4. ¡Deploy automático! 🎉

Tu link será: `https://tu-proyecto.vercel.app`

## 📱 Cómo Usar

### Para Clientes
1. Entran a tu link de Vercel
2. Escriben su nombre
3. Seleccionan bebida (+ notas opcionales)
4. Envían pedido → ¡Llega al instante!

### Para Admin (Tú)
1. Abres el mismo link en tu PC
2. Click en "📋 Admin" 
3. Contraseña: `admin123`
4. ¡Ves todos los pedidos en tiempo real!
5. Cambias estados según avanzas
6. Exportas reportes cuando necesites

## 🔧 Personalización

### Cambiar contraseña de admin
En `scripts.js` línea 202:
```javascript
if (pwd !== 'tu_nueva_contraseña') {
```

### Agregar más bebidas
En `index.html` agrega secciones siguiendo el patrón existente.

### Modificar estilos
Edita `styles.css` para cambiar colores, fuentes, etc.

## 📂 Estructura del Proyecto

```
cocteles/
├── index.html              # Página principal
├── scripts.js              # Lógica + Firebase
├── styles.css              # Estilos
├── vercel.json            # Configuración de Vercel
├── package.json           # Dependencias
├── .gitignore             # Archivos ignorados
├── GUIA_VERCEL.md         # Guía detallada de deploy
└── INSTRUCCIONES_FINALES.md  # Pasos específicos
```

## 🆘 Solución de Problemas

**🔴 Desconectado**: Verifica configuración de Firebase en `scripts.js`

**No aparecen pedidos**: Confirma que Firebase esté en modo de prueba

**Error al enviar**: Revisa la URL de Firebase Database

**Más ayuda**: Abre la consola del navegador (F12) para ver errores

## 🎉 Resultado Final

✅ Link profesional para compartir  
✅ Pedidos en tiempo real  
✅ Panel de administración completo  
✅ Notificaciones automáticas  
✅ Reportes exportables  
✅ 100% gratis  

---

**Necesitas ayuda?** Revisa [INSTRUCCIONES_FINALES.md](INSTRUCCIONES_FINALES.md) para una guía paso a paso completa.

**¡Tu coctelería ahora tiene un sistema profesional de pedidos!** 🍹✨