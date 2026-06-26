// Servicios de A.S Barbería.
// ⚠️ DATOS DE EJEMPLO (Fase 1) — pendientes de confirmar con Adrián
//    duración real y precios. En la Fase 2 pasarán a la tabla `servicios`
//    de Supabase y se gestionarán desde el panel.
//
// duracion: minutos (clave para calcular los huecos en la reserva).
// icono: nombre de un icono de lucide-react (ver theme/icons.js).

export const SERVICIOS = [
  {
    id: 'corte',
    nombre: 'Corte de pelo',
    descripcion: 'Corte personalizado a máquina y tijera, lavado y peinado.',
    duracion: 30,
    precio: 12,
    icono: 'Scissors',
    destacado: true,
  },
  {
    id: 'corte-barba',
    nombre: 'Corte + Barba',
    descripcion: 'Corte completo y arreglo de barba con perfilado y toalla caliente.',
    duracion: 45,
    precio: 18,
    icono: 'UserRound',
    destacado: true,
  },
  {
    id: 'barba',
    nombre: 'Arreglo de barba',
    descripcion: 'Perfilado, recorte y apurado con navaja y toalla caliente.',
    duracion: 20,
    precio: 8,
    icono: 'Sparkles',
    destacado: false,
  },
  {
    id: 'afeitado',
    nombre: 'Afeitado clásico',
    descripcion: 'Afeitado tradicional a navaja con espuma caliente y aftershave.',
    duracion: 30,
    precio: 12,
    icono: 'Droplet',
    destacado: false,
  },
  {
    id: 'corte-nino',
    nombre: 'Corte infantil',
    descripcion: 'Corte para los más pequeños, con paciencia y buen rollo.',
    duracion: 30,
    precio: 10,
    icono: 'Baby',
    destacado: false,
  },
]
