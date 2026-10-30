import type { ReactNode } from 'react'

/** Propiedades de SheetComponent. */
export interface ISheetProps {
  /** Título de la ventana (también su nombre accesible). */
  title: string;
  /** Línea de ayuda debajo del título. */
  subtitle?: string;
  /** Se llama al cerrar (X, tocar fuera o Esc). */
  onClose: () => void;
  /** Botones de abajo, siempre a la vista. */
  footer?: ReactNode;
  /** Contenido de la ventana. */
  children: ReactNode;
}
