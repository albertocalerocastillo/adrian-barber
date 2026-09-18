// ════════════════════════════════════════════════════════════
//  Edge Function: aviso de cita nueva por WhatsApp (vía CallMeBot).
//
//  Por qué existe: antes se llamaba a CallMeBot desde el navegador con
//  VITE_CALLMEBOT_APIKEY, y Vite incrusta esas variables en el JS público
//  (cualquiera podía leer la apikey). Aquí la apikey vive como SECRETO del
//  servidor y nunca sale de Supabase.
//
//  Desplegar:
//    supabase functions deploy aviso-cita
//  Secretos (NO llevan prefijo VITE_):
//    supabase secrets set CALLMEBOT_PHONE=34XXXXXXXXX CALLMEBOT_APIKEY=xxxxx
//
//  El mensaje se compone AQUÍ a partir de campos sueltos: el cliente nunca
//  manda el texto entero, así no se puede usar para enviar lo que quiera.
// ════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const JSON_HEADERS = { ...CORS, 'Content-Type': 'application/json' }

function responder(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: JSON_HEADERS })
}

// Texto que viene del cliente: sin saltos de línea (romperían el mensaje) y
// con longitud acotada.
function limpiar(valor: unknown, maximo: number): string {
  if (typeof valor !== 'string') return ''
  return valor.replace(/\s+/g, ' ').trim().slice(0, maximo)
}

// Fecha legible en español y en hora de España.
function cuando(iso: unknown): string {
  if (typeof iso !== 'string') return ''
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(fecha)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return responder({ error: 'Método no permitido' }, 405)

  const phone = Deno.env.get('CALLMEBOT_PHONE')
  const apikey = Deno.env.get('CALLMEBOT_APIKEY')
  // Sin configurar no es un error: la cita ya se guardó, solo no se avisa.
  if (!phone || !apikey) return responder({ avisado: false, motivo: 'sin configurar' })

  let datos: Record<string, unknown>
  try {
    datos = await req.json()
  } catch {
    return responder({ error: 'JSON no válido' }, 400)
  }

  const servicio = limpiar(datos.servicioNombre, 60)
  const nombre = limpiar(datos.clienteNombre, 60)
  const movil = limpiar(datos.clienteMovil, 20)
  const fecha = cuando(datos.inicio)

  if (!nombre || !fecha) return responder({ error: 'Faltan datos de la cita' }, 400)

  const texto =
    `Nueva cita A.S\n` +
    `${servicio}\n` +
    `${fecha}\n` +
    `${nombre}${movil ? ' · ' + movil : ''}`

  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(texto)}`

  try {
    const respuesta = await fetch(url)
    // Nunca devolvemos el cuerpo de CallMeBot: podría incluir la apikey.
    return responder({ avisado: respuesta.ok })
  } catch {
    return responder({ avisado: false, motivo: 'CallMeBot no responde' })
  }
})
