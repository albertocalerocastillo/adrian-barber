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
//  (o en el panel de Supabase: Edge Functions → aviso-cita → Code → pegar y Deploy).
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
//
//  El mensaje está pensado para leerlo de un vistazo con las manos ocupadas:
//  qué, cuándo (y si es hoy o mañana), quién (y si es nuevo o de siempre),
//  cómo va ese día y enlaces de un toque para escribirle o abrir la agenda.
// ════════════════════════════════════════════════════════════

// #region Constantes
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const JSON_HEADERS = { ...CORS, 'Content-Type': 'application/json' }

// Solo se avisa de citas creadas hace menos de estos minutos.
const VENTANA_MIN = 10

// Zona horaria del negocio: el mensaje siempre en hora de España.
const ZONA = 'Europe/Madrid'

// Agenda del panel, para abrirla desde el aviso.
const URL_PANEL = 'https://adrian-barber.vercel.app/admin'

// Prefijo internacional de los móviles españoles (para el enlace de WhatsApp).
const PREFIJO_ESPANA = '34'

// Milisegundos de un minuto y de un día.
const MS_MINUTO = 60_000
const MS_DIA = 24 * 60 * MS_MINUTO

// Estado de las citas que no cuentan (canceladas) y de las que ya vinieron.
const ESTADO_CANCELADA = 'cancelada'
const ESTADO_ATENDIDA = 'atendida'

// Esferas de reloj para la hora en punto (índice = hora 1..12) y la media.
const RELOJ_EN_PUNTO = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']
const RELOJ_Y_MEDIA = ['🕧', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦']
// #endregion

// #region Tipos
/** Cita recién creada, tal como está en la base de datos. */
interface CitaGuardada {
  id: number;
  servicio_nombre: string;
  cliente_nombre: string;
  cliente_movil: string;
  inicio: string;
  fin: string;
}

/** Todo lo que hace falta para escribir el aviso. */
export interface DatosAviso {
  /** La cita nueva. */
  cita: CitaGuardada;
  /** Precio del servicio en euros, si se conoce. */
  precio: number | null;
  /** Citas activas que tiene Adrián ese día, contando esta. */
  citasDelDia: number | null;
  /** Veces que el cliente ya ha venido (citas atendidas antes), si se sabe. */
  visitasPrevias: number | null;
  /** Momento en que se manda el aviso. */
  ahora: Date;
}
// #endregion

// #region Formato
const responder = (cuerpo: unknown, status = 200): Response =>
  new Response(JSON.stringify(cuerpo), { status, headers: JSON_HEADERS })

/** "Martes 7 de julio" en hora de España. */
const fechaLarga = (fecha: Date): string => {
  const result = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: ZONA }).format(fecha)
  return result.charAt(0).toUpperCase() + result.slice(1).replace(',', '')
}

/** "12:00" en hora de España. */
const hora = (fecha: Date): string =>
  new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: ZONA }).format(fecha)

/** "2027-01-04": día natural en España, para comparar días. */
const diaEnEspana = (fecha: Date): string =>
  new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: ZONA }).format(fecha)

/** Días naturales (en España) que van de `desde` a `hasta`. */
const diasEntre = (desde: Date, hasta: Date): number =>
  Math.round((Date.parse(diaEnEspana(hasta)) - Date.parse(diaEnEspana(desde))) / MS_DIA)

/** "hoy", "mañana", "pasado mañana" o "dentro de 12 días". */
const cuandoRelativo = (desde: Date, hasta: Date): string => {
  const dias = diasEntre(desde, hasta)
  if (dias <= 0) return '¡hoy!'
  if (dias === 1) return 'mañana'
  if (dias === 2) return 'pasado mañana'
  return `dentro de ${dias} días`
}

/** Esfera de reloj que más se parece a la hora de la cita. */
const reloj = (fecha: Date): string => {
  const [h, m] = hora(fecha).split(':').map(Number)
  const esfera = h % 12
  return m >= 30 ? RELOJ_Y_MEDIA[esfera] : RELOJ_EN_PUNTO[esfera]
}

