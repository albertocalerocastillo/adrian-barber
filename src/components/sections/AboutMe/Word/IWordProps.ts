import type { MotionValue } from 'motion/react'

/** Propiedades de WordComponent. */
export interface IWordProps {
  /** Palabra que se muestra. */
  texto: string;
  /** Progreso del scroll de la frase, de 0 a 1. */
  progreso: MotionValue<number>;
  /** Tramo del progreso [inicio, fin] en el que la palabra se enciende. */
  rango: [number, number];
}
