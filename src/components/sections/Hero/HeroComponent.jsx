import { MapPin, ChevronDown } from 'lucide-react'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import InstagramIcon from '../../ui/InstagramIcon/InstagramIcon'
import EstadoBadgeComponent from '../../ui/EstadoBadge/EstadoBadgeComponent'
import { useEstadoNegocio } from '../../../hooks/useEstadoNegocio'
import { NEGOCIO, INSTAGRAM, INSTAGRAM_URL } from '../../../data/contacto'

// ⚠️ TEMPORAL: foto de fondo del hero. Cuando Adrián mande una foto del LOCAL
// (fachada o interior, en HORIZONTAL), suéltala en src/assets/local.jpg y
// cambia solo este import. Es el único cambio necesario.
import fondoHero from '../../../assets/galeria/corte-2.jpg'

/**
 * Hero a pantalla completa: foto real de fondo con velo oscuro, el nombre como
 * protagonista tipográfico, lema y CTA. El emblema de A.S va encima.
 *
 * El `pt-28 pb-28` de la sección reserva el sitio de la barra fija de arriba y
 * de la flecha de abajo: sin eso, en portátiles poco altos el emblema quedaba
 * tapado por la barra y el texto chocaba con la flecha.
 */
export default function HeroComponent() {
  const { estado } = useEstadoNegocio()

  return (
    <section
      id="inicio"
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-tinta pb-28 pt-28 text-hueso [@media(max-height:820px)]:pb-20 [@media(max-height:820px)]:pt-24"
    >
      {/* Foto de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${fondoHero})` }}
      />

      {/* Velo oscuro (legibilidad del texto) */}
      <div className="absolute inset-0 bg-gradient-to-b from-tinta/92 via-tinta/86 to-tinta/97" />

      {/* Toque cálido dorado/granate, muy sutil */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 28%, rgba(196,160,90,0.35) 0%, transparent 55%), radial-gradient(circle at 80% 72%, rgba(110,35,41,0.45) 0%, transparent 55%)',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
        {/* Kicker: ubicación */}
        <p className="mb-6 flex items-center gap-2 text-xs tracking-kicker text-acento drop-shadow">
          <MapPin size={14} />
          {NEGOCIO.ciudad}
        </p>

        {/* Emblema oficial */}
        <img
          src="/logo-adri.jpg"
          alt=""
          aria-hidden="true"
          className="mb-6 w-24 rounded-lg shadow-2xl shadow-black/60 ring-1 ring-acento/25 sm:w-28 md:mb-7 md:w-32 lg:w-36 [@media(max-height:820px)]:mb-4 [@media(max-height:820px)]:w-24"
          fetchPriority="high"
        />

        {/* Nombre protagonista */}
        <h1 className="flex flex-col items-center">
          <span className="font-display text-7xl font-bold leading-none tracking-tight drop-shadow-2xl sm:text-8xl md:text-9xl [@media(max-height:820px)]:text-7xl">
            A.S
          </span>
          <span className="mt-5 text-[0.7rem] uppercase tracking-[0.35em] text-hueso/85 sm:text-xs">
            Peluquería y Barbería
          </span>
          <span className="sr-only">
            en {NEGOCIO.ciudad} — {NEGOCIO.barbero}
          </span>
        </h1>

        {/* Filete dorado */}
        <span className="mt-7 block h-px w-24 bg-acento [@media(max-height:820px)]:mt-4" />

        {/* Lema */}
        <p className="mt-7 max-w-xl text-lg italic leading-relaxed text-hueso/85 drop-shadow sm:text-xl [@media(max-height:820px)]:mt-4">
          «Cortes con carácter, barba a navaja y un buen rato en la silla»
        </p>
        <p className="mt-3 text-sm text-hueso/55">
          {NEGOCIO.barbero.split(' ').slice(0, 2).join(' ')} · {NEGOCIO.localidad}
        </p>

        {/* ¿Puedo ir ya? Es la primera pregunta del cliente: se responde aquí
            arriba, sin obligarle a bajar hasta el horario. */}
        <div className="mt-7 [@media(max-height:820px)]:mt-4">
          <EstadoBadgeComponent estado={estado} claro href="#horario" />
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row [@media(max-height:820px)]:mt-5">
          <CitaButtonComponent tamano="lg" />
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border border-hueso/30 px-9 py-4 text-sm font-medium uppercase tracking-widest text-hueso/90 backdrop-blur-sm transition-colors hover:border-acento hover:text-acento"
          >
            <InstagramIcon size={18} />
            @{INSTAGRAM}
          </a>
        </div>

        {/* Cerrado: en vez de dejar al cliente colgado (y que se vaya a otra
            barbería), se le dice que escriba igualmente. */}
        {!estado.abierto && (
          <p className="mt-5 text-xs text-hueso/55">
            Está cerrado, pero puedes escribir igualmente: te contesta en cuanto
            abra.
          </p>
        )}
      </div>

      {/* Indicador de scroll */}
      <a
        href="#servicios"
        aria-label="Ver servicios"
        className="absolute bottom-24 left-1/2 -translate-x-1/2 text-hueso/50 transition-colors hover:text-acento md:bottom-7"
      >
        <ChevronDown size={28} className="animate-bounce" />
      </a>
    </section>
  )
}
