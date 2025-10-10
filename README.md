# La Milanesa

Este repositorio contiene el frontend en **SvelteKit** de la web de "La verdad de la Milanesa".

Estructura principal:

```bash
la-milanesa/
├─ src
│  ├─ components
│  ├─ lib
│  ├─ routes
│  └─ app.html
├─ static
│  ├─ favicons
│  ├─ images
│  └─ logos
└─ ...
```

---

## Frontend (SvelteKit)

El frontend usa **pnpm** como gestor de paquetes.

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Levantar el servidor de desarrollo

```bash
pnpm run dev
```

Esto levantará la app en http://localhost:5173/ (puede variar según configuración de Vite).

### 3. Construir para producción

> Para desplegar, asegúrate de configurar un adapter SvelteKit según tu entorno.

---