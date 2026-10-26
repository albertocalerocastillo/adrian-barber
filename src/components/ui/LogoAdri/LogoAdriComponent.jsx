import { NEGOCIO } from '../../../data/contacto'

// Generados con scripts/generar-logo-final.py a partir del logo definitivo.
const FUENTES = {
  sello: '/logo-sello.webp', // emblema circular completo (fondo transparente)
  monograma: '/logo-as.webp', // solo "A.S" con la navaja (apaisado, para fondo oscuro)
}

/**
 * Logo oficial de A.S. Dos versiones:
 *  - 'sello': el emblema circular, para hero, footer y cabeceras.
 *  - 'monograma': solo las letras con la navaja, para la barra de navegación.
 * El tamaño se controla por CSS (className, p. ej. "h-11 w-11" o "h-10 w-auto").
 */
export default function LogoAdriComponent({ className = 'h-11 w-11', variante = 'sello', ...resto }) {
  return (
    <img
      src={FUENTES[variante]}
      alt={NEGOCIO.nombreCompleto}
      draggable={false}
      className={`${className} object-contain select-none`}
      {...resto}
    />
  )
}
