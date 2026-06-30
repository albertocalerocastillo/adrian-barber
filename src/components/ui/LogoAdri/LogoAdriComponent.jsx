import { NEGOCIO } from '../../../data/contacto'

/**
 * Logo oficial de A.S (emblema dorado sobre pizarra) — public/logo-adri.jpg.
 * Es una imagen cuadrada con su propio fondo, así que se muestra con esquinas
 * redondeadas. El tamaño se controla por CSS (className, p. ej. "h-11 w-11").
 */
export default function LogoAdriComponent({ className = 'h-11 w-11', redondeado = 'rounded-lg' }) {
  return (
    <img
      src="/logo-adri.jpg"
      alt={NEGOCIO.nombreCompleto}
      className={`${className} ${redondeado} object-cover select-none`}
    />
  )
}
