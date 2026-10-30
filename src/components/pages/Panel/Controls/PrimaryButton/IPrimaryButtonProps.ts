import type { ButtonHTMLAttributes } from 'react'

/** Propiedades de PrimaryButtonComponent (más las de cualquier <button>). */
export interface IPrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Muestra el spinner y desactiva el botón mientras se guarda. */
  loading?: boolean;
}
