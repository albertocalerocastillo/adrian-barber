import { useState } from 'react'
import { NEGOCIO } from '../../../data/contacto'

/**
 * Logotipo de A.S Barbería.
 *
 * Usa el LOGO ORIGINAL de Adrián si existe el archivo `public/logo.png`
 * (idealmente PNG con fondo transparente y trazo blanco, para que luzca sobre
 * los fondos oscuros del nav/hero/footer). Si el archivo no está, cae a una
 * versión tipográfica fiel al estilo manuscrito, para que la web nunca se vea
 * coja.
 *
 * Props:
 *  - claro: true para texto claro (sobre fondos oscuros). Solo afecta al fallback.
 *  - conClaim: muestra el subtítulo "Peluquería y barbería" (solo en fallback).
 *  - alto: altura del logo en px cuando se usa la imagen (por defecto 44).
 */
export default function LogoComponent({ claro = false, conClaim = true, alto = 44 }) {
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

  // ── Fallback tipográfico ──
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
