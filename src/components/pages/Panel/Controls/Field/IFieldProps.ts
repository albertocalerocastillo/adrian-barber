import type { ReactNode } from 'react'

/** Propiedades de FieldComponent. */
export interface IFieldProps {
  /** Texto de la etiqueta, encima del campo. */
  label: string;
  /** Ayuda en letra pequeña, debajo del campo. */
  help?: string;
  /** El campo en sí. */
  children: ReactNode;
}
