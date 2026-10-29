import { m } from 'motion/react'
import { Ban } from 'lucide-react'
import { inicioSemana, mismoDia, hora as fmtHora, fechaLarga } from '../../../utils/fechas'
import { aHora, sumarMin } from '../../../utils/disponibilidad'
import { EASE_SUAVE } from '../../../theme/animacion'

const CABECERA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/**
 * Vista MES: el mes entero de un vistazo, para ver si hay algo dentro de
 * tres semanas o qué días van más llenos. Cada día lleva una barrita que se
 * llena según lo ocupado que está su horario y, en pantallas grandes, las
 * primeras citas con nombre. Tocar un día lleva a ese día.
 */
export default function VistaMes({ mes, dia, ahora, citas, bloqueos, horario, onDia }) {
  const primero = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const inicio = inicioSemana(primero)
  const hueco = (primero.getDay() + 6) % 7
  const total = Math.ceil((hueco + diasMes) / 7) * 7
  const celdas = Array.from({ length: total }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return d
  })

  const activas = citas.filter((c) => c.estado !== 'cancelada')
  const delMes = activas.filter((c) => new Date(c.inicio).getMonth() === mes.getMonth())

  return (
    <div>
      <p className="mb-3 px-1 text-sm text-tinta/55">
        <span className="font-semibold text-tinta">{delMes.length}</span> {delMes.length === 1 ? 'cita' : 'citas'} este mes
      </p>

      <div className="overflow-hidden rounded-3xl border border-hueso-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-hueso-200 bg-hueso/50">
          {CABECERA.map((l) => (
            <p key={l} className="py-2 text-center text-[0.65rem] font-semibold uppercase tracking-widest text-tinta/45">
              {l}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {celdas.map((d, i) => {
            const fuera = d.getMonth() !== mes.getMonth()
            const finDia = sumarMin(d, 24 * 60)
            const suyas = activas
              .filter((c) => mismoDia(new Date(c.inicio), d))
              .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
            const tramos = horario.find((h) => h.dia === d.getDay())?.tramos ?? []
            const abierto = tramos.reduce((t, [a, b]) => t + (aHora(d, b) - aHora(d, a)) / 60000, 0)
            const ocupado = suyas.reduce((t, c) => t + (new Date(c.fin) - new Date(c.inicio)) / 60000, 0)
            const lleno = abierto ? Math.min(1, ocupado / abierto) : 0
            const cerradoTodo = bloqueos.some(
              (b) => new Date(b.inicio) <= aHora(d, tramos[0]?.[0] ?? '00:00') && new Date(b.fin) >= (tramos.length ? aHora(d, tramos.at(-1)[1]) : finDia)
            )
            const cerrado = !tramos.length || cerradoTodo
            const hoy = mismoDia(d, ahora)
            const elegido = mismoDia(d, dia)
            const pasado = finDia <= ahora

            return (
              <m.button
                key={d.toISOString()}
                type="button"
                onClick={() => onDia(d)}
                aria-label={`${fechaLarga(d)}: ${cerradoTodo ? 'cerrado' : `${suyas.length} citas`}`}
                aria-pressed={elegido}
                className={`group relative flex min-h-16 flex-col items-stretch gap-1 border-hueso-200 p-1.5 text-left transition-colors sm:min-h-20 sm:p-2 lg:min-h-28 ${
                  i % 7 !== 6 ? 'border-r' : ''
                } ${i < total - 7 ? 'border-b' : ''} ${
                  elegido ? 'bg-tinta text-hueso' : cerradoTodo ? 'bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgb(22_32_42/0.05)_6px,rgb(22_32_42/0.05)_12px)]' : 'hover:bg-acento/10'
                } ${fuera ? 'opacity-35' : cerrado && !suyas.length && !elegido ? 'opacity-50' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: Math.min(i, 34) * 0.008, ease: EASE_SUAVE }}
              >
                <span className="flex items-center justify-between gap-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums sm:h-7 sm:w-7 sm:text-base ${
                      hoy && !elegido ? 'bg-acento text-tinta' : ''
                    } ${pasado && !hoy && !elegido ? 'text-tinta/40' : ''}`}
                  >
                    {d.getDate()}
                  </span>
                  {suyas.length > 0 && (
                    <span className={`text-[0.65rem] font-semibold tabular-nums ${elegido ? 'text-acento' : 'text-acento-oscuro'}`}>
                      {suyas.length}
                    </span>
                  )}
                  {cerradoTodo && !suyas.length && <Ban size={12} className="text-tinta/35" />}
                </span>

                {/* Lo lleno que va el día */}
                {abierto > 0 && !cerradoTodo && (
                  <span className={`h-1 overflow-hidden rounded-full ${elegido ? 'bg-white/15' : 'bg-tinta/[0.06]'}`}>
                    <span
                      className={`block h-full rounded-full ${lleno >= 0.85 ? 'bg-red-400' : 'bg-acento'}`}
                      style={{ width: `${Math.max(lleno ? 8 : 0, lleno * 100)}%` }}
                    />
                  </span>
                )}

                {/* En pantalla grande, las primeras citas con nombre */}
                <span className="hidden min-w-0 flex-col gap-0.5 lg:flex">
                  {suyas.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className={`truncate rounded px-1 py-px text-[0.65rem] leading-tight ${
                        elegido ? 'bg-white/10' : c.estado === 'atendida' ? 'bg-green-100 text-green-800' : 'bg-acento/15'
                      }`}
                    >
                      <span className="tabular-nums">{fmtHora(new Date(c.inicio))}</span> {c.cliente_nombre.split(' ')[0]}
                    </span>
                  ))}
                  {suyas.length > 3 && (
                    <span className={`px-1 text-[0.65rem] ${elegido ? 'text-hueso/60' : 'text-tinta/45'}`}>+{suyas.length - 3} más</span>
                  )}
                </span>
              </m.button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 px-1 text-xs text-tinta/50">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-5 rounded-full bg-acento" /> Ocupación del día
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-5 rounded-full bg-red-400" /> Casi lleno
        </span>
        <span className="flex items-center gap-1.5">
          <Ban size={12} /> Día libre
        </span>
      </div>
    </div>
  )
}
