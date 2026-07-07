// Servicios de A.S Barbería.
// Precios REALES (de sus historias de Instagram). ⚠️ Las DURACIONES son
// estimadas — pendientes de confirmar con Adrián (son clave para calcular
// los huecos de la reserva en la Fase 2).
//
// En la Fase 2 estos datos pasarán a la tabla `servicios` de Supabase y se
// gestionarán desde el panel.
//
// duracion: minutos · icono: nombre de un icono de lucide-react (theme/icons.js)

export const SERVICIOS = [
  {
    id: 'corte',
    nombre: 'Corte',
    descripcion: 'Incluye cejas, barba y diseños. El corte completo, sin extras escondidos.',
    duracion: 30,
    precio: 6,
    icono: 'Scissors',
    destacado: true,
  },
  {
    id: 'mechas-corte',
    nombre: 'Mechas + Corte',
    descripcion: 'Mechas y corte en una misma sesión, con acabado y peinado.',
    duracion: 75,
    precio: 17,
    icono: 'Paintbrush',
    destacado: false,
  },
  {
    id: 'tinte-blanco-corte',
    nombre: 'Tinte blanco + Corte',
    descripcion: 'Coloración en blanco más corte completo.',
    duracion: 60,
    precio: 20,
    icono: 'PaintBucket',
    destacado: false,
  },
]

// Promoción destacada (de sus historias).
export const PROMO = {
  titulo: 'Clientes de cada semana',
  texto: 'Si te pelas una vez por semana, el corte se queda en 5 €.',
  precio: 5,
}
