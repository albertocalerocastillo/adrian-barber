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
export const WHATSAPP_MENSAJE = 'Hola Adrián, me gustaría pedir una cita 💈'

// Enlace de Google Maps (placeholder: se afina con la ubicación exacta de Adrián)
export const MAPS_QUERY = encodeURIComponent('C/ 28 de Febrero 2, La Rinconada, Sevilla')
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`
export const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`
