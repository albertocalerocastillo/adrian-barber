// #region Imports
import { m } from 'motion/react'
import { Star, ExternalLink, PenLine, Quote } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import TiltCardComponent from '../../ui/TiltCard/TiltCardComponent'
import { useCountUp } from '../../../hooks/useCountUp'
import {
  GOOGLE_VALORACION,
  GOOGLE_RESENAS_URL,
  GOOGLE_RESENA_URL,
  TESTIMONIOS,
} from '../../../data/contacto'
// #endregion

// "5,0" → 5.
const NOTA = Number(GOOGLE_VALORACION.nota.replace(',', '.'))

/**
 * Prueba social: la valoración real de la ficha de Google, con la nota y el
 * número de reseñas contando al aparecer, y los testimonios reales.
 *
 * Ojo con el SEO: las reseñas se muestran, pero NO se marcan con
 * `aggregateRating` en el JSON-LD. Google ignora (y puede penalizar) las
 * valoraciones que un negocio se pone a sí mismo en su propia web.
 */
const ResenasComponent = () => {
  // #region Declaraciones, variables y hooks
  const { nota, resenas } = GOOGLE_VALORACION
  const notaRef = useCountUp(NOTA, 1)
  const resenasRef = useCountUp(resenas)
  // #endregion

  // #region Renderizado
  return (
    <section id="resenas" className="grain relative overflow-hidden bg-tinta py-24 text-hueso md:py-32">
      {/* Halo dorado detrás de la nota. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(36rem 24rem at 50% 30%, rgba(196,160,90,0.12), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent kicker="Lo que dicen" titulo="Reseñas" claro />

        {/* Nota media. */}
        <RevealComponent className="mt-14 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 text-acento">
            {Array.from({ length: 5 }, (_, i) => (
              <m.span
                key={i}
                initial={{ opacity: 0, scale: 0.3, rotate: -60 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.3 + i * 0.09 }}
              >
                <Star size={28} fill="currentColor" strokeWidth={0} />
              </m.span>
            ))}
          </div>

          <p className="mt-6 font-display text-8xl font-bold leading-none sm:text-9xl">
            <span ref={notaRef}>{nota}</span>
          </p>

          <p className="mt-4 text-sm uppercase tracking-widest text-hueso/60">
            <span ref={resenasRef} className="font-semibold text-hueso">{resenas}</span> reseñas en Google
          </p>

          <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href={GOOGLE_RESENAS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="al-tocar inline-flex items-center justify-center gap-2.5 border border-hueso/30 px-9 py-4 text-xs font-medium uppercase tracking-widest text-hueso/90 hover:border-acento hover:text-acento"
            >
              Ver reseñas en Google
              <ExternalLink size={15} />
            </a>

            {/* Pedir la reseña justo después de leer las buenas es cuando más
                funciona. Solo sale si hay enlace directo configurado. */}
            {GOOGLE_RESENA_URL && (
              <a
                href={GOOGLE_RESENA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="al-tocar inline-flex items-center justify-center gap-2.5 bg-acento px-9 py-4 text-xs font-semibold uppercase tracking-widest text-tinta hover:bg-acento-claro"
              >
                <PenLine size={15} strokeWidth={2} />
                Deja la tuya
              </a>
            )}
          </div>
        </RevealComponent>

        {/* Testimonios (solo si hay reales copiados de la ficha). */}
        {TESTIMONIOS.length > 0 && (
          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {TESTIMONIOS.map((t, i) => (
              <RevealComponent
                key={t.autor + i}
                delay={i * 110}
                className={i === TESTIMONIOS.length - 1 && TESTIMONIOS.length % 2 ? 'md:col-span-2 lg:col-span-1' : ''}
              >
                <TiltCardComponent inclinacion={2}>
                  <figure className="relative flex h-full flex-col border border-tinta-700 bg-tinta-800/80 p-7 backdrop-blur-sm transition-colors duration-500 hover:border-acento/40 md:p-8">
                    <Quote
                      aria-hidden="true"
                      size={44}
                      strokeWidth={1}
                      className="absolute right-6 top-6 text-acento/25"
                    />
                    <div className="flex gap-0.5 text-acento">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star key={j} size={15} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <blockquote className="mt-5 flex-1 font-display text-lg italic leading-relaxed text-hueso/85">
                      «{t.texto}»
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-tinta-700 pt-5 text-xs uppercase tracking-widest text-acento">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-acento/15 font-display text-sm normal-case not-italic text-acento">
                        {t.autor.charAt(0).toUpperCase()}
                      </span>
                      {t.autor}
                    </figcaption>
                  </figure>
                </TiltCardComponent>
              </RevealComponent>
            ))}
          </div>
        )}
      </div>
    </section>
  )
  // #endregion
}

export default ResenasComponent
