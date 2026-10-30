/** Foto que muestra el visor. */
export interface ILightboxPhoto {
  /** Dirección de la imagen. */
  src: string;
  /** Texto alternativo. */
  alt: string;
}

/** Propiedades de LightboxComponent. */
export interface ILightboxProps {
  /** Fotos que se pueden recorrer. */
  photos: ILightboxPhoto[];
  /** Índice de la foto mostrada (null = cerrado). */
  index: number | null;
  /** Se llama al cerrar (Esc, botón o toque fuera). */
  onClose: () => void;
  /** Se llama al pasar a la foto anterior. */
  onPrevious: () => void;
  /** Se llama al pasar a la foto siguiente. */
  onNext: () => void;
}
