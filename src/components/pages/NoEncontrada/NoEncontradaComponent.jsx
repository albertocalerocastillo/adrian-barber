import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import { NEGOCIO, WHATSAPP, WHATSAPP_MENSAJE } from '../../../data/contacto'

/**
 * Página para URLs que no existen.
 *
 * Antes cualquier dirección mal escrita mostraba una página EN BLANCO: Vercel
 * redirige todo a la app y, sin ruta comodín, React no pintaba nada.
 *
 * Además se marca como noindex mientras está en pantalla: al ser una SPA el
 * servidor responde 200, así que sin esto Google podría indexar direcciones
 * inventadas como si fueran páginas buenas.
 */
export default function NoEncontradaComponent() {
  useEffect(() => {
    // Se REAPROVECHA la etiqueta robots de index.html en vez de añadir otra:
    // dos etiquetas robots a la vez se contradicen y Google no sabe cuál vale.
    let meta = document.querySelector('meta[name="robots"]')
    const propia = !meta
    const anterior = meta?.content

    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex, follow'

    return () => {
      if (propia) meta.remove()
      else meta.content = anterior
    }
  }, [])

  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`

  return (
    <main className="grain flex min-h-screen flex-col items-center justify-center bg-tinta px-5 text-center text-hueso">
      <img
        src="/logo-adri.jpg"
        alt=""
        aria-hidden="true"
        className="w-20 rounded-lg shadow-2xl shadow-black/60 ring-1 ring-acento/25"
      />

      <p className="mt-8 text-xs tracking-kicker text-acento">Página no encontrada</p>

      <h1 className="mt-4 font-display text-6xl font-bold leading-none sm:text-7xl">404</h1>

      <span className="mt-7 block h-px w-24 bg-acento" />

      <p className="mt-7 max-w-md text-base leading-relaxed text-hueso/70">
        Esta página no existe o ha cambiado de sitio. Pero la barbería sigue
        donde siempre, en {NEGOCIO.localidad}.
      </p>

      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2.5 bg-acento px-9 py-4 text-sm font-semibold uppercase tracking-widest text-tinta transition-colors hover:bg-acento-claro"
        >
          <Home size={18} strokeWidth={2} />
          Ir al inicio
        </Link>

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 border border-hueso/30 px-9 py-4 text-sm font-medium uppercase tracking-widest text-hueso/90 transition-colors hover:border-acento hover:text-acento"
        >
          <WhatsAppIcon size={18} />
          Escríbenos
        </a>
      </div>
    </main>
  )
}
