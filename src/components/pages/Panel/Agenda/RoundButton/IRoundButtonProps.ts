import type { ReactNode } from 'react'

/** Propiedades de RoundButtonComponent. */
export interface IRoundButtonProps {
  /** Se llama al pulsar el botón. */
  onClick: () => void;
  /** Texto para lectores de pantalla (el botón solo lleva un icono). */
  label: string;
  /** Icono del botón. */
  children: ReactNode;
}
