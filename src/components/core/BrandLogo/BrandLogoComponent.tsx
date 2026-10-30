// #region Imports
import type { FunctionComponent } from 'react'
import { NEGOCIO } from '../../../data/contact'
import type { IBrandLogoProps } from './IBrandLogoProps'
import { BrandLogoVariantEnum } from '../../../services/enums/BrandLogoVariantEnum'
// #endregion

// #region Constantes
// Generados con scripts/generar-logo-final.py a partir del logo definitivo.
const SOURCES = {
  // Emblema circular completo (fondo transparente).
  seal: '/logo-sello.webp',
  // Solo "A.S" con la navaja (apaisado, para fondo oscuro).
  monogram: '/logo-as.webp',
}
// #endregion

/**
 * Logo oficial de A.S. Dos versiones:
 *  - Seal: el emblema circular, para hero, footer y cabeceras.
 *  - Monogram: solo las letras con la navaja, para la barra de navegación.
 * El tamaño se controla por CSS (className, p. ej. "h-11 w-11" o "h-10 w-auto").
 */
const BrandLogoComponent: FunctionComponent<IBrandLogoProps> = ({ className = 'h-11 w-11', variant = BrandLogoVariantEnum.Seal, ...rest }) => {
  // #region Renderizado
  return (
    <img
      src={SOURCES[variant]}
      alt={NEGOCIO.nombreCompleto}
      draggable={false}
      className={`${className} object-contain select-none`}
      {...rest}
    />
  )
  // #endregion
}

export default BrandLogoComponent
