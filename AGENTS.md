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
├── api.js                      # apiFetch() (JWT + 401 → SessionExpiredError) y errorMessage() para ProblemDetail
├── auth.js                     # Token en localStorage y getSession() (claims del JWT: email, userId, userType, isAdmin)
└── components/
    ├── LoginForm.jsx           # Formulario de login → POST /api/users/login
    ├── RegisterForm.jsx        # Formulario de registro → POST /api/users/register
    ├── Dashboard.jsx           # Header + logout + AccountsTable; isAdmin sale del token
    └── AccountsTable.jsx       # GET /api/accounts paginado; edición (solo admin) vía PUT /api/accounts/edit
```

## Endpoints del Backend consumidos

| Método | Ruta              | Descripción                        | Body / Response                              |
|--------|-------------------|------------------------------------|----------------------------------------------|
| POST   | `/api/users/register` | Registro (crea también la cuenta) | Body: `{ identification, name, email, password }` → 201 `{ userId, identification, name, email }` |
| POST   | `/api/users/login`    | Login, devuelve JWT            | Body: `{ email, password }` → `{ token }`; 401 si falla |
| GET    | `/api/accounts?page&pageSize` | Cuentas (admin: todas; cliente: las suyas) | `{ accounts: AccountDto[], totalItems }` |
| PUT    | `/api/accounts/edit`  | Editar cuenta (solo admin)     | `{ accountNmbr, currency, status: "ACTIVE"\|"INACTIVE" }` → `AccountDto` |

Los errores llegan como `ProblemDetail` (`{ status, detail, ... }`).

## Autenticación

- El token JWT se almacena en `localStorage` con la key `token`.
- `apiFetch()` en `src/api.js` lo adjunta automáticamente como `Authorization: Bearer <token>` en cada request.
- Si el backend responde **401** a una petición con token, se limpia el token y se lanza `SessionExpiredError` (el Dashboard redirige a `/login`). Un 401 sin token (login fallido) se trata como error normal.
- `ProtectedRoute` en `App.jsx` usa `getSession()` (token presente y no expirado).
- El rol (`userType`) del token solo decide qué muestra la UI; los permisos reales los aplica el backend.

## Configuración de la API

Las variables de entorno Vite controlan el host y puerto del backend:

```env
VITE_API_HOST=http://localhost   # Default en config.js
VITE_API_PORT=9000               # Default en config.js (gateway)
```

El `.env` (ignorado por git; ver `.env.example`) define los valores efectivos. En Docker se pasan como `--build-arg`.

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
- Navegación siempre con `useNavigate()` (sin recargas completas).
- Los componentes reciben callbacks como props (`onLoginSuccess`, `onSwitch`).

## Notas y TODOs

- No hay tests unitarios ni de integración configurados.
- No hay framework de formularios (validación manual con `required` del HTML).
- No hay manejo de estado global para el usuario autenticado más allá de `localStorage`.
