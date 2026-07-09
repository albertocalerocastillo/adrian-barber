// Interruptores de funcionalidad (feature flags) de la web.
// Centralizados aquí para activar/desactivar bloques sin tocar los componentes.

// Reserva de citas online (/reserva).
//  - false → FASE 1: "Pedir cita" abre WhatsApp; la web es informativa.
//  - true  → FASE 2: "Pedir cita" lleva al flujo de reserva online.
// Para reactivar la reserva online cuando esté lista: cambia a true.
export const RESERVAS_ONLINE = false
