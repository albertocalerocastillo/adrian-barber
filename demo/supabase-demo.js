/**
 * Supabase de mentira para el modo demo del panel (ver vite.demo.config.js).
 *
 * - Sesión iniciada sin contraseña (con ?login en la URL se empieza en la
 *   pantalla de acceso, para revisarla; cualquier email/contraseña entra).
 * - Citas, bloqueos, horario y servicios: inventados, con fechas relativas a
 *   hoy para que siempre haya algo que ver.
 * - Todo cambio se queda en memoria y se pierde al recargar. Nunca se toca la
 *   base de datos real ni datos de clientes.
 */
import { SERVICIOS } from '../src/data/servicios'

const hoy = new Date()
hoy.setHours(0, 0, 0, 0)

// Fecha ISO de "dentro de `dias` días a las HH:MM".
const el = (dias, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(hoy)
  d.setDate(d.getDate() + dias)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
const diasHasta = (y, m, d) => Math.round((new Date(y, m, d) - hoy) / 864e5)
const mas = (iso, min) => new Date(new Date(iso).getTime() + min * 60000).toISOString()

let ultimoId = 1000
const nuevoId = () => ++ultimoId

const cita = (dias, hhmm, servicio, nombre, movil, estado = 'pendiente') => {
  const s = SERVICIOS.find((x) => x.nombre === servicio)
  const inicio = el(dias, hhmm)
  return {
    id: nuevoId(),
    servicio_nombre: servicio,
    cliente_nombre: nombre,
    cliente_movil: movil,
    inicio,
    fin: mas(inicio, s?.duracion ?? 30),
    estado,
    notas: null,
    creado_en: el(-1, '12:00'),
  }
}

const tablas = {
  servicios: SERVICIOS.map((s, i) => ({
    id: i + 1,
    nombre: s.nombre,
    descripcion: s.descripcion,
    duracion_min: s.duracion,
    precio: s.precio,
    icono: s.icono,
    destacado: s.destacado,
    activo: true,
    reserva_online: s.online !== false,
    orden: i + 1,
  })),
  horario: [1, 2, 3, 4, 5].flatMap((dia, i) => [
    { id: i * 2 + 1, dia_semana: dia, hora_inicio: '09:00:00', hora_fin: '14:00:00' },
    { id: i * 2 + 2, dia_semana: dia, hora_inicio: '14:30:00', hora_fin: '22:00:00' },
  ]),
  citas: [
    cita(0, '10:00', 'Corte', 'Julián Vázquez', '600111222', 'atendida'),
    cita(0, '10:30', 'Corte', 'Manuel Ortega', '600333444', 'atendida'),
    cita(0, '11:30', 'Mechas + Corte', 'Álvaro Romero', '611222333'),
    cita(0, '17:00', 'Corte', 'Sergio Domínguez', '622333444'),
    cita(0, '17:30', 'Tinte blanco + Corte', 'Rafael Moreno', ''),
    cita(0, '19:00', 'Corte', 'Pablo Jiménez', '633444555'),
    cita(0, '12:00', 'Corte', 'Luis Navarro', '644555666', 'cancelada'),
    cita(1, '10:30', 'Corte', 'Iván Castillo', '655666777'),
    cita(1, '18:00', 'Corte', 'David Ruiz', '666777888'),
    cita(2, '11:00', 'Mechas + Corte', 'Javier Molina', '677888999'),
    cita(2, '12:30', 'Corte', 'Antonio Gil', '688999000'),
    cita(2, '20:00', 'Corte', 'Raúl Serrano', ''),
    cita(3, '10:00', 'Corte', 'Carlos Pérez', '699000111'),
    cita(4, '17:00', 'Tinte blanco + Corte', 'Fernando Ramos', '600222333'),
    cita(-1, '18:30', 'Corte', 'Miguel Torres', '600444555', 'atendida'),
    // Primeras reservas de la web en enero de 2027 (para ver la reserva online)
    ...['10:00', '10:30', '11:00', '12:00', '17:00', '18:30'].map((h, i) =>
      ({ ...cita(diasHasta(2027, 0, 4), h, 'Corte', `Cliente web ${i + 1}`, `61000000${i}`), origen: 'web' })
    ),
    { ...cita(diasHasta(2027, 0, 5), '10:00', 'Mechas + Corte', 'Óscar Web', '612000000'), origen: 'web' },
  ],
  bloqueos: [
    { id: nuevoId(), inicio: el(3, '16:00'), fin: el(3, '22:00'), motivo: 'Médico', todo_el_dia: false },
    // Reyes: cerrado todo el día
    { id: nuevoId(), inicio: el(diasHasta(2027, 0, 6), '00:00'), fin: el(diasHasta(2027, 0, 7), '00:00'), motivo: 'Reyes', todo_el_dia: true },
  ],
}

// Para las pruebas automáticas (simular que otro cliente reserva a la vez).
window.__demoTablas = tablas

// ─── Constructor de consultas mínimo (lo que usa la app) ───────────────────
function consulta(nombre) {
  const filtros = []
  const ordenes = []
  let modo = 'select'
  let carga = null
  let limite = Infinity

  const q = {
    select() { return q },
    insert(filas) { modo = 'insert'; carga = Array.isArray(filas) ? filas : [filas]; return q },
    update(cambios) { modo = 'update'; carga = cambios; return q },
    delete() { modo = 'delete'; return q },
    eq(c, v) { filtros.push((r) => String(r[c]) === String(v)); return q },
    gte(c, v) { filtros.push((r) => r[c] >= v); return q },
    gt(c, v) { filtros.push((r) => r[c] > v); return q },
    lt(c, v) { filtros.push((r) => r[c] < v); return q },
    lte(c, v) { filtros.push((r) => r[c] <= v); return q },
    order(c, { ascending = true } = {}) { ordenes.push([c, ascending]); return q },
    // Solo la forma que usa la app: "columna.ilike.%texto%" (varias con coma).
    or(expr) {
      const conds = expr.split(',').map((e) => {
        const [c, , patron] = e.split('.')
        // ilike de Postgres no ignora tildes, así que aquí tampoco.
        const t = patron.replaceAll('%', '').toLowerCase()
        return (r) => String(r[c] ?? '').toLowerCase().includes(t)
      })
      filtros.push((r) => conds.some((f) => f(r)))
      return q
    },
    limit(n) { limite = n; return q },
    then(ok, mal) { return Promise.resolve(ejecutar()).then(ok, mal) },
  }

  const pasa = (r) => filtros.every((f) => f(r))

  function ejecutar() {
    const tabla = tablas[nombre] ?? (tablas[nombre] = [])

    if (modo === 'insert') {
      if (nombre === 'citas') {
        const choca = carga.some((n) =>
          tabla.some((c) => c.estado !== 'cancelada' && n.inicio < c.fin && c.inicio < n.fin)
        )
        if (choca) return { data: null, error: { code: '23P01', message: 'overlap' } }
      }
      const nuevas = carga.map((f) => ({ id: nuevoId(), ...f }))
      tabla.push(...nuevas)
      return { data: nuevas, error: null }
    }
    if (modo === 'update') {
      tabla.filter(pasa).forEach((r) => Object.assign(r, carga))
      return { data: null, error: null }
    }
    if (modo === 'delete') {
      tablas[nombre] = tabla.filter((r) => !pasa(r))
      return { data: null, error: null }
    }

    const filas = tabla.filter(pasa).map((r) => ({ ...r }))
    for (const [c, asc] of [...ordenes].reverse()) {
      filas.sort((a, b) => (a[c] < b[c] ? -1 : a[c] > b[c] ? 1 : 0) * (asc ? 1 : -1))
    }
    // Retardo pequeño para que se vean los estados de carga.
    return new Promise((r) => setTimeout(() => r({ data: filas.slice(0, limite), error: null }), 250))
  }

  return q
}

// ─── Sesión ─────────────────────────────────────────────────────────────────
const SESION = { user: { id: 'demo-barbero', email: 'adrian@demo.es' } }
let sesion = new URLSearchParams(location.search).has('login') ? null : SESION
const oyentes = new Set()
const avisar = () => oyentes.forEach((f) => f('CAMBIO', sesion))

export const supabase = {
  from: consulta,
  functions: {
    async invoke(nombre, { body }) {
      console.info('[demo] aviso por WhatsApp a Adrián:', nombre, body)
      return { data: { avisado: false, motivo: 'demo' }, error: null }
    },
  },
  async rpc(nombre, { p_desde, p_hasta } = {}) {
    if (nombre === 'es_barbero') return { data: true, error: null }
    if (nombre !== 'citas_ocupadas') return { data: [], error: null }
    const ocupados = [
      ...tablas.citas.filter((c) => c.estado !== 'cancelada'),
      ...tablas.bloqueos,
    ].filter((o) => o.inicio < p_hasta && o.fin > p_desde)
    await new Promise((r) => setTimeout(r, 300))
    return { data: ocupados.map(({ inicio, fin }) => ({ inicio, fin })), error: null }
  },
  auth: {
    getSession: async () => ({ data: { session: sesion } }),
    onAuthStateChange(f) {
      oyentes.add(f)
      return { data: { subscription: { unsubscribe: () => oyentes.delete(f) } } }
    },
    async signInWithPassword() {
      await new Promise((r) => setTimeout(r, 600))
      sesion = SESION
      avisar()
      return { error: null }
    },
    async signOut() {
      sesion = null
      avisar()
    },
  },
}
