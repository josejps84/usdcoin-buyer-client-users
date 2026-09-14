# AGENTS.md — Contexto del Proyecto

## Descripción General

Frontend de una aplicación de compra de USDC (USD Coin) orientada a usuarios. Permite registro, inicio de sesión con JWT, y visualización de cuentas del usuario autenticado.

## Stack Tecnológico

- **Framework:** React 19.2.7 (JSX, sin TypeScript)
- **Build tool:** Vite 8.1.1 con `@vitejs/plugin-react` (Oxc)
- **Router:** react-router-dom 7.18.3 (`BrowserRouter`)
- **Styling:** Estilos inline con `style={{}}` — no hay archivos CSS ni framework CSS
- **State management:** `useState` local — no hay Redux, Zustand ni Context API
- **Lenguaje UI:** Español (Latinoamérica)

## Estructura del Proyecto

```
src/
├── main.jsx                    # Entry point, renderiza <App /> en React.StrictMode
├── App.jsx                     # Router: /login, /register, /dashboard, catch-all → /login
├── config.js                   # API_HOST, API_PORT, API_BASE desde variables de entorno Vite
├── api.js                      # apiFetch() — wrapper centralizado de fetch con JWT y manejo 401
└── components/
    ├── LoginForm.jsx           # Formulario de login → POST /api/users/login
    ├── RegisterForm.jsx        # Formulario de registro → POST /api/users/register
    ├── Dashboard.jsx           # Layout con header + botón logout + AccountsTable
    └── AccountsTable.jsx       # GET /api/accounts, tabla con columnas sketch (ID, Nombre, Tipo, Saldo)
```

## Endpoints del Backend consumidos

| Método | Ruta              | Descripción                        | Body / Response                              |
|--------|-------------------|------------------------------------|----------------------------------------------|
| POST   | `/api/users/register` | Registro de usuario            | Body: `{ email, name, password }`            |
| POST   | `/api/users/login`    | Login, devuelve JWT            | Body: `{ email, password }` → `{ token }`   |
| GET    | `/api/accounts`       | Lista de cuentas del usuario   | Response: array de cuentas (shape por definir)|

## Autenticación

- El token JWT se almacena en `localStorage` con la key `token`.
- `apiFetch()` en `src/api.js` lo adjunta automáticamente como `Authorization: Bearer <token>` en cada request.
- Si el backend responde **401**, se limpia el token y se redirige a `/login`.
- `ProtectedRoute` en `App.jsx` verifica la existencia del token antes de renderizar `/dashboard`.

## Configuración de la API

Las variables de entorno Vite controlan el host y puerto del backend:

```env
VITE_API_HOST=http://localhost   # Default en config.js
VITE_API_PORT=8081               # Default en config.js
```

El `.env` en la raíz define los valores efectivos. Actualmente `VITE_API_PORT=9000`.

Para cambiar el backend, editar `.env` o exportar las env vars antes de `npm run dev`.

## Rutas de la Aplicación

| Ruta          | Componente    | Protegida | Descripción                        |
|---------------|---------------|-----------|------------------------------------|
| `/login`      | LoginForm     | No        | Inicio de sesión                   |
| `/register`   | RegisterForm  | No        | Registro de usuario                |
| `/dashboard`  | Dashboard     | Sí        | Panel principal con tabla de cuentas|
| `*`           | Redirect      | No        | Redirige a `/login`                |

## Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo Vite con HMR
npm run build    # Build de producción (output en dist/)
npm run lint     # ESLint sobre todo el proyecto
npm run preview  # Preview del build de producción
```

## Despliegue (Docker)

- **Dockerfile:** Build multi-etapa — Node 22 Alpine (build) → Nginx stable Alpine (producción).
- **nginx.conf:** Sirve archivos estáticos con `try_files` fallback a `index.html` para SPA routing.
- Puerto expuesto: **80**.

## Convenciones de Código

- Componentes funcionales con hooks (no hay clases).
- Archivos `.jsx` — no se usa TypeScript.
- Exportaciones por defecto (`export default`) en todos los componentes.
- Estilos 100% inline (sin CSS modules, styled-components, ni Tailwind).
- Navegación mixta: `useNavigate()` para SPA y `window.location.href` para recargas completas (en LoginForm y RegisterForm).
- Los componentes reciben callbacks como props (`onLoginSuccess`, `onSwitch`).

## Notas y TODOs

- `AccountsTable.jsx` tiene columnas sketch (ID, Nombre, Tipo, Saldo) — **pendiente ajustar cuando el endpoint `/api/accounts` esté definido**.
- No hay tests unitarios ni de integración configurados.
- No hay framework de formularios (validación manual con `required` del HTML).
- No hay manejo de estado global para el usuario autenticado más allá de `localStorage`.
- El archivo `.env` no está en `.gitignore` — se commitea al repositorio.
