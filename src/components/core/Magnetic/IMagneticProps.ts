import type { ReactNode } from 'react'

/** Propiedades de MagneticComponent. */
export interface IMagneticProps {
  /** Contenido que se mueve hacia el ratón. */
  children: ReactNode;
  /** Desplazamiento máximo en px (por defecto 6). */
  maxOffset?: number;
  /** Clases extra. */
  className?: string;
}
