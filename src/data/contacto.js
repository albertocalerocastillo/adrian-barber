// Datos de contacto y ubicación de A.S Barbería.
// Centralizados aquí para usarlos en Nav, Footer, Ubicación y botones de acción.

export const NEGOCIO = {
  nombre: 'A.S',
  nombreCompleto: 'A.S Peluquería y Barbería',
  barbero: 'Adrián Sánchez Aranda',
  claim: 'Peluquería y barbería',
  ciudad: 'La Rinconada, Sevilla',
  direccion: 'C/ 28 de Febrero, Nº 2',
  localidad: 'La Rinconada',
  provincia: 'Sevilla',
}

// Teléfono / WhatsApp (formato internacional sin signos para los enlaces)
export const TELEFONO = '+34695811018'
export const TELEFONO_VISIBLE = '695 81 10 18'
export const WHATSAPP = '34695811018' // para enlaces wa.me

// Redes
export const INSTAGRAM = 'adriansanchee'
export const INSTAGRAM_URL = 'https://www.instagram.com/adriansanchee/'
export const INSTAGRAM_PERSONAL = 'adriansanchezarandaa1'

// Mensaje por defecto para el enlace de WhatsApp (Fase 1; en Fase 2 reservará online)
export const WHATSAPP_MENSAJE = 'Hola Adrián, me gustaría pedir una cita'

// ─── Valoración de Google ───────────────────────────────────
// ⚠️ DATO MANUAL: no se actualiza solo. Repásalo de vez en cuando en la ficha.
export const GOOGLE_VALORACION = { nota: '5,0', resenas: 56 }

// Ficha de Google en Maps, por su identificador estable (CID). Sale del enlace
// largo de Maps: la parte "!1s0x...:0x1bb742b3fb752ffd" del final, pasada a
// decimal. Son 48 caracteres en vez de los 700+ del enlace completo, y no
// lleva parámetros de sesión, así que no caduca. Vale igual para leer reseñas,
// para "cómo llegar" y para generar un QR limpio.
export const GOOGLE_FICHA_URL = 'https://maps.google.com/?cid=1997138300547444733'

// Para LEER las reseñas.
export const GOOGLE_RESENAS_URL = GOOGLE_FICHA_URL

// Para DEJAR una reseña. Hoy lleva a la ficha y el cliente pulsa "Escribir una
// reseña": un toque de más, pero funciona siempre.
//
// 📌 MEJORA PENDIENTE: cuando Adrián conteste, que entre en su Perfil de
//    Empresa → "Pedir reseñas". Google le dará un enlace corto tipo
//    https://g.page/r/XXXX/review que abre DIRECTAMENTE el cuadro de escribir.
//    Se cambia aquí y se regenera el QR, nada más.
export const GOOGLE_RESENA_URL = GOOGLE_FICHA_URL

// Testimonios REALES copiados literalmente de la ficha de Google (21/09/2026).
// ⛔ NO inventar ninguno ni retocar la redacción: son palabras de clientes.
//
// ⚠️ Si algún día se automatiza esto, hay que FILTRAR: entre las reseñas de 5
// estrellas hay bromas de amigos (una dice que el barbero va borracho los
// lunes, otra insinúa un "final feliz"). Suman a la media, pero puestas como
// testimonio hunden la imagen del negocio.
export const TESTIMONIOS = [
  {
    texto:
      'Sin lugar a duda mi peluquería de confianza. Muy buenos precios y salgo siempre muy satisfecho; no se le puede pedir nada más.',
    autor: 'Julián Vd',
  },
  {
    // Nombra San José y La Rinconada: justo lo que busca la gente de la zona.
    texto: 'El mejor peluquero de todo San José y rinconada, y muy amable y buena gente',
    autor: 'coronel cops',
  },
  {
    texto: 'Peluquero joven con mucho talento y mucha formalidad y de confianza.',
    autor: 'Guillermo Faraco Tabares',
  },
]

// Enlace de Google Maps (placeholder: se afina con la ubicación exacta de Adrián)
export const MAPS_QUERY = encodeURIComponent('C/ 28 de Febrero 2, La Rinconada, Sevilla')
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`
export const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`
