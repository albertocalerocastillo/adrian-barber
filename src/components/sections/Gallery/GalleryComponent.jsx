// #region Imports
import { useState } from 'react'
import { Expand } from 'lucide-react'
import SectionHeadingComponent from '../../core/SectionHeading/SectionHeadingComponent'
import RevealComponent from '../../core/Reveal/RevealComponent'
import LightboxComponent from '../../core/Lightbox/LightboxComponent'
import InstagramIconComponent from '../../core/InstagramIcon/InstagramIconComponent'
import { GALERIA } from '../../../data/gallery'
import { INSTAGRAM, INSTAGRAM_URL } from '../../../data/contact'
// #endregion

/**
 * Rejilla de trabajos + lightbox al pulsar. Cada foto entra creciendo un poco,
 * escalonada por columnas; al pasar el ratón se acerca y aparece el icono de
 * ampliar.
 */
const GalleryComponent = () => {
  // #region Declaraciones, variables y hooks
  const [indice, setIndice] = useState(null)

  const abrir = (i) => setIndice(i)
  const cerrar = () => setIndice(null)
  const anterior = () => setIndice((i) => (i - 1 + GALERIA.length) % GALERIA.length)
  const siguiente = () => setIndice((i) => (i + 1) % GALERIA.length)
  // #endregion

  // #region Renderizado
  return (
    <section id="galeria" className="bg-hueso py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeadingComponent
          kicker="El trabajo"
          titulo="Galería"
          texto="Trabajos reales, recién salidos de la silla."
        />

        {/* Filas que se rellenan en orden, no "masonry" de columnas: las fotos
            son todas verticales con la misma proporción, y las columnas CSS
            las repartían 3+2+2 con un hueco feo al final. Con flex centrado,
            si la última fila queda corta (7 fotos = 4+3 en escritorio) se queda en medio
            en vez de colgando a la izquierda, sea cual sea el número de fotos.
            (Si algún día entran fotos apaisadas, habría que revisarlo.). */}
        <div className="mt-14 flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
          {GALERIA.map((foto, i) => (
            <RevealComponent
              key={foto.id}
              delay={(i % 4) * 90}
              desde="escala"
              className="w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
            >
              <button
                type="button"
                onClick={() => abrir(i)}
                aria-label={`Ampliar foto ${i + 1}`}
                className="al-tocar group relative block w-full overflow-hidden bg-tinta"
              >
                <img
                  src={foto.src}
                  alt={foto.alt}
                  width={foto.w}
                  height={foto.h}
                  loading="lazy"
                  className="block h-auto w-full transition-transform duration-700 ease-[var(--ease-suave)] group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-tinta/70 via-tinta/0 to-tinta/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center bg-acento text-tinta opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <Expand size={18} strokeWidth={2} />
                </span>
                {/* Esquinas doradas al pasar el ratón. */}
                <span className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l border-t border-acento opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </button>
            </RevealComponent>
          ))}
        </div>

        <RevealComponent className="mt-12 flex justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="al-tocar inline-flex items-center gap-3 border border-tinta/20 px-8 py-4 text-sm font-medium uppercase tracking-widest text-tinta hover:border-tinta hover:bg-tinta hover:text-hueso"
          >
            <InstagramIconComponent size={18} />
            Más trabajos en @{INSTAGRAM}
          </a>
        </RevealComponent>
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
  // #endregion
}

export default GalleryComponent
