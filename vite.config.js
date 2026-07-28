import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- CORREGIDO AQUÍ

// https://vite.dev
export default defineConfig({
  plugins: [react()],
})
