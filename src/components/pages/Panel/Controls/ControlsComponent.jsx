// #region Imports
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'motion/react'
import { Loader2, Minus, Plus, Save, RotateCcw } from 'lucide-react'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { startOfDay, toInputDate } from '../../../../utils/dates'
// #endregion

/*
 * Piezas pequeñas que comparten las pantallas del panel, para que todo se
 * vea y se toque igual en todas partes.
 */

/** Interruptor sí/no (más claro con el dedo que una casilla). */
export const SwitchComponent = ({ activo, onCambio, etiqueta }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onCambio(!activo)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
        activo ? 'bg-acento' : 'bg-tinta/15'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-suave)] ${
          activo ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

/** Número con botones − / + (duración, precio). Grande para el dedo. */
export const StepperComponent = ({ valor, onCambio, paso = 1, min = 0, sufijo, etiqueta }) => {
  const fijar = (v) => onCambio(Math.max(min, Math.round(v * 100) / 100))
  return (
    <div className="flex items-center rounded-xl border border-hueso-200 bg-white">
      <button
        type="button"
        onClick={() => fijar(valor - paso)}
        aria-label={`Menos ${etiqueta}`}
        className="flex h-11 w-10 shrink-0 items-center justify-center text-tinta/60 transition-colors hover:text-acento-oscuro active:scale-90"
      >
        <Minus size={16} />
      </button>
      <label className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
        <span className="sr-only">{etiqueta}</span>
        <input
          type="number"
          inputMode="decimal"
          value={valor}
          min={min}
          step={paso}
          onChange={(e) => fijar(Number(e.target.value))}
          className="w-12 min-w-0 bg-transparent text-center font-display text-lg font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {sufijo && <span className="text-sm text-tinta/45">{sufijo}</span>}
      </label>
      <button
        type="button"
        onClick={() => fijar(valor + paso)}
        aria-label={`Más ${etiqueta}`}
        className="flex h-11 w-10 shrink-0 items-center justify-center text-tinta/60 transition-colors hover:text-acento-oscuro active:scale-90"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

/** Fila de opciones donde se elige una (Día / Semana, Todo el día / Unas horas). */
export const SegmentedControlComponent = ({ opciones, valor, onCambio, oscuro = false }) => {
  return (
    <div className={`inline-flex rounded-full p-1 ${oscuro ? 'bg-white/10' : 'bg-tinta/5'}`}>
      {opciones.map((o) => {
        const activa = o.valor === valor
        return (
          <button
            key={String(o.valor)}
            type="button"
            onClick={() => onCambio(o.valor)}
            aria-pressed={activa}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activa
                ? 'bg-tinta text-hueso shadow-md'
                : oscuro
                  ? 'text-hueso/60 hover:text-hueso'
                  : 'text-tinta/55 hover:text-tinta'
            }`}
          >
            {o.texto}
          </button>
        )
      })}
    </div>
  )
}

/** Etiqueta + campo, con el mismo aspecto en todos los formularios. */
export const FieldComponent = ({ etiqueta, ayuda, children }) => {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-tinta/50">{etiqueta}</p>
      {children}
      {ayuda && <p className="mt-1.5 text-xs text-tinta/45">{ayuda}</p>}
    </div>
  )
}

export const INPUT_CLASS_NAME =
  'w-full rounded-xl border border-hueso-200 bg-white px-4 py-3 text-base text-tinta outline-none transition-colors placeholder:text-tinta/30 focus:border-acento focus:ring-4 focus:ring-acento/15'

/** Botón principal dorado (guardar, entrar). */
export const PrimaryButtonComponent = ({ children, cargando, className = '', ...resto }) => {
  return (
    <button
      {...resto}
      disabled={cargando || resto.disabled}
      className={`flex items-center justify-center gap-2 rounded-full bg-acento px-6 py-3.5 font-semibold text-tinta shadow-lg shadow-acento/25 transition-all duration-300 hover:bg-acento-claro active:scale-[0.98] disabled:opacity-60 ${className}`}
    >
      {cargando && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
}

/**
 * Barra de "Guardar cambios" que solo aparece cuando hay algo sin guardar,
 * para que no se olvide (y no estorbe cuando no hace falta). En un portal,
 * como la Hoja, para quedar por encima de todo.
 */
export const SaveBarComponent = ({ visible, guardando, onGuardar, onDescartar, texto = 'Tienes cambios sin guardar' }) => {
  return createPortal(
    <AnimatePresence>
      {visible && (
        <m.div
          className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6 lg:left-64"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        >
          <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl bg-tinta p-2 pl-4 text-hueso shadow-2xl shadow-black/30 ring-1 ring-acento/25 sm:gap-3">
            <span className="hidden min-w-0 flex-1 truncate text-sm text-hueso/75 sm:block">{texto}</span>
            <button
              type="button"
              onClick={onDescartar}
              disabled={guardando}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-sm font-medium text-hueso/70 transition-colors hover:bg-white/10 hover:text-hueso sm:flex-none"
            >
              <RotateCcw size={15} /> Descartar
            </button>
            <PrimaryButtonComponent onClick={onGuardar} cargando={guardando} className="flex-1 !rounded-xl !py-3 text-sm sm:flex-none">
              {!guardando && <Save size={16} />} Guardar
            </PrimaryButtonComponent>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/** Título de cada pantalla con su línea de ayuda y, a la derecha, acciones. */
export const SectionHeaderComponent = ({ kicker, titulo, ayuda, children }) => {
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

/** Estado de "cargando" con esqueletos, mejor que un simple spinner. */
export const SkeletonComponent = ({ filas = 3, alto = 'h-24' }) => {
  return (
    <div className="space-y-3" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className={`${alto} animate-pulse rounded-2xl bg-tinta/[0.06]`} style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  )
}

/** Atajos de fecha (Hoy, Mañana, Pasado) para no tener que abrir el calendario. */
export const DateShortcutsComponent = ({ valor, onCambio }) => {
  const hoy = startOfDay(new Date())
  const atajos = ['Hoy', 'Mañana', 'Pasado'].map((texto, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    return { texto, valor: toInputDate(d) }
  })
  return (
    <div className="flex flex-wrap gap-2">
      {atajos.map((a) => (
        <button
          key={a.texto}
          type="button"
          onClick={() => onCambio(a.valor)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            valor === a.valor ? 'bg-tinta text-hueso' : 'bg-white text-tinta/70 ring-1 ring-hueso-200 hover:ring-tinta/30'
          }`}
        >
          {a.texto}
        </button>
      ))}
      <input
        type="date"
        value={valor}
        onChange={(e) => e.target.value && onCambio(e.target.value)}
        aria-label="Otra fecha"
        className="w-full rounded-full sm:w-auto sm:min-w-0 sm:flex-1 bg-white px-4 py-2 text-sm text-tinta ring-1 ring-hueso-200 outline-none focus:ring-acento"
      />
    </div>
  )
}
