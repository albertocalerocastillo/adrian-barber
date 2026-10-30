import type { ReactNode } from 'react'

/** Propiedades de SectionHeaderComponent. */
export interface ISectionHeaderProps {
  /** Antetítulo pequeño, encima del título. */
  kicker?: string;
  /** Título de la pantalla. */
  title: string;
  /** Línea de ayuda debajo del título. */
  help?: string;
  /** Acciones que se muestran a la derecha. */
  children?: ReactNode;
}
