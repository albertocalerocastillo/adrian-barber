import type { ReactNode } from 'react'

/** Propiedades de TiltCardComponent. */
export interface ITiltCardProps {
  /** Contenido de la tarjeta. */
  children: ReactNode;
  /** Inclinación máxima en grados (por defecto 3). */
  tilt?: number;
  /** Opacidad del brillo dorado que sigue al ratón, de 0 a 1 (por defecto 0,18). */
  glare?: number;
  /** Clases extra. */
  className?: string;
}
