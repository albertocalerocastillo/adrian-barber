import { useId } from 'react'

/**
 * Emblema / sello de A.S Barbería (concepto "sello vintage").
 * Vectorial y escalable: doble anillo dorado, texto curvo, tijeras y el
 * monograma "A.S" MANUSCRITO REAL de Adrián incrustado en el centro
 * (public/logo-as-blanco.png, en blanco para fondos oscuros).
 *
 * Pensado para fondos OSCUROS (hero, footer). Para fondos claros habría que
 * generar una variante en tinta (logo-as-negro.png) — pendiente si hace falta.
 *
 * El tamaño se controla por CSS (className, p. ej. "w-72"); al tener viewBox
 * cuadrado, la altura se ajusta sola.
 *
 * Props:
 *  - className: clases de tamaño/posición (por defecto "w-48").
 */
export default function SelloComponent({ className = 'w-48' }) {
  const id = useId()
  const topId = `top-${id}`
  const botId = `bot-${id}`

  return (
    <svg viewBox="0 0 240 240" role="img" className={className}>
      <title>A.S Peluquería y Barbería — La Rinconada</title>
      <desc>Emblema circular con el monograma A.S manuscrito en el centro.</desc>

      {/* Anillos */}
      <circle cx="120" cy="120" r="110" fill="none" stroke="#b08d57" strokeWidth="2" />
      <circle cx="120" cy="120" r="96" fill="none" stroke="#b08d57" strokeWidth="1" opacity="0.5" />

      {/* Trazados para el texto curvo */}
      <path id={topId} d="M50 120 A70 70 0 0 1 190 120" fill="none" />
      <path id={botId} d="M54 132 A66 66 0 0 0 186 132" fill="none" />

      <text fontFamily="Georgia, serif" fontSize="12.5" letterSpacing="2.5" fill="#e9e5dc">
        <textPath href={`#${topId}`} startOffset="50%" textAnchor="middle">
          PELUQUERÍA · BARBERÍA
        </textPath>
      </text>
      <text fontFamily="Georgia, serif" fontSize="10.5" letterSpacing="2" fill="#b08d57">
        <textPath href={`#${botId}`} startOffset="50%" textAnchor="middle">
          LA RINCONADA · SEVILLA
        </textPath>
      </text>

      {/* Separadores laterales (rombos) */}
      <g fill="#b08d57">
        <path d="M62 120 l4 -4 4 4 -4 4 z" />
        <path d="M170 120 l4 -4 4 4 -4 4 z" />
      </g>

      {/* Monograma A.S manuscrito real (centrado) */}
      <image
        href="/logo-as-blanco.png"
        x="72"
        y="82"
        width="96"
        height="54"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Tijeras */}
      <g stroke="#b08d57" strokeWidth="2" fill="none">
        <circle cx="113" cy="170" r="4" />
        <circle cx="127" cy="170" r="4" />
        <line x1="116" y1="167" x2="133" y2="154" />
        <line x1="124" y1="167" x2="107" y2="154" />
      </g>
    </svg>
  )
}
