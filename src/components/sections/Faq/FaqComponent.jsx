import { useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import { useEstadoNegocio } from '../../../hooks/useEstadoNegocio'
import { construirFaq } from '../../../data/faq'

const ID_MARCADO = 'faq-jsonld'

/**
 * Preguntas frecuentes. Usa <details>/<summary> nativos: se abren sin
 * JavaScript, son accesibles con teclado y Google lee el contenido aunque
 * estén plegados.
 *
 * El marcado FAQPage se genera a partir de EXACTAMENTE las mismas preguntas
 * que se ven en pantalla. Google exige que coincidan, y generándolo aquí es
 * imposible que se desincronicen (el problema que tuvimos con el horario).
 */
export default function FaqComponent() {
  const { horario } = useEstadoNegocio()
  const preguntas = useMemo(() => construirFaq(horario), [horario])

  // Inyecta el JSON-LD y lo retira al desmontar, para no dejar marcado huérfano.
  useEffect(() => {
    const marcado = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: preguntas.map((p) => ({
        '@type': 'Question',
        name: p.pregunta,
        acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
      })),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = ID_MARCADO
    script.textContent = JSON.stringify(marcado)
    document.head.appendChild(script)

    return () => {
      document.getElementById(ID_MARCADO)?.remove()
    }
  }, [preguntas])

  return (
    <section id="faq" className="bg-hueso py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        {/* En escritorio el título se queda fijo mientras se leen las preguntas. */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="lg:hidden">
            <SectionHeadingComponent kicker="Dudas" titulo="Preguntas frecuentes" />
          </div>
          <div className="hidden lg:block">
            <SectionHeadingComponent
              kicker="Dudas"
              titulo="Preguntas frecuentes"
              texto="Lo que más me preguntáis. ¿No está la tuya? Escríbeme y te contesto."
              centrado={false}
            />
          </div>
        </div>

        <div className="divide-y divide-hueso-200 border-y border-hueso-200">
          {preguntas.map((p, i) => (
            <RevealComponent key={p.pregunta} delay={i * 60}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-left font-display text-lg font-semibold text-tinta transition-colors hover:text-acento md:text-xl [&::-webkit-details-marker]:hidden">
                  {p.pregunta}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-acento/40 text-acento transition-all duration-300 group-open:rotate-45 group-open:bg-acento group-open:text-tinta">
                    <Plus size={18} strokeWidth={1.75} />
                  </span>
                </summary>
                <p className="pb-7 pr-12 text-base leading-relaxed text-tinta/65">
                  {p.respuesta}
                </p>
              </details>
            </RevealComponent>
          ))}
        </div>
      </div>
    </section>
  )
}
