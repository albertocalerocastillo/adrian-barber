import RevealComponent from '../Reveal/RevealComponent'

/**
 * Encabezado de sección reutilizable: kicker en mayúsculas + título display.
 * Mantiene la jerarquía tipográfica coherente en toda la web.
 *
 * Props:
 *  - kicker: texto pequeño en mayúsculas espaciadas (sobre el título).
 *  - titulo: título principal.
 *  - claro: true para texto claro (sobre fondos oscuros).
 *  - centrado: centra el bloque (por defecto true).
 */
export default function SectionHeadingComponent({
  kicker,
  titulo,
  claro = false,
  centrado = true,
}) {
  const colorTitulo = claro ? 'text-hueso' : 'text-tinta'

  return (
    <RevealComponent className={centrado ? 'text-center' : ''}>
      {kicker && (
        <p className="mb-3 text-xs tracking-kicker text-acento">{kicker}</p>
      )}
      <h2 className={`font-display text-3xl font-bold sm:text-4xl md:text-5xl ${colorTitulo}`}>
        {titulo}
      </h2>
      <span
        className={`mt-5 block h-px w-16 bg-acento ${centrado ? 'mx-auto' : ''}`}
      />
    </RevealComponent>
  )
}
