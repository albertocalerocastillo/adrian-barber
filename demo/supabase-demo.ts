/**
 * Supabase de mentira para el modo demo del panel (ver vite.demo.config.ts).
 *
 * - Sesión iniciada sin contraseña (con ?login en la URL se empieza en la
 *   pantalla de acceso, para revisarla; cualquier email/contraseña entra).
 * - Citas, bloqueos, horario y servicios: inventados, con fechas relativas a
 *   hoy para que siempre haya algo que ver.
 * - Todo cambio se queda en memoria y se pierde al recargar. Nunca se toca la
 *   base de datos real ni datos de clientes.
 */
// #region Imports
import { SERVICIOS } from '../src/data/services'
import { EstadoCitaEnum } from '../src/services/enums/EstadoCitaEnum'
import { TablaSupabaseEnum } from '../src/services/enums/TablaSupabaseEnum'
import { FuncionSupabaseEnum } from '../src/services/enums/FuncionSupabaseEnum'
import { CODIGO_SOLAPE } from '../src/services/SupabaseConstants'
// #endregion

// #region Constantes
// Milisegundos de un minuto y de un día.
const MS_MINUTO = 60000
const MS_DIA = 864e5

// Duración de un servicio que no se encuentra.
const DURACION_POR_DEFECTO = 30

// Retardos para que se vean los estados de carga.
const RETARDO_CONSULTA_MS = 250
const RETARDO_RPC_MS = 300
const RETARDO_LOGIN_MS = 600

// Primer id de las filas inventadas.
const PRIMER_ID = 1000
// #endregion

// #region Tipos
/** Fila de cualquier tabla de la demo. */
interface Fila {
  [columna: string]: unknown;
  id: number;
}

/** Respuesta de una consulta, como la de Supabase. */
interface Respuesta {
  data: Fila[] | null;
  error: { code: string; message: string } | null;
}

/** Sesión de la demo. */
interface Sesion {
  user: { id: string; email: string };
}

/** Oyente de cambios de sesión. */
interface Oyente {
  (evento: string, sesion: Sesion | null): void;
}
// #endregion

// #region Datos inventados
const hoy = new Date()
hoy.setHours(0, 0, 0, 0)

// Fecha ISO de "dentro de `dias` días a las HH:MM".
const el = (dias: number, hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number)
  const result = new Date(hoy)
  result.setDate(result.getDate() + dias)
  result.setHours(h, m, 0, 0)
  return result.toISOString()
}
const diasHasta = (y: number, m: number, d: number): number => Math.round((new Date(y, m, d).getTime() - hoy.getTime()) / MS_DIA)
const mas = (iso: string, min: number): string => new Date(new Date(iso).getTime() + min * MS_MINUTO).toISOString()

const contador = { ultimoId: PRIMER_ID }
const nuevoId = (): number => ++contador.ultimoId

const cita = (dias: number, hhmm: string, servicio: string, nombre: string, movil: string, estado = EstadoCitaEnum.Pendiente): Fila => {
  const s = SERVICIOS.find((x) => x.nombre === servicio)
  const inicio = el(dias, hhmm)
  return {
    id: nuevoId(),
    servicio_nombre: servicio,
    cliente_nombre: nombre,
    cliente_movil: movil,
    inicio,
    fin: mas(inicio, s?.duracion ?? DURACION_POR_DEFECTO),
    estado,
    notas: null,
    creado_en: el(-1, '12:00'),
  }
}