/** "684 05 93 80": el móvil en grupos, fácil de leer en voz alta. */
const movilLegible = (movil: string): string => movil.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4')

/** "6 €" o "12,50 €". */
const euros = (precio: number): string =>
  `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(precio)} €`

/** "Primera vez" o "Ya ha venido 3 veces". */
const historial = (visitas: number): string => {
  if (visitas === 0) return '🆕 Primera vez'
  if (visitas === 1) return '🔁 Ya ha venido 1 vez'
  return `🔁 Ya ha venido ${visitas} veces`
}

/** "Es la única cita de ese día" o "Con esta, ese día tienes 5 citas". */
const resumenDia = (citas: number): string =>
  citas <= 1 ? '📊 Es la única cita de ese día' : `📊 Con esta, ese día tienes ${citas} citas`
// #endregion

// #region Mensaje
/**
 * Escribe el aviso de WhatsApp. Usa el formato de WhatsApp (*negrita*,
 * _cursiva_) y deja fuera cualquier dato que no se haya podido leer, para
 * que un fallo menor nunca impida el aviso.
 */
export const componerMensaje = ({ cita, precio, citasDelDia, visitasPrevias, ahora }: DatosAviso): string => {
  const inicio = new Date(cita.inicio)
  const fin = new Date(cita.fin)
  const duracion = Math.round((fin.getTime() - inicio.getTime()) / MS_MINUTO)
  const movil = cita.cliente_movil.replace(/\D/g, '')

  const servicio = [`✂️ *${cita.servicio_nombre}*`, precio !== null ? euros(precio) : null, `${duracion} min`]
    .filter(Boolean)
    .join(' · ')

  const cliente = [`👤 *${cita.cliente_nombre.trim()}*`, visitasPrevias !== null ? `_${historial(visitasPrevias)}_` : null]
    .filter(Boolean)
    .join('\n')

  const result = [
    '💈 *NUEVA CITA* · reservada en la web',
    '',
    servicio,
    `📅 *${fechaLarga(inicio)}* (${cuandoRelativo(ahora, inicio)})`,
    `${reloj(inicio)} *${hora(inicio)} – ${hora(fin)}*`,
    '',
    cliente,
    `📞 ${movilLegible(movil)}`,
    `💬 Escribirle: wa.me/${PREFIJO_ESPANA}${movil}`,
    '',
    citasDelDia !== null ? resumenDia(citasDelDia) : null,
    // El enlace abre la agenda directamente en el día de la cita.
    `🗓️ Ver en la agenda: ${URL_PANEL}?dia=${diaEnEspana(inicio)}`,
  ]
    .filter((linea) => linea !== null)
    .join('\n')
  return result
}
// #endregion

// #region Consultas
/** Lee de la API REST de Supabase; si falla, devuelve null (el aviso sigue sin ese dato). */
const leer = async <T>(urlBd: string, cabeceras: Record<string, string>, ruta: string): Promise<T | null> => {
  // Un dato de más no merece perder el aviso: cualquier fallo de red o de lectura se ignora.
  try {
    const respuesta = await fetch(`${urlBd}/rest/v1/${ruta}`, { headers: cabeceras })
    return respuesta.ok ? ((await respuesta.json()) as T) : null
  } catch {
    return null
  }
}

/** Precio del servicio por su nombre. */
const leerPrecio = async (urlBd: string, cabeceras: Record<string, string>, nombre: string): Promise<number | null> => {
  const filas = await leer<{ precio: number | string }[]>(
    urlBd,
    cabeceras,
    `servicios?select=precio&nombre=eq.${encodeURIComponent(nombre)}&limit=1`
  )
  const precio = filas?.[0] ? Number(filas[0].precio) : NaN
  return Number.isFinite(precio) ? precio : null
}

