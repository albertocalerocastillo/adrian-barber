import { Star, ExternalLink, PenLine } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import {
  GOOGLE_VALORACION,
  GOOGLE_RESENAS_URL,
  GOOGLE_RESENA_URL,
  TESTIMONIOS,
} from '../../../data/contacto'

/**
 * Prueba social: la valoración real de la ficha de Google.
 *
 * Ojo con el SEO: las reseñas se muestran, pero NO se marcan con
 * `aggregateRating` en el JSON-LD. Google ignora (y puede penalizar) las
 * valoraciones que un negocio se pone a sí mismo en su propia web.
 */
export default function ResenasComponent() {
  const { nota, resenas } = GOOGLE_VALORACION

  return (
    <section id="resenas" className="bg-tinta py-20 text-hueso md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent kicker="Lo que dicen" titulo="Reseñas" claro />

        {/* Nota media */}
        <RevealComponent className="mt-12 flex flex-col items-center text-center">
          <div className="flex items-center gap-1 text-acento">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={26} fill="currentColor" strokeWidth={0} />
            ))}
          </div>

          <p className="mt-5 font-display text-6xl font-bold sm:text-7xl">{nota}</p>

          <p className="mt-3 text-sm text-hueso/60">
            {resenas} reseñas en Google
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href={GOOGLE_RESENAS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-hueso/30 px-9 py-4 text-xs font-medium uppercase tracking-widest text-hueso/90 transition-colors hover:border-acento hover:text-acento"
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
                className="inline-flex items-center gap-2.5 bg-acento px-9 py-4 text-xs font-semibold uppercase tracking-widest text-tinta transition-colors hover:bg-acento-claro"
              >
                <PenLine size={15} strokeWidth={2} />
                Deja la tuya
              </a>
            )}
          </div>
        </RevealComponent>

        {/* Testimonios (solo si hay reales copiados de la ficha) */}
        {TESTIMONIOS.length > 0 && (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIOS.map((t, i) => (
              <RevealComponent key={t.autor + i} delay={i * 80}>
                <figure className="flex h-full flex-col border border-tinta-700 bg-tinta-800 p-6">
                  <div className="flex gap-0.5 text-acento">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} size={15} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm italic leading-relaxed text-hueso/75">
                    «{t.texto}»
                  </blockquote>
                  <figcaption className="mt-5 text-xs uppercase tracking-widest text-acento">
                    {t.autor}
                  </figcaption>
                </figure>
              </RevealComponent>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
