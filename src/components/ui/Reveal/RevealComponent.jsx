import { m } from 'motion/react'
import { EASE_SUAVE } from '../../../theme/animacion'

const DESPLAZAMIENTO = 36

const OCULTO = {
  abajo: { opacity: 0, y: DESPLAZAMIENTO },
  izquierda: { opacity: 0, x: -DESPLAZAMIENTO },
  derecha: { opacity: 0, x: DESPLAZAMIENTO },
  escala: { opacity: 0, scale: 0.94 },
}

/**
 * Envuelve a sus hijos y los hace aparecer al llegar a ellos con el scroll
 * (Motion). Solo anima una vez. Con "reducir movimiento", MotionConfig (App)
 * quita el desplazamiento y deja solo el fundido.
 *
 * Props:
 *  - delay: retardo en ms (para escalonar elementos de una lista).
 *  - desde: 'abajo' (por defecto) | 'izquierda' | 'derecha' | 'escala'.
 *  - as: etiqueta a renderizar (por defecto 'div').
 *  - className: clases extra.
 */
export default function RevealComponent({
  children,
  delay = 0,
  desde = 'abajo',
  as: Tag = 'div',
  className = '',
}) {
  const Componente = m[Tag]

  return (
    <Componente
      className={className}
      initial={OCULTO[desde]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.85, delay: delay / 1000, ease: EASE_SUAVE }}
    >
      {children}
    </Componente>
  )
}