/** Citas activas del mismo día (en España) que la cita nueva, contándola. */
const contarCitasDelDia = async (urlBd: string, cabeceras: Record<string, string>, inicio: Date): Promise<number | null> => {
  // Se pide un margen amplio y se filtra por día en hora de España (el día de Madrid no coincide con el de UTC).
  const desde = new Date(inicio.getTime() - MS_DIA).toISOString()
  const hasta = new Date(inicio.getTime() + MS_DIA).toISOString()
  const filas = await leer<{ inicio: string }[]>(
    urlBd,
    cabeceras,
    `citas?select=inicio&estado=neq.${ESTADO_CANCELADA}` +
      `&inicio=gte.${encodeURIComponent(desde)}&inicio=lt.${encodeURIComponent(hasta)}`
  )
  if (!filas) return null
  const dia = diaEnEspana(inicio)
  return filas.filter((f) => diaEnEspana(new Date(f.inicio)) === dia).length
}

/** Veces que el cliente (por su móvil) ya ha venido. */
const contarVisitas = async (urlBd: string, cabeceras: Record<string, string>, movil: string, idCita: number): Promise<number | null> => {
  const filas = await leer<{ id: number }[]>(
    urlBd,
    cabeceras,
    `citas?select=id&cliente_movil=eq.${movil}&estado=eq.${ESTADO_ATENDIDA}&id=neq.${idCita}`
  )
  return filas ? filas.length : null
}
// #endregion

// #region Función
// Sin Deno (al probar el mensaje fuera de Supabase) no se arranca el servidor.
if (typeof Deno !== 'undefined') {
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

    const datos = (await req.json().catch(() => null)) as Record<string, unknown> | null
    if (!datos) return responder({ error: 'JSON no válido' }, 400)

    const movil = typeof datos.clienteMovil === 'string' ? datos.clienteMovil.replace(/\D/g, '') : ''
    const inicio = typeof datos.inicio === 'string' ? new Date(datos.inicio) : null
    if (!/^[6789]\d{8}$/.test(movil) || !inicio || Number.isNaN(inicio.getTime())) {
      return responder({ error: 'Faltan datos de la cita' }, 400)
    }

    const cabeceras = { apikey: claveServicio, Authorization: `Bearer ${claveServicio}` }
    const desde = new Date(Date.now() - VENTANA_MIN * MS_MINUTO).toISOString()
    const filtro =
      `cliente_movil=eq.${movil}&inicio=eq.${encodeURIComponent(inicio.toISOString())}` +
      `&origen=eq.web&avisado_en=is.null&creado_en=gte.${encodeURIComponent(desde)}`

    const encontradas = await leer<CitaGuardada[]>(
      urlBd,
      cabeceras,
      `citas?select=id,servicio_nombre,cliente_nombre,cliente_movil,inicio,fin&${filtro}&limit=1`
    )
    const cita = encontradas?.[0]
    if (!cita) return responder({ avisado: false, motivo: 'cita no encontrada o ya avisada' })

    // Los datos extra se piden a la vez; si alguno falla, el aviso sale sin él.
    const [precio, citasDelDia, visitasPrevias] = await Promise.all([
      leerPrecio(urlBd, cabeceras, cita.servicio_nombre),
      contarCitasDelDia(urlBd, cabeceras, new Date(cita.inicio)),
      contarVisitas(urlBd, cabeceras, movil, cita.id),
    ])
    const texto = componerMensaje({ cita, precio, citasDelDia, visitasPrevias, ahora: new Date() })

    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
      `&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(texto)}`

    // Si CallMeBot no responde, la cita sigue guardada: solo se informa.
    try {
      const respuesta = await fetch(url)
      if (respuesta.ok) {
        await fetch(`${urlBd}/rest/v1/citas?id=eq.${cita.id}`, {
          method: 'PATCH',
          headers: { ...cabeceras, 'Content-Type': 'application/json' },
          body: JSON.stringify({ avisado_en: new Date().toISOString() }),
        })
      }
      // Nunca se devuelve el cuerpo de CallMeBot: podría incluir la apikey.
      return responder({ avisado: respuesta.ok })
    } catch {
      return responder({ avisado: false, motivo: 'CallMeBot no responde' })
    }
  })
}
// #endregion
