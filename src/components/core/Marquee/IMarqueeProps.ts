import type { ReactNode } from 'react'

/** Propiedades de MarqueeComponent. */
export interface IMarqueeProps {
  /** Contenido de la cinta (se repite varias veces). */
  children: ReactNode;
  /** % del ancho de UNA copia que avanza por segundo (por defecto 3). */
  speed?: number;
  /** Clases extra de la cinta. */
  className?: string;
}
