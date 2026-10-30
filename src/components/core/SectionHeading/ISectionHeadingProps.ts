import type { ReactNode } from 'react'

/** Propiedades de SectionHeadingComponent. */
export interface ISectionHeadingProps {
  /** Texto pequeño en mayúsculas espaciadas, sobre el título. */
  kicker?: string;
  /** Título principal. */
  title: ReactNode;
  /** Entradilla opcional bajo el filete. */
  text?: ReactNode;
  /** True para texto claro (sobre fondos oscuros). */
  light?: boolean;
  /** Centra el bloque (por defecto true). */
  centered?: boolean;
}
