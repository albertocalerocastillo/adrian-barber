// #region Imports
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import { EASE_SMOOTH } from '../../../theme/animation'
import type { IRevealProps } from './IRevealProps'
import { RevealFromEnum } from '../../../services/enums/RevealFromEnum'
// #endregion

// #region Constantes
const DESPLAZAMIENTO = 36

const OCULTO = {
  bottom: { opacity: 0, y: DESPLAZAMIENTO },
  left: { opacity: 0, x: -DESPLAZAMIENTO },
  right: { opacity: 0, x: DESPLAZAMIENTO },
  scale: { opacity: 0, scale: 0.94 },
}

const MS_POR_SEGUNDO = 1000
// #endregion

/**
 * Envuelve a sus hijos y los hace aparecer al llegar a ellos con el scroll
 * (Motion). Solo anima una vez. Con "reducir movimiento", MotionConfig (App)
 * quita el desplazamiento y deja solo el fundido.
 */
const RevealComponent: FunctionComponent<IRevealProps> = ({
  children,
  delay = 0,
  from = RevealFromEnum.Bottom,
  as = 'div',
  className = '',
}) => {
  // #region Declaraciones, variables y hooks
  const Componente = m[as]
  // #endregion

  // #region Renderizado
  return (
    <Componente
      className={className}
      initial={OCULTO[from]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.85, delay: delay / MS_POR_SEGUNDO, ease: EASE_SMOOTH }}
    >
      {children}
    </Componente>
  )
  // #endregion
}

export default RevealComponent
