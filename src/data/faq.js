// Preguntas frecuentes.
//
// Sirven a dos cosas: resolverle la duda al cliente y captar búsquedas de cola
// larga ("cuánto cuesta cortarse el pelo en La Rinconada"). Se marcan como
// FAQPage para que Google las pueda mostrar desplegadas en los resultados.
//
// ⚠️ SOLO datos verificados. Nada de suponer: si no se sabe (si hace falta
// cita, si acepta tarjeta, si hace barba suelta…), no se pone hasta que lo
// confirme Adrián. Una FAQ que miente es peor que no tenerla.
import { NEGOCIO, TELEFONO_VISIBLE } from './contacto'
import { SERVICIOS, PROMO } from './servicios'

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]

// Convierte los tramos de un día en texto ("de 10:00 a 22:00" / "cerrado").
function tramosATexto(tramos) {
  if (!tramos || tramos.length === 0) return 'cerrado'
  return tramos.map(([de, a]) => `de ${de} a ${a}`).join(' y ')
}

/**
 * Resume el horario agrupando días seguidos con el mismo horario, para que
 * quede "Lunes a viernes de 10:00 a 22:00" en vez de siete líneas.
 * Se genera desde el mismo horario que muestra la web: así la FAQ no puede
 * contradecir a la sección de Horario.
 */
export function resumenHorario(horario) {
  const dias = ORDEN_SEMANA.map((d) => horario.find((h) => h.dia === d)).filter(Boolean)
  if (dias.length === 0) return ''

  const grupos = []
  for (const dia of dias) {
    const texto = tramosATexto(dia.tramos)
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.texto === texto) ultimo.dias.push(dia.nombre)
    else grupos.push({ texto, dias: [dia.nombre] })
  }

  return grupos
    .map(({ dias: nombres, texto }) => {
      const rango =
        nombres.length === 1
          ? nombres[0]
          : nombres.length === 2
            ? `${nombres[0]} y ${nombres[1]}`
            : `${nombres[0]} a ${nombres[nombres.length - 1]}`
      return `${rango}, ${texto}`
    })
    .join('. ')
}

/** Construye las preguntas a partir de los datos reales del negocio. */
export function construirFaq(horario) {
  const corte = SERVICIOS.find((s) => s.nombre === 'Corte')
  const otros = SERVICIOS.filter((s) => s.nombre !== 'Corte')

  return [
    {
      pregunta: `¿Cuánto cuesta cortarse el pelo en ${NEGOCIO.localidad}?`,
      respuesta: corte
        ? `El corte cuesta ${corte.precio} € e incluye cejas, barba y diseños, sin extras escondidos. ${PROMO.texto}`
        : PROMO.texto,
    },
    {
      pregunta: '¿Qué incluye el corte?',
      respuesta:
        'Cejas, barba y diseños van incluidos en el precio del corte. No se cobra aparte por el arreglo de barba ni por el perfilado.',
    },
    {
      pregunta: '¿Hacéis mechas y tinte?',
      respuesta: otros.length
        ? `Sí. ${otros.map((s) => `${s.nombre}, ${s.precio} €`).join('. ')}.`
        : 'Sí, consúltanos precios.',
    },
    {
      pregunta: '¿Qué horario tenéis?',
      respuesta: `${resumenHorario(horario)}.`,
    },
    {
      pregunta: `¿Dónde está la barbería?`,
      respuesta: `En ${NEGOCIO.direccion}, ${NEGOCIO.localidad} (${NEGOCIO.provincia}). Tienes el mapa y el enlace para llegar en la sección "Dónde estamos".`,
    },
    {
      pregunta: '¿Cómo pido cita?',
      respuesta: `Por WhatsApp o llamando al ${TELEFONO_VISIBLE}. Escríbenos y te decimos el primer hueco libre.`,
    },
  ]
}
