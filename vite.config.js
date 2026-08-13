import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- CORREGIDO AQUÍ

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Evita que Vite intente escanear carpetas de Windows fuera de tu proyecto
      ignored: ['C:/Windows/**']
    }
  }
})
