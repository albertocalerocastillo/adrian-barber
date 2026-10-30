// #region Imports
import type { FunctionComponent } from 'react'
import { m } from 'motion/react'
import { Check, Hourglass, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EASE_SMOOTH } from '../../../../../theme/animation'
import { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'
import { formatoEuros } from '../agendaUtils'
import type { ISummaryProps } from './ISummaryProps'
// #endregion

// #region Constantes
// Retraso de la animación de entrada entre una tarjeta y la siguiente, en segundos.
const RETRASO_TARJETA_S = 0.06
// #endregion

/** Una tarjeta del resumen. */
interface TarjetaResumen {
  /** Icono de la esquina. */
  Icono: LucideIcon;
  /** Rótulo de la tarjeta. */
  etiqueta: string;
  /** Cifra que se muestra. */
  valor: number | string;
  /** Si se pasa (0 a 1), barra de progreso debajo. */
  progreso?: number;
  /** Tarjeta oscura (la de la caja). */
  oscuro?: boolean;
}

/** Resumen del día: citas, atendidas, pendientes y caja prevista. */
const SummaryComponent: FunctionComponent<ISummaryProps> = ({ citas, precios }) => {
  // #region Declaraciones, variables y hooks
  const activas = citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada)
  const atendidas = activas.filter((c) => c.estado === EstadoCitaEnum.Atendida).length
  const pendientes = activas.length - atendidas
  const caja = activas.reduce((t, c) => t + (precios.get(c.servicioNombre) ?? 0), 0)
  const hecho = activas.length ? atendidas / activas.length : 0

  const tarjetas: TarjetaResumen[] = [
    { Icono: Users, etiqueta: 'Citas', valor: activas.length },
    { Icono: Check, etiqueta: 'Atendidas', valor: atendidas, progreso: hecho },
    { Icono: Hourglass, etiqueta: 'Pendientes', valor: pendientes },
    { Icono: Wallet, etiqueta: 'Caja prevista', valor: `${formatoEuros(caja)} €`, oscuro: true },
  ]
  // #endregion

  // #region Renderizado
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tarjetas.map((t, i) => (
        <m.div
          key={t.etiqueta}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${
            t.oscuro ? 'grain bg-tinta text-hueso' : 'border border-hueso-200 bg-white'
          }`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * RETRASO_TARJETA_S, ease: EASE_SMOOTH }}
        >
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium ${t.oscuro ? 'text-hueso/60' : 'text-tinta/50'}`}>{t.etiqueta}</p>
            <t.Icono size={16} className={t.oscuro ? 'text-acento' : 'text-acento-oscuro'} />
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums sm:text-4xl">{t.valor}</p>
          {t.progreso !== undefined && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tinta/5">
              <m.div
                className="h-full origin-left rounded-full bg-green-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: t.progreso }}
                transition={{ duration: 0.8, ease: EASE_SMOOTH }}
              />
            </div>
          )}
        </m.div>
      ))}
    </div>
  )
  // #endregion
}

export default SummaryComponent