const tablas: Record<string, Fila[]> = {
  [TablaSupabaseEnum.Servicios]: SERVICIOS.map((s, i) => ({
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
  [TablaSupabaseEnum.Horario]: [1, 2, 3, 4, 5].flatMap((dia, i) => [
    { id: i * 2 + 1, dia_semana: dia, hora_inicio: '09:00:00', hora_fin: '14:00:00' },
    { id: i * 2 + 2, dia_semana: dia, hora_inicio: '14:30:00', hora_fin: '22:00:00' },
  ]),
  [TablaSupabaseEnum.Citas]: [
    cita(0, '10:00', 'Corte', 'Julián Vázquez', '600111222', EstadoCitaEnum.Atendida),
    cita(0, '10:30', 'Corte', 'Manuel Ortega', '600333444', EstadoCitaEnum.Atendida),
    cita(0, '11:30', 'Mechas + Corte', 'Álvaro Romero', '611222333'),
    cita(0, '17:00', 'Corte', 'Sergio Domínguez', '622333444'),
    cita(0, '17:30', 'Tinte blanco + Corte', 'Rafael Moreno', ''),
    cita(0, '19:00', 'Corte', 'Pablo Jiménez', '633444555'),
    cita(0, '12:00', 'Corte', 'Luis Navarro', '644555666', EstadoCitaEnum.Cancelada),
    cita(1, '10:30', 'Corte', 'Iván Castillo', '655666777'),
    cita(1, '18:00', 'Corte', 'David Ruiz', '666777888'),
    cita(2, '11:00', 'Mechas + Corte', 'Javier Molina', '677888999'),
    cita(2, '12:30', 'Corte', 'Antonio Gil', '688999000'),
    cita(2, '20:00', 'Corte', 'Raúl Serrano', ''),
    cita(3, '10:00', 'Corte', 'Carlos Pérez', '699000111'),
    cita(4, '17:00', 'Tinte blanco + Corte', 'Fernando Ramos', '600222333'),
    cita(-1, '18:30', 'Corte', 'Miguel Torres', '600444555', EstadoCitaEnum.Atendida),
    // Primeras reservas de la web en enero de 2027 (para ver la reserva online).
    ...['10:00', '10:30', '11:00', '12:00', '17:00', '18:30'].map((h, i) => ({
      ...cita(diasHasta(2027, 0, 4), h, 'Corte', `Cliente web ${i + 1}`, `61000000${i}`),
      origen: 'web',
    })),
    { ...cita(diasHasta(2027, 0, 5), '10:00', 'Mechas + Corte', 'Óscar Web', '612000000'), origen: 'web' },
  ],
  [TablaSupabaseEnum.Bloqueos]: [
    { id: nuevoId(), inicio: el(3, '16:00'), fin: el(3, '22:00'), motivo: 'Médico', todo_el_dia: false },
    // Reyes: cerrado todo el día.
    { id: nuevoId(), inicio: el(diasHasta(2027, 0, 6), '00:00'), fin: el(diasHasta(2027, 0, 7), '00:00'), motivo: 'Reyes', todo_el_dia: true },
  ],
}

// Para las pruebas automáticas (simular que otro cliente reserva a la vez).
;(window as unknown as { __demoTablas: typeof tablas }).__demoTablas = tablas
// #endregion

// #region Constructor de consultas mínimo (lo que usa la app)
const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms))

const texto = (valor: unknown): string => String(valor ?? '')

const consulta = (nombre: string) => {
  const filtros: ((fila: Fila) => boolean)[] = []
  const ordenes: [string, boolean][] = []
  const estado: { modo: string; carga: Fila[] | Partial<Fila> | null; limite: number } = {
    modo: 'select',
    carga: null,
    limite: Infinity,
  }

  const pasa = (fila: Fila) => filtros.every((f) => f(fila))

  const ejecutar = async (): Promise<Respuesta> => {
    const tabla = tablas[nombre] ?? (tablas[nombre] = [])

    if (estado.modo === 'insert') {
      const nuevasFilas = estado.carga as Fila[]
      if (nombre === TablaSupabaseEnum.Citas) {
        const choca = nuevasFilas.some((n) =>
          tabla.some((c) => c.estado !== EstadoCitaEnum.Cancelada && texto(n.inicio) < texto(c.fin) && texto(c.inicio) < texto(n.fin))
        )
        if (choca) return { data: null, error: { code: CODIGO_SOLAPE, message: 'overlap' } }
      }
      const nuevas = nuevasFilas.map((f) => ({ ...f, id: nuevoId() }))
      tabla.push(...nuevas)
      return { data: nuevas, error: null }
    }
    if (estado.modo === 'update') {
      tablas[nombre] = tabla.map((fila) => (pasa(fila) ? { ...fila, ...(estado.carga as Partial<Fila>) } : fila))
      return { data: null, error: null }
    }
    if (estado.modo === 'delete') {
      tablas[nombre] = tabla.filter((fila) => !pasa(fila))
      return { data: null, error: null }
    }

    const filas = tabla.filter(pasa).map((fila) => ({ ...fila }))
    for (const [columna, ascendente] of [...ordenes].reverse()) {
      filas.sort((a, b) => (texto(a[columna]) < texto(b[columna]) ? -1 : texto(a[columna]) > texto(b[columna]) ? 1 : 0) * (ascendente ? 1 : -1))
    }
    await esperar(RETARDO_CONSULTA_MS)
    return { data: filas.slice(0, estado.limite), error: null }
  }

  const q = {
    select: () => q,
    insert: (filas: Fila | Fila[]) => {
      estado.modo = 'insert'
      estado.carga = Array.isArray(filas) ? filas : [filas]
      return q
    },
    update: (cambios: Partial<Fila>) => {
      estado.modo = 'update'
      estado.carga = cambios
      return q
    },
    delete: () => {
      estado.modo = 'delete'
      return q
    },
    eq: (c: string, v: unknown) => {
      filtros.push((r) => String(r[c]) === String(v))
      return q
    },
    gte: (c: string, v: string | number) => {
      filtros.push((r) => (r[c] as string | number) >= v)
      return q
    },
    gt: (c: string, v: string | number) => {
      filtros.push((r) => (r[c] as string | number) > v)
      return q
    },
    lt: (c: string, v: string | number) => {
      filtros.push((r) => (r[c] as string | number) < v)
      return q
    },
    lte: (c: string, v: string | number) => {
      filtros.push((r) => (r[c] as string | number) <= v)
      return q
    },
    order: (c: string, { ascending = true }: { ascending?: boolean } = {}) => {
      ordenes.push([c, ascending])
      return q
    },
    // Solo la forma que usa la app: "columna.ilike.%texto%" (varias con coma).
    or: (expresion: string) => {
      const condiciones = expresion.split(',').map((e) => {
        const [c, , patron] = e.split('.')
        // El ilike de Postgres no ignora tildes, así que aquí tampoco.
        const buscado = patron.replaceAll('%', '').toLowerCase()
        return (r: Fila) => texto(r[c]).toLowerCase().includes(buscado)
      })
      filtros.push((r) => condiciones.some((f) => f(r)))
      return q
    },
    limit: (n: number) => {
      estado.limite = n
      return q
    },
    // Imita al cliente de Supabase, que se puede esperar con await: para eso hace falta then().
    // eslint-disable-next-line no-restricted-syntax
    then: (ok: (r: Respuesta) => unknown, mal?: (e: unknown) => unknown) => ejecutar().then(ok, mal),
  }

  return q
}
// #endregion

// #region Sesión
const SESION: Sesion = { user: { id: 'demo-barbero', email: 'adrian@demo.es' } }
const sesionActual: { valor: Sesion | null } = {
  valor: new URLSearchParams(location.search).has('login') ? null : SESION,
}
const oyentes = new Set<Oyente>()
const avisar = () => oyentes.forEach((f) => f('CAMBIO', sesionActual.valor))
// #endregion

/** Cliente de Supabase de mentira (solo lo que usa la app). */
export const supabase = {
  from: consulta,
  functions: {
    invoke: async (nombre: string, { body }: { body: unknown }) => {
      console.info('[demo] aviso por WhatsApp a Adrián:', nombre, body)
      return { data: { avisado: false, motivo: 'demo' }, error: null }
    },
  },
  rpc: async (nombre: string, { p_desde, p_hasta }: { p_desde?: string; p_hasta?: string } = {}) => {
    if (nombre === FuncionSupabaseEnum.EsBarbero) return { data: true, error: null }
    if (nombre !== FuncionSupabaseEnum.CitasOcupadas) return { data: [], error: null }
    const ocupados = [
      ...tablas[TablaSupabaseEnum.Citas].filter((c) => c.estado !== EstadoCitaEnum.Cancelada),
      ...tablas[TablaSupabaseEnum.Bloqueos],
    ].filter((o) => texto(o.inicio) < texto(p_hasta) && texto(o.fin) > texto(p_desde))
    await esperar(RETARDO_RPC_MS)
    return { data: ocupados.map(({ inicio, fin }) => ({ inicio, fin })), error: null }
  },
  auth: {
    getSession: async () => ({ data: { session: sesionActual.valor } }),
    onAuthStateChange: (f: Oyente) => {
      oyentes.add(f)
      return { data: { subscription: { unsubscribe: () => oyentes.delete(f) } } }
    },
    signInWithPassword: async () => {
      await esperar(RETARDO_LOGIN_MS)
      sesionActual.valor = SESION
      avisar()
      return { error: null }
    },
    signOut: async () => {
      sesionActual.valor = null
      avisar()
    },
  },
}
