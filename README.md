# La Milanesa

Este repositorio contiene el frontend en **SvelteKit** y el backend en **Django DRF**.

Estructura principal:

```bash
la-milanesa/
├─ frontend/ # SvelteKit
│ ├─ src
│ └─ static
├─ backend/ # Django DRF
│ ├─ .venv
│ ├─ api
│ ├─ core
│ ├─ manage.py
│ └─ ...
├─ .gitignore
├─ README.md
└─ ...
```

---

## Frontend (SvelteKit)

El frontend está en la carpeta `frontend/` y usa **pnpm** como gestor de paquetes.

### 1. Instalar dependencias

```bash
cd frontend
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

## Backend (Django DRF)

El backend está en la carpeta backend/ y usa un entorno virtual .venv y uv para correr los comandos.

### 1. Crear y activar el entorno (si aún no existe)

```bash
cd backend
python -m venv .venv      # si no existe
uv activate .venv
python -m ensurepip --upgrade
```

### 2. Instalar dependencias

```bash
uv sync
```
> Asegúrate de tener uv instalado globalmente (pip install uv).

### 3. Configurar variables de entorno

Copia el archivo de ejemplo .env.sample a .env y completa las variables necesarias:

```bash
cp .env.sample .env
```

* SECRET_KEY: clave secreta de Django
* DEBUG: True o False
* Otros valores según tu configuración

### 4. Aplicar migraciones

```bash
uv run python manage.py migrate
```

### 5. Levantar el servidor local

```bash
uv run python manage.py runserver
```
> Esto levantará el backend en http://127.0.0.1:8000/

### 6. Crear una nueva app Django

```bash
uv run python manage.py startapp <nombre_app>
```
> Luego agregarla en INSTALLED_APPS en core/settings.py

---

## Notas

* El frontend se sirve por defecto en `/` y el backend está en `/api`.

* Se recomienda mantener el backend en desarrollo con `uv run` para aprovechar el entorno virtual.

* Para producción, configurar correctamente las variables de entorno y la base de datos.
