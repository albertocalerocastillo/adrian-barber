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
//  (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los pone Supabase solo.)
//
//  🔒 No se fía de lo que manda el navegador: la función es pública, así que
//  cualquiera podría llamarla para mandarle a Adrián mensajes inventados.
//  Por eso solo usa el móvil y la hora para BUSCAR la cita en la base de
//  datos (recién creada desde la web y sin avisar todavía) y compone el
//  mensaje con lo que hay guardado. Si la cita no existe, no manda nada; y
//  la marca como avisada para no mandarla dos veces.
// ════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const JSON_HEADERS = { ...CORS, 'Content-Type': 'application/json' }

// Solo se avisa de citas creadas hace menos de esto.
const VENTANA_MIN = 10

function responder(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: JSON_HEADERS })
}

// Fecha legible en español y en hora de España.
function cuando(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(iso))
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return responder({ error: 'Método no permitido' }, 405)

  const phone = Deno.env.get('CALLMEBOT_PHONE')
  const apikey = Deno.env.get('CALLMEBOT_APIKEY')
  const urlBd = Deno.env.get('SUPABASE_URL')
  const claveServicio = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  // Sin configurar no es un error: la cita ya se guardó, solo no se avisa.
  if (!phone || !apikey) return responder({ avisado: false, motivo: 'sin configurar' })
  if (!urlBd || !claveServicio) return responder({ avisado: false, motivo: 'sin acceso a la BD' })

  let datos: Record<string, unknown>
  try {
    datos = await req.json()
  } catch {
    return responder({ error: 'JSON no válido' }, 400)
  }

  const movil = typeof datos.clienteMovil === 'string' ? datos.clienteMovil.replace(/\D/g, '') : ''
  const inicio = typeof datos.inicio === 'string' ? new Date(datos.inicio) : null
  if (!/^[6789]\d{8}$/.test(movil) || !inicio || Number.isNaN(inicio.getTime())) {
    return responder({ error: 'Faltan datos de la cita' }, 400)
  }

  const cabeceras = { apikey: claveServicio, Authorization: `Bearer ${claveServicio}` }
  const desde = new Date(Date.now() - VENTANA_MIN * 60_000).toISOString()
  const filtro =
    `cliente_movil=eq.${movil}&inicio=eq.${encodeURIComponent(inicio.toISOString())}` +
    `&origen=eq.web&avisado_en=is.null&creado_en=gte.${encodeURIComponent(desde)}`

  const busqueda = await fetch(
    `${urlBd}/rest/v1/citas?select=id,servicio_nombre,cliente_nombre,cliente_movil,inicio&${filtro}&limit=1`,
    { headers: cabeceras }
  )
  const [cita] = busqueda.ok ? await busqueda.json() : []
  if (!cita) return responder({ avisado: false, motivo: 'cita no encontrada o ya avisada' })

  const texto =
    `Nueva cita A.S (web)\n` +
    `${cita.servicio_nombre}\n` +
    `${cuando(cita.inicio)}\n` +
    `${cita.cliente_nombre} · ${cita.cliente_movil}`

  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(texto)}`

  try {
    const respuesta = await fetch(url)
    if (respuesta.ok) {
      await fetch(`${urlBd}/rest/v1/citas?id=eq.${cita.id}`, {
        method: 'PATCH',
        headers: { ...cabeceras, 'Content-Type': 'application/json' },
        body: JSON.stringify({ avisado_en: new Date().toISOString() }),
      })
    }
    // Nunca devolvemos el cuerpo de CallMeBot: podría incluir la apikey.
    return responder({ avisado: respuesta.ok })
  } catch {
    return responder({ avisado: false, motivo: 'CallMeBot no responde' })
  }
})
