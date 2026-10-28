import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Fuentes que usa el titular de la portada. Si no se precargan, el texto se
// pinta con la de reserva y al cambiar a la buena el bloque salta (CLS).
const FUENTES_CRITICAS = [
  /playfair-display-latin-wght-normal-.*\.woff2$/,
  /playfair-display-latin-wght-italic-.*\.woff2$/,
  /lora-latin-wght-normal-.*\.woff2$/,
]

/**
 * Añade al index.html del build:
 *  - precarga de las fuentes críticas (con su nombre con hash, que solo se
 *    conoce al compilar),
 *  - preconnect a Supabase, para que la conexión esté abierta cuando React
 *    pida el horario y los servicios.
 */
function precargaCritica(supabaseUrl) {
  return {
    name: 'precarga-critica',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      const tags = []
      if (supabaseUrl) {
        tags.push({
          tag: 'link',
          attrs: { rel: 'preconnect', href: new URL(supabaseUrl).origin, crossorigin: true },
          injectTo: 'head',
        })
      }
      for (const nombre of Object.keys(ctx.bundle ?? {})) {
        if (FUENTES_CRITICAS.some((re) => re.test(nombre))) {
          tags.push({
            tag: 'link',
            attrs: { rel: 'preload', href: `/${nombre}`, as: 'font', type: 'font/woff2', crossorigin: true },
            injectTo: 'head',
          })
        }
      }
      return { html, tags }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), precargaCritica(env.VITE_SUPABASE_URL)],
  }
})
