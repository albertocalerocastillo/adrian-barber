import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

/**
 * Modo DEMO del panel, solo para desarrollo: `npm run demo` → http://localhost:5174/admin
 *
 * Sustituye el cliente de Supabase por uno de mentira (demo/supabase-demo.ts):
 * entra al panel sin contraseña, con citas inventadas, y nada de lo que se
 * toque se guarda en ningún sitio. Sirve para revisar el diseño en todos los
 * tamaños de pantalla sin usar credenciales reales ni tocar datos de clientes.
 * Con /admin?login se empieza en la pantalla de acceso.
 * No forma parte de la web publicada (el build normal usa vite.config.ts).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        // './SupabaseService' (desde services/) y '../services/SupabaseService' (desde hooks/ u otros).
        find: /^(?:\.\/|(?:\.\.\/)+services\/)SupabaseService(\.[jt]s)?$/,
        replacement: fileURLToPath(new URL('./demo/supabase-demo.ts', import.meta.url)),
      },
    ],
  },
  server: { port: 5174, strictPort: true },
})
