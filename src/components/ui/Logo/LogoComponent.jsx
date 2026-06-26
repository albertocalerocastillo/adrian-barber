import { NEGOCIO } from '../../../data/contacto'

/**
 * Logotipo de A.S Barbería.
 *
 * Versión TIPOGRÁFICA (Fase 1), fiel al estilo manuscrito blanco y negro del
 * logo real. Cuando Adrián facilite el PNG/SVG definitivo, basta con soltarlo
 * en /public/logo.png y sustituir el bloque de texto por una <img>.
 *
 * Props:
 *  - claro: true para texto claro (sobre fondos oscuros / hero).
 *  - conClaim: muestra el subtítulo "Peluquería y barbería".
 */
export default function LogoComponent({ claro = false, conClaim = true }) {
  const colorPrincipal = claro ? 'text-hueso' : 'text-tinta'
  const colorClaim = claro ? 'text-hueso/70' : 'text-tinta/60'

  return (
    <span className="flex flex-col leading-none select-none">
      <span className={`font-display text-2xl font-bold tracking-tight ${colorPrincipal}`}>
        A<span className="text-acento">.</span>S
      </span>
      {conClaim && (
        <span className={`mt-0.5 text-[0.6rem] tracking-kicker ${colorClaim}`}>
          {NEGOCIO.claim}
        </span>
      )}
    </span>
  )
}
