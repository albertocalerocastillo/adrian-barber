<div align="center">

# A.S Peluquería y Barbería

**Web con reserva de citas online y panel de agenda para una barbería de La Rinconada (Sevilla).**

![React 19](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![Motion](https://img.shields.io/badge/Motion-000000?style=flat-square&logo=framer&logoColor=FFF200)
![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=flat-square&logo=supabase&logoColor=3ECF8E)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

**[Ver web](https://adrian-barber.vercel.app)** · https://adrian-barber.vercel.app

</div>

<table>
  <tr>
    <td width="72%"><img src="docs/captura-escritorio.jpg" alt="Portada de la web de A.S Barbería en escritorio"></td>
    <td width="28%"><img src="docs/captura-movil.jpg" alt="Portada de la web de A.S Barbería en móvil"></td>
  </tr>
</table>

## Qué es

A.S Peluquería y Barbería es la barbería de Adrián Sánchez en La Rinconada (Sevilla). Trabaja
solo, con una silla, y hasta ahora las citas llegaban todas por WhatsApp.

El proyecto resuelve dos cosas:

- **Que le encuentren:** una web rápida, con precios, horario, trabajos reales, reseñas y cómo
  llegar, pensada para el móvil y para el SEO local.
- **Que la agenda no dependa del teléfono:** reserva online con huecos calculados en tiempo real
  y un panel `/admin` donde Adrián gestiona citas, horario y servicios.

La reserva online admite citas **desde el 1 de enero de 2027**, por decisión del negocio. Hasta
esa fecha, "Pedir cita" abre WhatsApp y la reserva online se ofrece para enero en adelante; el
cambio ocurre solo, sin tocar código.

## Funcionalidades

**Web pública**
- Servicios con precio y duración (editables desde el panel), promoción destacada, "Sobre mí",
  galería de trabajos con visor, reseñas reales de Google, FAQ, horario y ubicación.
- Indicador **Abierto ahora / Cerrado** en tiempo real y barra de contacto fija en móvil
  (Llamar · WhatsApp · Cómo llegar).
- Animaciones con Motion: titular palabra a palabra, sello con parallax, tarjetas con
  inclinación, contadores y barra de progreso de lectura.
- Mapa de Google solo al pulsar "Ver mapa"; páginas de aviso legal, privacidad y cookies.

**Reserva online** (`/reserva`)
- Flujo en pasos: servicio → fecha → hora → datos → confirmación.
- Calendario mensual que marca días completos o cerrados y rejilla de horas libres cada 30 min
  (más la hora justo al acabar otra cita).
- Reglas: 60 min de antelación mínima, 60 días vista, hora de España aunque el cliente esté en
  otro huso, y respeto de días libres y vacaciones.
- Confirmación con "Añadir al calendario" (Google Calendar y `.ics`) y enlace a WhatsApp.

**Panel del barbero** (`/admin`)
- Acceso con Supabase Auth, limitado a las cuentas dadas de alta como barbero.
- **Agenda:** resumen del día (citas, atendidas, pendientes, caja prevista), siguiente cita
  destacada con llamar/WhatsApp, tira de 7 días, línea de tiempo con huecos libres y vista semanal.
- Nueva cita manual, días libres, marcar atendida o cancelar con opción de **Deshacer**; las citas
  que llegan de la web llevan la etiqueta "Web".
- **Horario** (jornada partida, copiar a otros días) y **Servicios** (precio, duración, activo),
  guardados en Supabase: la web y la reserva se recalculan al momento.
- Navegación inferior en móvil, pestañas en tablet y barra lateral en escritorio.

## Stack

| Capa | Tecnología |
| --- | --- |
| Interfaz | React 19, React Router 7, Tailwind CSS v4, lucide-react |
| Animación | Motion |
| Tipografía | Playfair Display y Lora, autoalojadas con Fontsource |
| Build | Vite 8 (JavaScript, sin TypeScript) |
| Datos | Supabase: PostgreSQL con RLS, funciones SQL y Auth |
| Avisos | Supabase Edge Function (`aviso-cita`) + CallMeBot para WhatsApp |
| Hosting | Vercel, con despliegue automático desde `main` |

## Arquitectura

```
src/
├── components/
│   ├── layout/      Nav, Footer
│   ├── sections/    Hero, Cinta, Servicios, SobreMi, Galeria, Resenas, Faq, Horario, Ubicacion, CtaFinal
│   ├── pages/       Home/, Reserva/ (pasos + reglas), Panel/ (agenda, horario, servicios), Legal/
│   └── ui/          Sello, TiltCard, Magnetic, Marquee, ProgresoScroll, Lightbox, EstadoBadge…
├── data/            servicios.js, horarios.js, contacto.js, faq.js, features.js (flags y reglas)
├── hooks/           useAuth, useEstadoNegocio, useCountUp, useScrolled
├── lib/             supabase.js, citas.js, config.js, panel.js, aviso.js
├── utils/           disponibilidad.js (motor de huecos), fechas.js, horario.js
└── theme/           theme.css (tokens), animacion.js, icons.js
supabase/
├── schema.sql, policies.sql, seed.sql, setup-completo.sql
├── migracion-*.sql  reservas 2027, seguridad, horario, iconos
└── functions/aviso-cita/
demo/supabase-demo.ts  Supabase simulado para revisar el panel sin datos reales
```

**Flujo de datos**

- **Configuración:** servicios y horario se leen de Supabase (`lib/config.js`); si no hay
  conexión o no está configurado, se usan los datos estáticos de `src/data/`.
- **Huecos:** la web pide a la función `citas_ocupadas()` solo los tramos ocupados (sin datos de
  clientes) y `utils/disponibilidad.js` calcula los huecos libres con horario, días libres y reglas.
- **Reserva:** la cita se inserta desde el navegador y la base de datos la valida con un trigger
  (`validar_cita_web()`) que aplica las mismas reglas de fecha, antelación y duración.
  Una **restricción de exclusión** de PostgreSQL (`EXCLUDE USING gist` sobre `tstzrange`) hace
  físicamente imposible que dos citas activas se solapen.
- **Aviso:** la Edge Function `aviso-cita` busca la cita recién creada en la base de datos y
  compone el mensaje con lo guardado, no con lo que manda el navegador.
- Las páginas de reserva y panel se cargan de forma diferida (`React.lazy`).

## Seguridad

- **RLS en todas las tablas.** Solo las cuentas incluidas en la tabla `barberos` (función
  `es_barbero()`) pueden leer o modificar citas; el registro público de usuarios está desactivado.
- El público no puede leer citas ni el motivo de los días libres: solo los tramos ocupados.
- Validación en base de datos de cada cita web y límite de 20 reservas web por hora.
- La apikey de CallMeBot vive como secreto de la Edge Function, nunca en el JavaScript público.
- Cabeceras en [`vercel.json`](vercel.json): Content-Security-Policy estricta, `X-Frame-Options`,
  `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` y `noindex`
  en `/admin`. HTTPS y HSTS los aplica Vercel.
- Tipografías autoalojadas (sin Google Fonts) y sin cookies de analítica: no necesita banner.

## SEO y rendimiento

- Datos estructurados `HairSalon` (dirección, horario, redes) y `FAQPage` generada desde los
  mismos datos que la sección de horario, para que no puedan contradecirse.
- H1 con texto real, title y descripción orientados a búsqueda local, canonical, Open Graph con
  imagen propia y Twitter Card; `robots.txt` y `sitemap.xml`.
- Página 404 con `noindex`; panel con `noindex, nofollow`.
- Recursos de `/assets` con caché inmutable de un año.

## Accesibilidad

- Todas las animaciones respetan **"reducir movimiento"** del sistema.
- Texto alternativo en la galería y botones con nombre accesible.
- Revisado sin desplazamiento horizontal a 1920, 1366, 1024, 768, 430 y 360 px.
- Barra de contacto móvil con botones grandes, al alcance del pulgar.

## Desarrollo local

```bash
npm install
cp .env.example .env   # opcional: sin .env la web usa los datos estáticos
npm run dev            # http://localhost:5173
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run demo` | Panel en http://localhost:5174/admin con un Supabase simulado; nada se guarda (`/admin?login` empieza en la pantalla de acceso) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build |
| `npm run lint` | ESLint con las normas de estilo (ver abajo) |

Variables de entorno (ver [`.env.example`](.env.example)): `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY`. Los secretos del aviso (`CALLMEBOT_PHONE`, `CALLMEBOT_APIKEY`) no van
en el `.env`, sino en Supabase:

```bash
supabase secrets set CALLMEBOT_PHONE=... CALLMEBOT_APIKEY=...
supabase functions deploy aviso-cita
```

La base de datos se crea con [`supabase/setup-completo.sql`](supabase/setup-completo.sql) y las
migraciones `migracion-*.sql` en el SQL Editor de Supabase. Después hay que añadir cada cuenta del
panel a la tabla `barberos` (bloque final de `migracion-seguridad.sql`).

### Estilo de código

`npm run lint` comprueba solas la mayoría de las normas
([`eslint.config.js`](eslint.config.js) y las reglas propias de [`eslint-rules/wiki.js`](eslint-rules/wiki.js)):

- `const` siempre; `let` solo si no hay otra; nunca `var`.
- Funciones flecha (`const nombre = () => {}`), también los componentes, y `async/await` en vez de `.then()`.
- Comentarios en su propia línea encima del código, empezando en mayúscula y acabando en punto.
- Toda función exportada lleva su bloque `/** … */` explicando qué hace.

Y a mano:

- La variable que se devuelve al final de una función se llama `result`.
- Nada de textos o números con significado sueltos: van en un enumerado ([`src/enums`](src/enums),
  p. ej. `EstadoCitaEnum.Pendiente`) o en una constante (`MINUTOS_DIA`).
- Los componentes se ordenan en regiones funcionales: `// #region Imports`,
  `// #region Declaraciones, variables y hooks`, `// #region Renderizado` (y las que hagan falta).
- Nada de código comentado ni de `try/catch` salvo para controlar un error concreto.

## Despliegue

- **Vercel:** cada `push` a `main` se despliega automáticamente. [`vercel.json`](vercel.json)
  define el rewrite de SPA y las cabeceras de seguridad y caché.
- Variables en Vercel (entorno Production): `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- La Edge Function se despliega aparte con la CLI de Supabase.


---

<div align="center">

Hecho por **[Alberto Calero](https://github.com/albertocalerocastillo)**

</div>
