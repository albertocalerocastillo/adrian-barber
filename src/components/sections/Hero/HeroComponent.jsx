import { MapPin, ChevronDown } from 'lucide-react'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import InstagramIcon from '../../ui/InstagramIcon/InstagramIcon'
import { NEGOCIO, INSTAGRAM, INSTAGRAM_URL } from '../../../data/contacto'

/**
 * Hero a pantalla completa. Fondo de pizarra (a juego con el emblema, para que
 * los bordes del logo se fundan con el fondo) y el LOGO oficial de A.S como
 * protagonista. CTA principal "Pedir cita".
 */
export default function HeroComponent() {
  return (
    <section
      id="inicio"
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-tinta text-hueso"
    >
      {/* Foco radial sutil detrás del emblema */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, #24323f 0%, #1a2530 45%, #11181f 100%)',
        }}
      />
      {/* Textura de pizarra (como el fondo del logo) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          mixBlendMode: 'soft-light',
          backgroundSize: '380px 380px',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='360'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.014' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        {/* Kicker */}
        <p className="mb-7 flex items-center gap-2 text-xs tracking-kicker text-acento">
          <MapPin size={14} />
          {NEGOCIO.ciudad}
        </p>

        {/* Emblema (logo oficial) */}
        <h1 aria-label={`${NEGOCIO.nombreCompleto} — ${NEGOCIO.barbero}`}>
          <img
            src="/logo-adri.jpg"
            alt={`${NEGOCIO.nombreCompleto} — ${NEGOCIO.barbero}`}
            className="w-64 max-w-[80vw] rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-acento/20 sm:w-72 md:w-80"
            fetchPriority="high"
          />
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-hueso/70 sm:text-lg">
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
