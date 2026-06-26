import { MapPin, ChevronDown, Scissors } from 'lucide-react'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import InstagramIcon from '../../ui/InstagramIcon/InstagramIcon'
import { NEGOCIO, INSTAGRAM, INSTAGRAM_URL } from '../../../data/contacto'

/**
 * Hero a pantalla completa. Fondo oscuro con imagen de barbería (placeholder
 * de Unsplash, a sustituir por foto del local de Adrián) + degradado de tinta.
 * Tipografía display grande y CTA principal "Pedir cita".
 */
export default function HeroComponent() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-tinta text-hueso"
    >
      {/* Fondo */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&q=80"
          alt="Interior de la barbería"
          className="h-full w-full object-cover opacity-40"
          fetchPriority="high"
        />
        {/* Degradados para legibilidad y profundidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-tinta/70 via-tinta/50 to-tinta" />
        <div className="absolute inset-0 bg-gradient-to-r from-tinta/80 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        {/* Kicker */}
        <p className="mb-5 flex items-center gap-2 text-xs tracking-kicker text-acento">
          <MapPin size={14} />
          {NEGOCIO.ciudad}
        </p>

        {/* Logo original (incluye A.S, el claim y el nombre) */}
        <h1>
          <img
            src="/logo-blanco.png"
            alt={`${NEGOCIO.nombreCompleto} — ${NEGOCIO.barbero}`}
            className="w-64 max-w-[80vw] sm:w-80 md:w-[26rem]"
            fetchPriority="high"
          />
        </h1>

        {/* Filete decorativo con tijeras */}
        <div className="mt-5 flex items-center gap-3 text-acento">
          <span className="h-px w-10 bg-acento/50" />
          <Scissors size={16} />
          <span className="h-px w-10 bg-acento/50" />
        </div>

        {/* Subtítulo */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-hueso/70 sm:text-lg">
          Cortes con carácter, barba a navaja y un buen rato en la silla.
          De {NEGOCIO.barbero.split(' ').slice(0, 2).join(' ')}, en el corazón de {NEGOCIO.localidad}.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <CitaButtonComponent tamano="lg" />
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-hueso/30 px-7 py-4 text-sm font-medium text-hueso/90 transition-colors hover:border-acento hover:text-acento"
          >
            <InstagramIcon size={18} />
            @{INSTAGRAM}
          </a>
        </div>
      </div>

      {/* Indicador de scroll */}
      <a
        href="#servicios"
        aria-label="Ver servicios"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-hueso/50 transition-colors hover:text-acento"
      >
        <ChevronDown size={28} className="animate-bounce" />
      </a>
    </section>
  )
}
