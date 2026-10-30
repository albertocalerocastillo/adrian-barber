// Interruptores de funcionalidad (feature flags) de la web.
// Centralizados aquí para activar/desactivar bloques sin tocar los componentes.

// Reserva de citas online (/reserva).
//  - false → solo WhatsApp: /reserva redirige a la home.
//  - true  → /reserva funciona, con las reglas de RESERVA de abajo.
export const RESERVAS_ONLINE = true

// Reglas de la reserva online.
// ⚠️ La BASE DE DATOS comprueba lo mismo (función reserva_ajustes() en
//    supabase/migracion-reservas-2027.sql). Si se cambia algo aquí, cambiarlo
//    también allí, o la web ofrecerá huecos que luego no se pueden reservar.
export const RESERVA = {
  // Primer día reservable (Adrián quiere empezar a gestionarla en 2027).
  // Antes de esta fecha la web ya deja reservar, pero solo días desde aquí.
  desde: '2027-01-01',
  // Minutos mínimos de antelación (que no le caiga una cita sin verla).
  antelacionMin: 60,
  // Días vista que se pueden reservar, contados desde `desde` si aún no ha
  // llegado (en octubre ya se puede coger cita para enero y febrero).
  diasMax: 60,
  // Cada cuánto se ofrecen horas (además de justo al acabar otra cita).
  pasoMin: 30,
  // Zona horaria del negocio: las horas salen en hora de España aunque el
  // cliente abra la web desde otro huso (Canarias, el extranjero…).
  zona: 'Europe/Madrid',
}

/** Primer día reservable como fecha local (medianoche). */
export const inicioReservas = (): Date => {
  const [y, m, d] = RESERVA.desde.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * ¿Ha empezado ya la reserva online? Hasta entonces, los botones de "Pedir
 * cita" siguen abriendo WhatsApp (quien quiere cita para mañana no puede
 * esperar a enero) y la reserva online se ofrece como opción para después.
 * El 1 de enero cambian solos, sin tocar nada.
 */
export const reservaEmpezada = (ahora: Date = new Date()): boolean => {
  return RESERVAS_ONLINE && ahora >= inicioReservas()
}
