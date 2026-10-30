// #region Imports
import { useState, useEffect, useRef } from 'react'
import { m } from 'motion/react'
import { Search, Loader2, Phone, ChevronRight, UserRound } from 'lucide-react'
import Hoja from './Hoja'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import { claseInput } from './Controles'
import { hora as fmtHora, fechaCorta } from '../../../utils/fechas'
import { buscarCitas } from '../../../lib/panel'
import { EASE_SUAVE } from '../../../theme/animacion'
import { EstadoCitaEnum } from '../../../enums/EstadoCitaEnum'
// #endregion

const ESTADOS = {
  [EstadoCitaEnum.Pendiente]: { texto: 'Pendiente', clase: 'bg-acento/15 text-acento-oscuro' },
  [EstadoCitaEnum.Atendida]: { texto: 'Atendido', clase: 'bg-green-100 text-green-700' },
  [EstadoCitaEnum.Cancelada]: { texto: 'Cancelada', clase: 'bg-tinta/5 text-tinta/40 line-through' },
}

/**
 * Buscar a un cliente por nombre o móvil ("¿cuándo tenía yo cita?"). Salen
 * sus próximas citas y las últimas, agrupadas por cliente (mismo móvil, o
 * mismo nombre si no dejó móvil). Tocar una cita lleva a ese día.
 *
 * Props: onClose, onIrA(fecha).
 */
const BuscarClienteModal = ({ onClose, onIrA }) => {
  // #region Declaraciones, variables y hooks
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState({ para: '', citas: [] })
  const campo = useRef(null)

  useEffect(() => {
    // Un poco de retraso: que el teclado del móvil suba con la hoja ya abierta.
    const id = setTimeout(() => campo.current?.focus(), 350)
    return () => clearTimeout(id)
  }, [])

  // Busca al dejar de escribir (no en cada letra).
  const buscado = texto.trim()
  useEffect(() => {
    if (buscado.length < 2) return
    let vivo = true
    const id = setTimeout(async () => {
      const citas = await buscarCitas(buscado)
      if (vivo) setResultado({ para: buscado, citas })
    }, 300)
    return () => {
      vivo = false
      clearTimeout(id)
    }
  }, [buscado])

  const corto = buscado.length < 2
  const cargando = !corto && resultado.para !== buscado
  const clientes = corto || cargando ? [] : agrupar(resultado.citas)
  const ahora = new Date()
  // #endregion

  // #region Renderizado
  return (
    <Hoja titulo="Buscar cliente" subtitulo="Por nombre o por móvil." onCerrar={onClose}>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta/35" />
        <input
          ref={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Ej.: Manuel o 600 111 222"
          aria-label="Nombre o móvil del cliente"
          className={`${claseInput} pl-11`}
        />
        {cargando && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-tinta/35" />}
      </div>

      <div className="mt-6 space-y-5">
        {corto && (
          <p className="flex flex-col items-center gap-3 py-8 text-center text-sm text-tinta/45">
            <UserRound size={28} className="text-tinta/25" />
            Escribe al menos dos letras o números.
          </p>
        )}
        {!corto && !cargando && clientes.length === 0 && (
          <p className="py-8 text-center text-sm text-tinta/50">No hay ningún cliente con «{buscado}».</p>
        )}

        {clientes.map((cl, i) => {
          const proximas = cl.citas.filter((c) => new Date(c.inicio) >= ahora && c.estado !== EstadoCitaEnum.Cancelada).reverse()
          const pasadas = cl.citas.filter((c) => !proximas.includes(c))
          const visitas = cl.citas.filter((c) => c.estado === EstadoCitaEnum.Atendida).length
          const movil = cl.movil
          return (
            <m.section
              key={cl.clave}
              className="rounded-3xl border border-hueso-200 bg-white p-4 shadow-sm sm:p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i, 5) * 0.05, ease: EASE_SUAVE }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tinta font-display text-lg font-bold text-acento">
                  {cl.nombre.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-bold">{cl.nombre}</p>
                  <p className="text-xs text-tinta/50">
                    {movil ? `${movil.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')} · ` : ''}
                    {visitas === 1 ? '1 visita' : `${visitas} visitas`}
                  </p>
                </div>
                {movil && (
                  <div className="flex shrink-0 gap-1.5">
                    <a
                      href={`tel:${movil}`}
                      aria-label={`Llamar a ${cl.nombre}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 text-tinta/70 transition-colors hover:border-acento hover:text-acento-oscuro"
                    >
                      <Phone size={16} />
                    </a>
                    <a
                      href={`https://wa.me/34${movil}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp a ${cl.nombre}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 text-[#128C4B] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
                    >
                      <WhatsAppIcon size={16} />
                    </a>
                  </div>
                )}
              </div>

              {proximas.length > 0 && <Lista titulo="Próximas" citas={proximas} onIrA={onIrA} destacar />}
              {pasadas.length > 0 && <Lista titulo="Anteriores" citas={pasadas.slice(0, 5)} onIrA={onIrA} />}
            </m.section>
          )
        })}
      </div>
    </Hoja>
  )
  // #endregion
}

const Lista = ({ titulo, citas, onIrA, destacar = false }) => {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-tinta/40">{titulo}</p>
      <ul className="space-y-1.5">
        {citas.map((c) => {
          const ini = new Date(c.inicio)
          const { diaSemana, dia, mes } = fechaCorta(ini)
          const estado = ESTADOS[c.estado] ?? ESTADOS[EstadoCitaEnum.Pendiente]
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onIrA(ini)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                  destacar ? 'bg-acento/10 hover:bg-acento/20' : 'bg-hueso/60 hover:bg-hueso'
                }`}
              >
                <span className="w-12 shrink-0 text-center leading-none">
                  <span className="block text-[0.6rem] font-semibold uppercase tracking-wider text-tinta/45">{diaSemana}</span>
                  <span className="font-display text-lg font-bold">{dia}</span>
                  <span className="block text-[0.6rem] text-tinta/45">
                    {mes}
                    {ini.getFullYear() !== new Date().getFullYear() && ` ${String(ini.getFullYear()).slice(2)}`}
                  </span>
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block font-semibold tabular-nums">{fmtHora(ini)}</span>
                  <span className="block truncate text-tinta/55">{c.servicio_nombre}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${estado.clase}`}>{estado.texto}</span>
                <ChevronRight size={16} className="shrink-0 text-tinta/25 transition-transform group-hover:translate-x-0.5" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Junta las citas de una misma persona: por móvil, o por nombre si no hay móvil. */
const agrupar = (citas) => {
  const grupos = new Map()
  for (const c of citas) {
    const movil = (c.cliente_movil || '').replace(/\D/g, '')
    const clave = movil || `n:${c.cliente_nombre.trim().toLowerCase()}`
    if (!grupos.has(clave)) grupos.set(clave, { clave, nombre: c.cliente_nombre.trim(), movil, citas: [] })
    grupos.get(clave).citas.push(c)
  }
  // Las citas llegan de la más nueva a la más vieja: el orden de los grupos
  // pone primero a quien tiene la cita más reciente.
  return [...grupos.values()]
}

export default BuscarClienteModal
