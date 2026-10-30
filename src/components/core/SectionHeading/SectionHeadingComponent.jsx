// #region Imports
import { m } from 'motion/react'
import RevealComponent from '../../core/Reveal/RevealComponent'
import { EASE_SMOOTH } from '../../../theme/animation'
// #endregion

/**
 * Encabezado de sección reutilizable: kicker en mayúsculas + título display +
 * filete dorado que se dibuja al aparecer (+ entradilla opcional).
 * Mantiene la jerarquía tipográfica coherente en toda la web.
 *
 * Props:
 *  - kicker: texto pequeño en mayúsculas espaciadas (sobre el título).
 *  - titulo: título principal.
 *  - texto: entradilla opcional bajo el filete.
 *  - claro: true para texto claro (sobre fondos oscuros).
 *  - centrado: centra el bloque (por defecto true).
 */
const SectionHeadingComponent = ({
  kicker,
  titulo,
  texto,
  claro = false,
  centrado = true,
}) => {
  const colorTitulo = claro ? 'text-hueso' : 'text-tinta'
  const colorTexto = claro ? 'text-hueso/65' : 'text-tinta/60'

  return (
    <RevealComponent className={centrado ? 'text-center' : ''}>
      {kicker && (
        <p className={`mb-4 flex items-center gap-3 text-xs tracking-kicker text-acento ${centrado ? 'justify-center' : ''}`}>
          <span className="h-px w-6 bg-acento/60" />
          {kicker}
          {centrado && <span className="h-px w-6 bg-acento/60" />}
        </p>
      )}
      <h2 className={`font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl ${colorTitulo}`}>
        {titulo}
      </h2>
      <m.span
        className={`mt-6 block h-px w-20 origin-left bg-acento ${centrado ? 'mx-auto origin-center' : ''}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: EASE_SMOOTH }}
      />
      {texto && (
        <p className={`mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${colorTexto} ${centrado ? 'mx-auto' : ''}`}>
          {texto}
        </p>
      )}
    </RevealComponent>
  )
}

export default SectionHeadingComponent
