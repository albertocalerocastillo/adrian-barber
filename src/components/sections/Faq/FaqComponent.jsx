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
    <section id="faq" className="bg-hueso py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeadingComponent kicker="Dudas" titulo="Preguntas frecuentes" />

        <div className="mt-12 divide-y divide-hueso-200 border-y border-hueso-200">
          {preguntas.map((p, i) => (
            <RevealComponent key={p.pregunta} delay={i * 60}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-display text-lg font-semibold text-tinta transition-colors hover:text-acento">
                  {p.pregunta}
                  <Plus
                    size={20}
                    strokeWidth={1.75}
                    className="shrink-0 text-acento transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="pb-6 pr-9 text-sm leading-relaxed text-tinta/65">
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
