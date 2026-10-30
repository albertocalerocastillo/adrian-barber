// #region Imports
import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'
import { Scissors, Award, Heart } from 'lucide-react'
import RevealComponent from '../../core/Reveal/RevealComponent'
import InstagramIconComponent from '../../core/InstagramIcon/InstagramIconComponent'
import { NEGOCIO, INSTAGRAM, INSTAGRAM_URL } from '../../../data/contact'

// ⚠️ TEMPORAL: hasta que Adrián mande una foto suya, usamos un trabajo real
// suyo (antes había una foto de stock de un desconocido).
// Para ponerla: suelta la foto en src/assets/adrian.jpg y cambia este import.
import fotoSobreMi from '../../../assets/galeria/corte-3.jpg'
// #endregion

const VALORES = [
  { icono: Scissors, titulo: 'Oficio', texto: 'Técnica cuidada en cada corte, sin prisas.' },
  { icono: Award, titulo: 'Detalle', texto: 'El acabado importa: barba, perfilado y remate.' },
  { icono: Heart, titulo: 'Cercanía', texto: 'Ambiente de barrio, trato de siempre.' },
]

// La frase grande se "enciende" palabra a palabra según se baja.
const FRASE = 'Me gusta que salgas de la silla con la cabeza alta.'

const Palabra = ({ texto, progreso, rango }) => {
  const opacity = useTransform(progreso, rango, [0.18, 1])
  return (
    <m.span style={{ opacity }} className="motion-reduce:opacity-100!">
      {texto}{' '}
    </m.span>
  )
}

/**
 * Presentación del barbero. Foto con parallax y sello a un lado; al otro, una
 * frase que se ilumina con el scroll, el texto y sus valores.
 * Fondo tinta (oscuro) para contraste con las secciones claras.
 */
const AboutMeComponent = () => {
  // #region Declaraciones, variables y hooks
  const seccion = useRef(null)
  const frase = useRef(null)

  const { scrollYProgress } = useScroll({ target: seccion, offset: ['start end', 'end start'] })
  const fotoY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const selloGiro = useTransform(scrollYProgress, [0, 1], [-40, 40])

  const { scrollYProgress: progresoFrase } = useScroll({
    target: frase,
    offset: ['start 85%', 'end 45%'],
  })
  const palabras = FRASE.split(' ')
  // #endregion

  // #region Renderizado
  return (
    <section ref={seccion} id="sobre-mi" className="grain relative overflow-hidden bg-tinta py-24 text-hueso md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Foto. */}
        <RevealComponent desde="izquierda" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative overflow-hidden">
            <m.img
              src={fotoSobreMi}
              alt={`Trabajo de ${NEGOCIO.barbero}, barbero en ${NEGOCIO.localidad}`}
              width={640}
              height={800}
              loading="lazy"
              className="aspect-[4/5] w-full scale-[1.18] object-cover"
              style={{ y: fotoY }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tinta/60 via-transparent to-transparent" />
          </div>
          {/* Marco de acento. */}
          <span className="pointer-events-none absolute -bottom-4 -left-4 h-28 w-28 border-b-2 border-l-2 border-acento" />
          <span className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 border-r-2 border-t-2 border-acento/40" />
          {/* Sello que gira con el scroll. */}
          <m.img
            src="/logo-sello.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute -bottom-10 -right-6 w-32 drop-shadow-2xl sm:w-36 md:-right-10 md:w-40"
            style={{ rotate: selloGiro }}
          />
        </RevealComponent>

        {/* Texto. */}
        <div>
          <RevealComponent>
            <p className="mb-4 flex items-center gap-3 text-xs tracking-kicker text-acento">
              <span className="h-px w-6 bg-acento/60" />
              Sobre mí
            </p>
            <h2 className="font-display text-4xl font-bold sm:text-5xl md:text-6xl">
              Hola, soy <span className="italic text-acento">Adrián</span>
            </h2>
          </RevealComponent>

          <p
            ref={frase}
            className="mt-8 font-display text-2xl leading-snug sm:text-3xl"
          >
            <span className="sr-only">{FRASE}</span>
            <span aria-hidden="true">
              {palabras.map((p, i) => (
                <Palabra
                  key={p + i}
                  texto={p}
                  progreso={progresoFrase}
                  rango={[i / palabras.length, (i + 1) / palabras.length]}
                />
              ))}
            </span>
          </p>

          <RevealComponent delay={100}>
            <p className="mt-6 text-base leading-relaxed text-hueso/70">
              Barbero y peluquero en {NEGOCIO.localidad} ({NEGOCIO.provincia}). Me
              gusta el corte clásico tanto como las tendencias. Aquí no hay líneas de
              montaje: hay tiempo, conversación y trabajo bien hecho.
            </p>
          </RevealComponent>

          {/* Valores. */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {VALORES.map((v, i) => (
              <RevealComponent key={v.titulo} delay={150 + i * 90}>
                <div className="group h-full border border-tinta-700 bg-tinta-800/70 p-5 transition-colors duration-300 hover:border-acento/50">
                  <span className="flex h-10 w-10 items-center justify-center border border-acento/30 text-acento transition-colors duration-300 group-hover:bg-acento group-hover:text-tinta">
                    <v.icono size={18} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{v.titulo}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-hueso/55">{v.texto}</p>
                </div>
              </RevealComponent>
            ))}
          </div>

          <RevealComponent delay={400}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="subrayado mt-10 inline-flex items-center gap-2.5 pb-1 text-sm font-medium text-hueso/80 hover:text-acento"
            >
              <InstagramIconComponent size={18} />
              Sígueme en @{INSTAGRAM}
            </a>
          </RevealComponent>
        </div>
      </div>
    </section>
  )
  // #endregion
}

export default AboutMeComponent
