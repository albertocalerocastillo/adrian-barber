import { useState } from 'react'
import SectionHeadingComponent from '../../ui/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../ui/Reveal/RevealComponent'
import LightboxComponent from '../../ui/Lightbox/LightboxComponent'
import { GALERIA } from '../../../data/galeria'

/**
 * Mosaico de trabajos (masonry con CSS columns) + lightbox al pulsar.
 * Las fotos son placeholders en la Fase 1; se sustituyen por trabajos reales.
 */
export default function GaleriaComponent() {
  const [indice, setIndice] = useState(null)

  const abrir = (i) => setIndice(i)
  const cerrar = () => setIndice(null)
  const anterior = () => setIndice((i) => (i - 1 + GALERIA.length) % GALERIA.length)
  const siguiente = () => setIndice((i) => (i + 1) % GALERIA.length)

  return (
    <section id="galeria" className="bg-hueso py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent kicker="El trabajo" titulo="Galería" />

        <div className="mt-12 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
          {GALERIA.map((foto, i) => (
            <RevealComponent key={foto.id} delay={(i % 3) * 80} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => abrir(i)}
                className="group relative block w-full overflow-hidden rounded-2xl"
              >
                <img
                  src={foto.src}
                  alt={foto.alt}
                  loading="lazy"
                  className="block h-auto w-full transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-tinta/0 transition-colors duration-300 group-hover:bg-tinta/20" />
              </button>
            </RevealComponent>
          ))}
        </div>
      </div>

      <LightboxComponent
        fotos={GALERIA}
        indice={indice}
        onCerrar={cerrar}
        onAnterior={anterior}
        onSiguiente={siguiente}
      />
    </section>
  )
}
