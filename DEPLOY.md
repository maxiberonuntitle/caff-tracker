# Guía de Despliegue con Firebase Hosting

Esta guía te mostrará cómo desplegar tu aplicación Next.js en Firebase Hosting.

## Prerrequisitos

- Node.js y npm instalados en tu máquina.
- Una cuenta de Firebase y un proyecto creado (¡ya lo tienes!).

## Pasos para el Despliegue

### 1. Instalar Firebase Tools (si no lo tienes)

Abre una terminal en tu computadora (fuera de este entorno de desarrollo) y ejecuta el siguiente comando para instalar las herramientas de Firebase de forma global. Solo necesitas hacer esto una vez.

```bash
npm install -g firebase-tools
```

### 2. Iniciar Sesión en Firebase

En la misma terminal, inicia sesión en tu cuenta de Google. Esto abrirá una ventana en tu navegador para que te autentiques.

```bash
firebase login
```

### 3. Descarga tu Código

Obtén el código de tu aplicación de Firebase Studio y guárdalo en una carpeta en tu computadora.

### 4. Abre una Terminal en la Carpeta del Proyecto

Navega con tu terminal hasta la carpeta donde guardaste el código de la aplicación.

```bash
cd ruta/a/tu/proyecto
```

### 5. Instala las Dependencias del Proyecto

Ejecuta este comando para instalar todos los paquetes que tu aplicación necesita para funcionar.

```bash
npm install
```

### 6. Inicializa Firebase Hosting (si es necesario)

Si es la primera vez que despliegas este proyecto desde tu máquina local, ejecuta:

```bash
firebase init hosting
```

Sigue los pasos:
- **Selecciona tu proyecto:** Elige "Use an existing project" y selecciona tu proyecto `caff-tracker` de la lista.
- **Directorio público:** Escribe `.next` y presiona Enter.
- **Configurar como una aplicación de una sola página (SPA):** Responde que **Sí** (Yes).
- **Configurar compilaciones y despliegues automáticos con GitHub:** Responde que **No** (No) por ahora.

### 7. Construye tu Aplicación

Ahora, crea la versión optimizada de tu aplicación para producción.

```bash
npm run build
```

### 8. Despliega en Firebase Hosting

¡Este es el último paso! Ejecuta el siguiente comando para subir tu aplicación al servidor.

```bash
npm run deploy
```

Este comando utiliza el script definido en `package.json`, que ejecuta `firebase deploy --only hosting`.

Una vez que el comando termine, te dará la URL donde tu aplicación está alojada y funcionando (algo como `https://caff-tracker.web.app`). ¡Y eso es todo! Tu aplicación estará en línea y disponible para cualquiera.
