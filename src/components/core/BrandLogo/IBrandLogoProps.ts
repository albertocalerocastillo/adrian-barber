import type { ImgHTMLAttributes } from 'react'
import type { BrandLogoVariantEnum } from '../../../services/enums/BrandLogoVariantEnum'

/** Propiedades de BrandLogoComponent (más cualquier atributo de <img>, p. ej. loading). */
export interface IBrandLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** Clases de tamaño (p. ej. "h-11 w-11" o "h-10 w-auto"). */
  className?: string;
  /** Versión del logo: el emblema circular o solo las letras con la navaja. */
  variant?: BrandLogoVariantEnum;
}
