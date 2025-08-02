# 🚀 Guía de Despliegue en Vercel

## ¿Por qué Vercel?

- ✅ **Soporte nativo para Next.js** - Optimizado para tu framework
- ✅ **Server Actions gratuitas** - Sin necesidad de plan de pago
- ✅ **Despliegue automático** - Conecta tu repositorio de GitHub
- ✅ **Excelente rendimiento** - CDN global y optimizaciones automáticas
- ✅ **Variables de entorno** - Configuración segura de Firebase

## Pasos para Desplegar

### 1. Preparar el Código

Tu código ya está listo para Vercel. Hemos configurado:
- ✅ Server Actions funcionando
- ✅ Firebase como base de datos
- ✅ Navegación móvil corregida
- ✅ Manejo de errores mejorado

### 2. Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Conecta tu cuenta de GitHub

### 3. Importar Proyecto

1. En el dashboard de Vercel, haz clic en "New Project"
2. Selecciona tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Next.js

### 4. Configurar Variables de Entorno

En la configuración del proyecto, agrega estas variables de entorno:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=caff-tracker
NEXT_PUBLIC_FIREBASE_APP_ID=1:381575869719:web:6d97b8e199aa629e477352
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=caff-tracker.appspot.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC8qm8N4up0MVIlsJ5T3pp64NgB8yij2so
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=caff-tracker.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=381575869719
```

### 5. Desplegar

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación automáticamente
3. Obtendrás una URL como: `https://tu-proyecto.vercel.app`

## Configuración Automática

### Despliegues Automáticos

- Cada vez que hagas push a la rama `main`, Vercel desplegará automáticamente
- Los pull requests generan previews automáticos
- Puedes configurar ramas específicas para producción

### Dominio Personalizado

1. Ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

## Ventajas de Vercel vs Firebase Hosting

| Característica | Vercel | Firebase Hosting |
|----------------|--------|------------------|
| Server Actions | ✅ Gratis | ❌ Requiere plan Blaze |
| Next.js | ✅ Optimizado | ⚠️ Experimental |
| Despliegue | ✅ Automático | ⚠️ Manual |
| Previews | ✅ Automáticos | ❌ No disponible |
| CDN | ✅ Global | ✅ Global |
| Precio | ✅ Gratis | ✅ Gratis (limitado) |

## Mantenimiento

### Actualizaciones

1. Haz cambios en tu código local
2. Haz push a GitHub
3. Vercel desplegará automáticamente

### Monitoreo

- Vercel proporciona analytics básicos
- Puedes ver logs de errores en tiempo real
- Performance insights automáticos

## Firebase como Base de Datos

Tu aplicación seguirá usando Firebase Firestore para:
- ✅ Almacenar consultas médicas
- ✅ Autenticación (si la agregas)
- ✅ Tiempo real (si lo necesitas)

## Comandos Útiles

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Desplegar manualmente
vercel

# Desplegar a producción
vercel --prod

# Ver logs
vercel logs
```

## Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

¡Tu aplicación estará funcionando perfectamente en Vercel con Firebase como base de datos! 