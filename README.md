# USD Coin Buyer – web client

React 19 + Vite front end of the wallet. It only talks to the API gateway (`java-wallet-gateway`, port 9000 by default).

## Run locally

```sh
cp .env.example .env   # VITE_API_HOST / VITE_API_PORT point to the gateway
npm install
npm run dev
```

## Scripts

- `npm run dev` – dev server with HMR
- `npm run build` – production build in `dist/`
- `npm run lint` – ESLint

## Docker

```sh
docker build --build-arg VITE_API_HOST=http://localhost --build-arg VITE_API_PORT=9000 -t wallet-client .
docker run -p 8080:80 wallet-client
```

## Notes

- The JWT is kept in `localStorage` and decoded client side only to decide what to show (e.g. admin actions); every permission is enforced by the backend.
- Backend errors are RFC 9457 `ProblemDetail` objects; `errorMessage()` in `src/api.js` shows their `detail`.
