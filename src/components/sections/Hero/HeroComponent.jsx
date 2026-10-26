import { useRef } from 'react'
import { m, useScroll, useSpring, useTransform } from 'motion/react'
import { MapPin, Star, ArrowDown } from 'lucide-react'
import CitaButtonComponent from '../../ui/CitaButton/CitaButtonComponent'
import MagneticComponent from '../../ui/Magnetic/MagneticComponent'
import EstadoBadgeComponent from '../../ui/EstadoBadge/EstadoBadgeComponent'
import { useEstadoNegocio } from '../../../hooks/useEstadoNegocio'
import { NEGOCIO, GOOGLE_VALORACION } from '../../../data/contacto'
import { SERVICIOS } from '../../../data/servicios'
import { MUELLE_SUAVE, ordenEntrada } from '../../../theme/animacion'

// ⚠️ TEMPORAL: foto de fondo del hero. Cuando Adrián mande una foto del LOCAL
// (fachada o interior, en HORIZONTAL), suéltala en src/assets/local.jpg y
// cambia solo este import. Es el único cambio necesario.
import fondoHero from '../../../assets/galeria/corte-2.jpg'

// Titular: cada palabra sube por separado. La segunda línea va en dorado.
// Se numeran aquí, una sola vez, para escalonar la animación.
const TITULAR = [
  { texto: 'Cortes con carácter' },
  { texto: 'en La Rinconada', clase: 'italic text-acento' },
].reduce((lineas, linea) => {
  const previas = lineas.flatMap((l) => l.palabras).length
  const palabras = linea.texto.split(' ').map((p, i) => ({ p, orden: previas + i }))
  return [...lineas, { ...linea, palabras }]
}, [])

const PRECIO_CORTE = SERVICIOS.find((s) => s.id === 'corte')?.precio

/**
 * Primera pantalla. En escritorio, texto a la izquierda y el sello a la
 * derecha; en móvil y tablet, el sello arriba y el texto centrado debajo.
 *
 * Motion:
 *  - Al cargar (CSS, no espera a React): el titular sube palabra a palabra y
 *    el resto entra escalonado; el sello aparece girando.
 *  - Al bajar: el texto sube y se desvanece y el sello se queda atrás
 *    (parallax), mientras la foto de fondo hace un zoom lento.
 */
