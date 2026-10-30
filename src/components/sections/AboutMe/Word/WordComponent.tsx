// #region Imports
import type { FunctionComponent } from 'react'
import { m, useTransform } from 'motion/react'
import type { IWordProps } from './IWordProps'
// #endregion

// #region Constantes
// Opacidad de la palabra apagada y encendida.
const OPACIDAD_PALABRA = [0.18, 1]
// #endregion

/** Palabra de la frase grande que se "enciende" según se baja. */
const WordComponent: FunctionComponent<IWordProps> = ({ texto, progreso, rango }) => {
  // #region Declaraciones, variables y hooks
  const opacity = useTransform(progreso, rango, OPACIDAD_PALABRA)
  // #endregion

  // #region Renderizado
  return (
    <m.span style={{ opacity }} className="motion-reduce:opacity-100!">
      {texto}{' '}
    </m.span>
  )
  // #endregion
}

export default WordComponent
