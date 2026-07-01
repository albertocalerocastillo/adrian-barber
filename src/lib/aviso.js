// ════════════════════════════════════════════════════════════
//  Aviso de cita nueva por WhatsApp (vía CallMeBot, servicio gratuito).
//  Si están configuradas las variables VITE_CALLMEBOT_PHONE y
//  VITE_CALLMEBOT_APIKEY, al reservar por la web se manda un WhatsApp
//  automático al barbero (o al número de prueba). Si no, no hace nada.
//
//  Nota: es "fire-and-forget" (no bloquea la confirmación) y usa mode:no-cors
//  porque CallMeBot no expone CORS; el mensaje se envía igualmente.
// ════════════════════════════════════════════════════════════
import { fechaLarga, hora } from '../utils/fechas'

export function avisarNuevaCita({ servicioNombre, clienteNombre, clienteMovil, inicio }) {
  const phone = import.meta.env.VITE_CALLMEBOT_PHONE
  const apikey = import.meta.env.VITE_CALLMEBOT_APIKEY
  if (!phone || !apikey) return // aviso no configurado

  const cuando = `${fechaLarga(inicio)} a las ${hora(inicio)}`
  const texto =
    `💈 Nueva cita A.S\n` +
    `${servicioNombre}\n` +
    `${cuando}\n` +
    `${clienteNombre}${clienteMovil ? ' · ' + clienteMovil : ''}`

  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(texto)}`

  // No esperamos la respuesta: si falla, la cita ya está guardada igualmente.
  fetch(url, { mode: 'no-cors' }).catch(() => {})
}
