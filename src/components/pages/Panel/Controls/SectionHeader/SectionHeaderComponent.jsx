/** Título de cada pantalla con su línea de ayuda y, a la derecha, acciones. */
const SectionHeaderComponent = ({ kicker, titulo, ayuda, children }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {kicker && <p className="mb-1.5 text-xs tracking-kicker text-acento-oscuro">{kicker}</p>}
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{titulo}</h1>
        {ayuda && <p className="mt-2 max-w-xl text-sm leading-relaxed text-tinta/55 sm:text-base">{ayuda}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  )
}

export default SectionHeaderComponent
