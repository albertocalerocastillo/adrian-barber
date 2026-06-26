import { useState } from 'react'
import { NEGOCIO } from '../../../data/contacto'

/**
 * Logotipo de A.S Barbería.
 *
 * Usa el LOGO ORIGINAL de Adrián si existe el archivo `public/logo.png`
 * (idealmente PNG con fondo transparente y trazo blanco). Si no está, cae a
 * una recreación TIPOGRÁFICA con fuente caligráfica (font-script), fiel al
 * estilo manuscrito del logo real, para que la web nunca se vea coja.
 *
 * Props:
 *  - claro: true para texto claro (sobre fondos oscuros). Solo afecta al fallback.
 *  - conClaim: muestra el subtítulo "Peluquería y barbería" (solo en fallback).
 *  - alto: altura del logo en px cuando se usa la imagen (por defecto 46).
 */
export default function LogoComponent({ claro = false, conClaim = true, alto = 46 }) {
  const [hayImagen, setHayImagen] = useState(true)

  if (hayImagen) {
    return (
      <img
        src="/logo.png"
        alt={NEGOCIO.nombreCompleto}
        style={{ height: alto }}
        className="w-auto select-none"
        onError={() => setHayImagen(false)}
      />
    )
  }

  // ── Fallback caligráfico (eco del logo manuscrito) ──
  const colorPrincipal = claro ? 'text-hueso' : 'text-tinta'
  const colorClaim = claro ? 'text-hueso/65' : 'text-tinta/55'

  return (
    <span className="flex flex-col items-start leading-none select-none">
      <span className={`font-script text-3xl leading-none ${colorPrincipal}`}>
        A<span className="text-acento">.</span>S
      </span>
      {conClaim && (
        <span className={`-mt-0.5 text-[0.95rem] leading-tight font-script ${colorClaim}`}>
          Peluquería y barbería
        </span>
      )}
    </span>
  )
}
