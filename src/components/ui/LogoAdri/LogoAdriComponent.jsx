// #region Imports
import { NEGOCIO } from '../../../data/contacto'
// #endregion

// Generados con scripts/generar-logo-final.py a partir del logo definitivo.
const FUENTES = {
  // Emblema circular completo (fondo transparente).
  sello: '/logo-sello.webp',
  // Solo "A.S" con la navaja (apaisado, para fondo oscuro).
  monograma: '/logo-as.webp',
}

/**
 * Logo oficial de A.S. Dos versiones:
 *  - 'sello': el emblema circular, para hero, footer y cabeceras.
 *  - 'monograma': solo las letras con la navaja, para la barra de navegación.
 * El tamaño se controla por CSS (className, p. ej. "h-11 w-11" o "h-10 w-auto").
 */
const LogoAdriComponent = ({ className = 'h-11 w-11', variante = 'sello', ...resto }) => {
  // #region Renderizado
  return (
    <img
      src={FUENTES[variante]}
      alt={NEGOCIO.nombreCompleto}
      draggable={false}
      className={`${className} object-contain select-none`}
      {...resto}
    />
  )
  // #endregion
}

export default LogoAdriComponent
