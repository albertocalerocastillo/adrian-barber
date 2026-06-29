import { Link } from 'react-router-dom'
import { CheckCircle2, Home } from 'lucide-react'
import WhatsAppIcon from '../../ui/WhatsAppIcon/WhatsAppIcon'
import { sumarMin } from '../../../utils/disponibilidad'
import { fechaLarga, hora as fmtHora } from '../../../utils/fechas'
import { WHATSAPP } from '../../../data/contacto'

/**
 * Pantalla de confirmación: cita guardada correctamente.
 * Ofrece avisar también por WhatsApp (opcional) y volver al inicio.
 */
export default function Confirmacion({ servicio, hora }) {
  const fin = sumarMin(hora, servicio.duracion)

  const mensaje =
    `¡Hola Adrián! Acabo de reservar una cita:%0A` +
    `• ${servicio.nombre}%0A` +
    `• ${fechaLarga(hora)}%0A` +
    `• ${fmtHora(hora)} h`
  const wa = `https://wa.me/${WHATSAPP}?text=${mensaje}`

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 size={44} className="text-green-600" />
      </div>

      <h1 className="font-display text-3xl font-bold">¡Cita confirmada!</h1>
      <p className="mt-2 text-tinta/60">Te esperamos. Si no puedes venir, avísanos y la liberamos.</p>

      {/* Resumen */}
      <div className="mt-7 rounded-2xl border border-hueso-200 bg-white p-6 text-left">
        <p className="font-display text-xl font-semibold capitalize">{fechaLarga(hora)}</p>
        <p className="text-tinta/80">
          {fmtHora(hora)} – {fmtHora(fin)} h
        </p>
        <span className="my-4 block h-px bg-hueso-200" />
        <p className="flex items-center justify-between">
          <span className="text-tinta/60">{servicio.nombre}</span>
          <span className="font-display text-lg font-bold">{servicio.precio} €</span>
        </p>
      </div>

      {/* Acciones */}
      <div className="mt-7 flex flex-col gap-3">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] py-3.5 font-medium text-white transition-colors hover:bg-[#1ebe5b]"
        >
          <WhatsAppIcon size={18} />
          Avisar por WhatsApp
        </a>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 rounded-full border border-hueso-200 py-3.5 font-medium text-tinta transition-colors hover:bg-white"
        >
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
