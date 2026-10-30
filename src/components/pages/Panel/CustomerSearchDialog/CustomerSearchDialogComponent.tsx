// #region Imports
import { useState, useEffect, useRef } from 'react'
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import { Search, Loader2, Phone, UserRound } from 'lucide-react'
import SheetComponent from '../Sheet/SheetComponent'
import AppointmentListComponent from './AppointmentList/AppointmentListComponent'
import WhatsAppIconComponent from '../../../core/WhatsAppIcon/WhatsAppIconComponent'
import { INPUT_CLASS_NAME } from '../Controls/controlClasses'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { wait } from '../../../../utils/wait'
import { EstadoCitaEnum } from '../../../../services/enums/EstadoCitaEnum'
import { AgendaService } from '../../../../services/AgendaService'
import type { CitaDTO } from '../../../../services/dtos/CitaDTO'
import type { ICustomerSearchDialogProps } from './ICustomerSearchDialogProps'
// #endregion

/** Resultado de la última búsqueda hecha. */
interface ResultadoBusqueda {
  /** Texto buscado. */
  para: string;
  /** Citas encontradas, de la más nueva a la más vieja. */
  citas: CitaDTO[];
}

/** Citas de una misma persona (mismo móvil, o mismo nombre si no dejó móvil). */
interface ClienteBuscado {
  /** Clave del grupo: el móvil, o el nombre si no hay móvil. */
  clave: string;
  /** Nombre del cliente. */
  nombre: string;
  /** Móvil, solo cifras (vacío si no dejó). */
  movil: string;
  /** Sus citas, de la más nueva a la más vieja. */
  citas: CitaDTO[];
}

// #region Constantes
// Letras o números mínimos para buscar.
const LONGITUD_MINIMA_BUSQUEDA = 2

// Retraso del foco: que el teclado del móvil suba con la hoja ya abierta.
const RETRASO_FOCO_MS = 350

// Se busca al dejar de escribir este rato (no en cada letra).
const RETRASO_BUSQUEDA_MS = 300

// Citas anteriores que se enseñan de cada cliente.
const MAXIMO_ANTERIORES = 5

// Clientes a partir de los cuales ya no se suma retraso a la animación.
const MAXIMO_CLIENTES_CON_RETRASO = 5

// Retraso de la animación de entrada entre un cliente y el siguiente, en segundos.
const RETRASO_CLIENTE_S = 0.05

// Todo lo que no sea una cifra.
const PATRON_NO_CIFRAS = /\D/g

// Móvil en grupos para leerlo ("600 11 22 33").
const PATRON_GRUPOS_MOVIL = /(\d{3})(\d{2})(\d{2})(\d{2})/
const FORMATO_GRUPOS_MOVIL = '$1 $2 $3 $4'

// Prefijo de las claves de los clientes sin móvil (para no mezclarlas con un móvil).
const PREFIJO_CLAVE_NOMBRE = 'n:'

// Enlace de WhatsApp con el prefijo de España.
const URL_WHATSAPP = 'https://wa.me/34'
// #endregion

/** Junta las citas de una misma persona: por móvil, o por nombre si no hay móvil. */
const agrupar = (citas: CitaDTO[]): ClienteBuscado[] => {
  const grupos = new Map<string, ClienteBuscado>()
  for (const c of citas) {
    const movil = (c.clienteMovil || '').replace(PATRON_NO_CIFRAS, '')
    const clave = movil || `${PREFIJO_CLAVE_NOMBRE}${c.clienteNombre.trim().toLowerCase()}`
    const grupo = grupos.get(clave)
    grupos.set(
      clave,
      grupo ? { ...grupo, citas: [...grupo.citas, c] } : { clave, nombre: c.clienteNombre.trim(), movil, citas: [c] }
    )
  }
  // Las citas llegan de la más nueva a la más vieja: el orden de los grupos
  // pone primero a quien tiene la cita más reciente.
  const result = [...grupos.values()]
  return result
}

/**
 * Buscar a un cliente por nombre o móvil ("¿cuándo tenía yo cita?"). Salen
 * sus próximas citas y las últimas, agrupadas por cliente (mismo móvil, o
 * mismo nombre si no dejó móvil). Tocar una cita lleva a ese día.
 */
const CustomerSearchDialogComponent: FunctionComponent<ICustomerSearchDialogProps> = ({ onClose, onIrA }) => {
  // #region Declaraciones, variables y hooks
  const [texto, setTexto] = useState<string>('')
  const [resultado, setResultado] = useState<ResultadoBusqueda>({ para: '', citas: [] })
  const campo = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // Un poco de retraso: que el teclado del móvil suba con la hoja ya abierta.
    const controlador = new AbortController()
    const enfocar = async () => {
      await wait(RETRASO_FOCO_MS, controlador.signal)
      if (!controlador.signal.aborted) campo.current?.focus()
    }
    enfocar()
    return () => controlador.abort()
  }, [])

  // Busca al dejar de escribir (no en cada letra).
  const buscado = texto.trim()
  useEffect(() => {
    if (buscado.length < LONGITUD_MINIMA_BUSQUEDA) return
    const controlador = new AbortController()
    const buscar = async () => {
      await wait(RETRASO_BUSQUEDA_MS, controlador.signal)
      if (controlador.signal.aborted) return
      const citas = await AgendaService.buscarCitas(buscado)
      if (!controlador.signal.aborted) setResultado({ para: buscado, citas })
    }
    buscar()
    return () => controlador.abort()
  }, [buscado])

  const corto = buscado.length < LONGITUD_MINIMA_BUSQUEDA
  const cargando = !corto && resultado.para !== buscado
  const clientes = corto || cargando ? [] : agrupar(resultado.citas)
  const ahora = new Date()
  // #endregion

  // #region Renderizado
  return (
    <SheetComponent title="Buscar cliente" subtitle="Por nombre o por móvil." onClose={onClose}>
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
          className={`${INPUT_CLASS_NAME} pl-11`}
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
              transition={{ duration: 0.35, delay: Math.min(i, MAXIMO_CLIENTES_CON_RETRASO) * RETRASO_CLIENTE_S, ease: EASE_SMOOTH }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tinta font-display text-lg font-bold text-acento">
                  {cl.nombre.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-bold">{cl.nombre}</p>
                  <p className="text-xs text-tinta/50">
                    {movil ? `${movil.replace(PATRON_GRUPOS_MOVIL, FORMATO_GRUPOS_MOVIL)} · ` : ''}
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
                      href={`${URL_WHATSAPP}${movil}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp a ${cl.nombre}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-hueso-200 text-[#128C4B] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
                    >
                      <WhatsAppIconComponent size={16} />
                    </a>
                  </div>
                )}
              </div>

              {proximas.length > 0 && <AppointmentListComponent titulo="Próximas" citas={proximas} onIrA={onIrA} destacar />}
              {pasadas.length > 0 && (
                <AppointmentListComponent titulo="Anteriores" citas={pasadas.slice(0, MAXIMO_ANTERIORES)} onIrA={onIrA} />
              )}
            </m.section>
          )
        })}
      </div>
    </SheetComponent>
  )
  // #endregion
}

export default CustomerSearchDialogComponent
