import type { ReactNode } from 'react'
import type { RevealFromEnum } from '../../../services/enums/RevealFromEnum'

/** Propiedades de RevealComponent. */
export interface IRevealProps {
  /** Contenido que aparece. */
  children: ReactNode;
  /** Retardo en ms (para escalonar elementos de una lista). */
  delay?: number;
  /** Desde dónde entra (desde abajo por defecto). */
  from?: RevealFromEnum;
  /** Etiqueta a renderizar (por defecto 'div'). */
  as?: 'div' | 'li' | 'span' | 'section' | 'article';
  /** Clases extra. */
  className?: string;
}
