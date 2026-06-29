import { useState } from 'react'
import { NEGOCIO } from '../../../data/contacto'

/**
 * Logotipo de A.S Barbería — usa el LOGO ORIGINAL de Adrián, recortado y sin
 * fondo (generado con scripts/procesar-logo.py a partir de public/logo.jpg):
 *
 *  - claro=true  -> public/logo-blanco.png  (trazo blanco, para fondos oscuros)
 *  - claro=false -> public/logo-negro.png   (trazo tinta, para fondos claros)
 *
 * Si esos PNG no estuvieran, cae a una recreación tipográfica caligráfica para
 * que la web nunca se vea coja.
 *
 * Props:
 *  - claro: true sobre fondos oscuros (nav/hero/footer).
 *  - conClaim: muestra el subtítulo en el fallback tipográfico.
 *  - alto: altura del logo en px (por defecto 46).
 */
export default function LogoComponent({ claro = false, conClaim = true, alto = 46 }) {
  const [hayImagen, setHayImagen] = useState(true)
  // Monograma A.S compacto (legible en la barra de navegación).
  const src = claro ? '/logo-as-blanco.png' : '/logo-as-negro.png'

  if (hayImagen) {
    return (
      <img
        src={src}
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