export default function HeroComponent() {
  const { estado } = useEstadoNegocio()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const progreso = useSpring(scrollYProgress, MUELLE_SUAVE)
  const textoY = useTransform(progreso, [0, 1], [0, -110])
  const textoOpacidad = useTransform(progreso, [0, 0.75], [1, 0])
  const selloY = useTransform(progreso, [0, 1], [0, 140])
  const selloGiro = useTransform(progreso, [0, 1], [0, 25])
  const fondoY = useTransform(progreso, [0, 1], ['0%', '18%'])

  return (
    <section
      ref={ref}
      id="inicio"
      className="grain relative flex min-h-svh items-center overflow-hidden bg-tinta-900 text-hueso"
    >
      {/* Foto de fondo con zoom lento + parallax */}
      <m.div className="absolute inset-0" style={{ y: fondoY }} aria-hidden="true">
        <div
          className="ken-burns absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fondoHero})` }}
        />
      </m.div>

      {/* Velo: más oscuro en el lado del texto para que se lea siempre */}
      <div className="absolute inset-0 bg-gradient-to-b from-tinta-900/90 via-tinta-900/85 to-tinta-900 lg:bg-gradient-to-r lg:from-tinta-900/97 lg:via-tinta-900/88 lg:to-tinta-900/70" />

      {/* Halo dorado detrás del sello y toque granate abajo */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(38rem 38rem at 72% 45%, rgba(196,160,90,0.16) 0%, transparent 60%), radial-gradient(40rem 26rem at 10% 100%, rgba(110,35,41,0.35) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-5 pb-28 pt-24 sm:pt-28 md:px-8 md:pb-24 lg:grid-cols-[1.35fr_1fr] lg:gap-8 lg:pb-20 lg:pt-28 xl:gap-16 [@media(max-height:760px)_and_(min-width:1024px)]:pt-24">
        {/* ── Sello ── (en móvil va primero) */}
        <m.div
          className="relative mx-auto w-[min(62vw,17rem)] sm:w-72 md:w-80 lg:order-2 lg:w-full lg:max-w-[30rem] [@media(max-height:760px)_and_(min-width:1024px)]:max-w-[24rem]"
          style={{ y: selloY, rotate: selloGiro }}
        >
          {/* Anillos que giran despacio detrás */}
          <div
            aria-hidden="true"
            className="gira-lento absolute -inset-[7%] rounded-full border border-dashed border-acento/30"
          />
          <div
            aria-hidden="true"
            className="gira-lento-inverso absolute -inset-[14%] hidden rounded-full border border-acento/10 sm:block"
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acento" />
          </div>

          <img
            src="/logo-sello.webp"
            alt={`${NEGOCIO.nombreCompleto} — ${NEGOCIO.barbero}, ${NEGOCIO.localidad}`}
            width={779}
            height={779}
            fetchPriority="high"
            className="sello-entra relative w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          />
        </m.div>

        {/* ── Texto ── */}
        <m.div
          className="text-center lg:order-1 lg:text-left"
          style={{ y: textoY, opacity: textoOpacidad }}
        >
          <p
            className="entra mb-5 inline-flex items-center gap-2 text-[0.7rem] tracking-kicker text-acento sm:text-xs"
            style={ordenEntrada(0)}
          >
            <MapPin size={14} className="shrink-0" />
            <span className="hidden sm:inline">Peluquería y barbería ·</span> {NEGOCIO.ciudad}
          </p>

          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight min-[400px]:text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl 2xl:text-[5.25rem] [@media(max-height:760px)_and_(min-width:1024px)]:text-6xl">
            {/* Entre palabra y palabra va un espacio de verdad (no margen):
                Google y los lectores de pantalla leían "Cortesconcarácter…". */}
            {TITULAR.map((linea) => (
              <span key={linea.texto} className={`block ${linea.clase ?? ''}`}>
                {linea.palabras.map(({ p, orden }, i) => (
                  <span key={orden}>
                    {i > 0 && ' '}
                    <span className="palabra">
                      <span style={ordenEntrada(orden)}>{p}</span>
                    </span>
                  </span>
                ))}{' '}
              </span>
            ))}
            <span className="sr-only">
              {' '}— {NEGOCIO.nombreCompleto}, {NEGOCIO.barbero}
            </span>
          </h1>

          <p
            className="entra mx-auto mt-6 max-w-xl text-base leading-relaxed text-hueso/75 sm:text-lg lg:mx-0 [@media(max-height:760px)_and_(min-width:1024px)]:mt-4"
            style={ordenEntrada(3)}
          >
            Corte con cejas, barba y diseños por{' '}
            <strong className="font-semibold text-hueso">{PRECIO_CORTE} €</strong>. Sin prisas,
            con oficio y trato de barrio. Soy Adrián, tu barbero de confianza.
          </p>

          {/* CTAs */}
          <div
            className="entra mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start [@media(max-height:760px)_and_(min-width:1024px)]:mt-6"
            style={ordenEntrada(4)}
          >
            <MagneticComponent>
              <CitaButtonComponent tamano="lg" />
            </MagneticComponent>
            <a
              href="#servicios"
              className="al-tocar group inline-flex items-center gap-2.5 whitespace-nowrap border border-hueso/25 px-8 py-4 lg:px-6 xl:px-8 text-sm font-medium uppercase tracking-widest text-hueso/90 backdrop-blur-sm hover:border-acento hover:text-acento"
            >
              Ver precios
              <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>

          {/* Prueba social + ¿puedo ir ya? */}
          <div
            className="entra mt-8 flex flex-col items-center gap-x-4 gap-y-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start [@media(max-height:760px)_and_(min-width:1024px)]:mt-6"
            style={ordenEntrada(5)}
          >
            <a href="#resenas" className="group flex items-center gap-3">
              <span className="flex gap-0.5 text-acento">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <span className="text-sm text-hueso/75 transition-colors group-hover:text-hueso">
                <strong className="font-semibold text-hueso">{GOOGLE_VALORACION.nota}</strong> en
                Google · {GOOGLE_VALORACION.resenas} reseñas
              </span>
            </a>
            <span className="hidden h-5 w-px bg-hueso/20 sm:block lg:hidden xl:block" />
            <EstadoBadgeComponent estado={estado} claro href="#horario" />
          </div>

          {/* Cerrado: en vez de dejar al cliente colgado (y que se vaya a otra
              barbería), se le dice que escriba igualmente. */}
          {!estado.abierto && (
            <p className="entra mt-4 text-xs text-hueso/50" style={ordenEntrada(6)}>
              Está cerrado, pero puedes escribir igualmente: te contesta en cuanto abra.
            </p>
          )}
        </m.div>
      </div>

      {/* Indicador para invitar a bajar (solo escritorio) */}
      <m.a
        href="#servicios"
        aria-label="Ver servicios"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-hueso/45 transition-colors hover:text-acento xl:flex [@media(max-height:760px)]:!hidden"
        style={{ opacity: textoOpacidad }}
      >
        Desliza
        <span className="relative h-12 w-px overflow-hidden bg-hueso/15">
          <m.span
            className="absolute inset-x-0 top-0 h-1/2 bg-acento"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </m.a>
    </section>
  )
}
