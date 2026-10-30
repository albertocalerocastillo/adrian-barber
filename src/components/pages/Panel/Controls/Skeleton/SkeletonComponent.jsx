/** Estado de "cargando" con esqueletos, mejor que un simple spinner. */
const SkeletonComponent = ({ filas = 3, alto = 'h-24' }) => {
  return (
    <div className="space-y-3" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className={`${alto} animate-pulse rounded-2xl bg-tinta/[0.06]`} style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  )
}

export default SkeletonComponent
