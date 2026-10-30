// #region Imports
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import RevealComponent from '../../core/Reveal/RevealComponent'
import { EASE_SMOOTH } from '../../../theme/animation'
import type { ISectionHeadingProps } from './ISectionHeadingProps'
// #endregion

/**
 * Encabezado de sección reutilizable: kicker en mayúsculas + título display +
 * filete dorado que se dibuja al aparecer (+ entradilla opcional).
 * Mantiene la jerarquía tipográfica coherente en toda la web.
 */
const SectionHeadingComponent: FunctionComponent<ISectionHeadingProps> = ({
  kicker,
  title,
  text,
  light = false,
  centered = true,
}) => {
  // #region Declaraciones, variables y hooks
  const colorTitulo = light ? 'text-hueso' : 'text-tinta'
  const colorTexto = light ? 'text-hueso/65' : 'text-tinta/60'
  // #endregion

  // #region Renderizado
  return (
    <RevealComponent className={centered ? 'text-center' : ''}>
      {kicker && (
        <p className={`mb-4 flex items-center gap-3 text-xs tracking-kicker text-acento ${centered ? 'justify-center' : ''}`}>
          <span className="h-px w-6 bg-acento/60" />
          {kicker}
          {centered && <span className="h-px w-6 bg-acento/60" />}
        </p>
      )}
      <h2 className={`font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl ${colorTitulo}`}>
        {title}
      </h2>
      <m.span
        className={`mt-6 block h-px w-20 origin-left bg-acento ${centered ? 'mx-auto origin-center' : ''}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: EASE_SMOOTH }}
      />
      {text && (
        <p className={`mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${colorTexto} ${centered ? 'mx-auto' : ''}`}>
          {text}
        </p>
      )}
    </RevealComponent>
  )
  // #endregion
}

export default SectionHeadingComponent
