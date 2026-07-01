# Estado del proyecto — A.S Barbería (Adrián Sánchez)

> Documento de continuación. Si abres un chat nuevo, léelo para ponerte al día.
> Última actualización: 26 junio 2026.

## ⚡ RESUMEN ACTUAL (para retomar rápido)

Web de **reserva de citas** para la barbería de **Adrián Sánchez** (A.S Peluquería
y Barbería), en **La Rinconada, Sevilla**. Stack React + Vite + Tailwind v4 +
Supabase + Vercel (mismo que el proyecto `paco.vago`).

- **Web en producción:** https://adrian-barber.vercel.app
- **GitHub:** https://github.com/albertocalerocastillo/adrian-barber (público)
- **Deploy:** automático en Vercel con cada `git push` a `main`.

- ✅ **Fase 1 — Web pública** montada: hero, servicios (precio+duración), sobre mí,
  galería con lightbox, horario (con badge abierto/cerrado en vivo), ubicación con
  mapa, footer y botón flotante de WhatsApp. Diseño premium monocromo + acento dorado.
- ✅ **Fase 2 — Reserva online** (capa 1): flujo completo `/reserva`
  (servicio → fecha → huecos → datos → confirmación). Motor de huecos en
  `utils/disponibilidad.js` (sin solapes, sin pasado; verificado). Capa de datos
  `lib/citas.js` funciona con **Supabase si está configurado, o localStorage** si no
  (para probar ya). SQL listo en `supabase/` (con exclusion constraint anti-doble-reserva).
  ✅ **Supabase conectado** (org "A.S Barbería", proyecto `adrian-barber`,
  URL `https://ydzeqcujmohupzcmhrbk.supabase.co`). SQL ejecutado (tablas +
  RLS + seed). Credenciales en `.env` LOCAL (gitignored). Verificado: lee
  servicios y RPC de huecos. ⬜ Pendiente: variables en Vercel + email (Resend).
- ⬜ **Fase 3 — Panel del barbero** (login, agenda, bloqueos, CRUD servicios/horario).
- ⬜ **Fase 4 (opcional)** — recordatorios, seña Stripe, multi-silla, reseñas.

**Flujo de trabajo (IMPORTANTE):** trabajar en rama (no en master); `npm run build`
para verificar; **NO hacer `git push` sin OK del usuario**; ofrecer opciones marcando
la (Recomendado) y tirar por ella; ir poco a poco.

## Decisiones tomadas (con Adrián)

- **Una silla** (Adrián trabaja solo). La tabla `citas` quedará preparada por si en
  el futuro entra otro barbero, pero el cálculo de huecos es de un solo recurso.
- **Avisos por email gratis** al cliente (Supabase + Resend, plan gratis). Adrián lo
  ve todo en su panel. (Se implementa en Fase 2.)
- **Sin seña** por ahora; reserva libre. Cancelación por teléfono/WhatsApp y desde el
  panel. Stripe queda para la Fase 4.
- **Estilo visual:** monocromo premium (negro/gris/blanco hueso) + acento cálido
  dorado/latón, fiel al logo manuscrito B/N.

## Datos REALES ya aplicados (de sus historias de Instagram)

- **Servicios y precios** (en `src/data/servicios.js`):
  - Corte — **6 €** (incluye cejas, barba y diseños)
  - Mechas + Corte — **17 €**
  - Tinte blanco + Corte — **20 €**
  - PROMO: si te pelas una vez por semana, el corte sale a **5 €**.
- **Logo:** ✅ integrado y MEJORADO con un emblema/sello.
  - `public/logo.jpg` = logo original (negro sobre mármol).
  - `scripts/procesar-logo.py` → `logo-blanco.png` / `logo-negro.png` (recortados sin fondo).
  - `scripts/generar-marca.py` → `logo-as-blanco.png` / `logo-as-negro.png` (solo el
    monograma A.S, para nav/emblema).
  - `scripts/generar-favicon.py` → favicon e icono iOS (monograma A.S sobre cuadrado tinta).
  - **`SelloComponent.jsx`** = emblema "sello vintage" (anillo dorado + texto curvo
    "peluquería·barbería / La Rinconada" + tijeras + el A.S manuscrito real en el centro).
    Se usa en el HERO (grande) y el FOOTER (mediano).
  - `LogoComponent.jsx` (nav y cabecera de /reserva) usa el monograma A.S compacto.
  - Reejecutar los 3 scripts si Adrián cambia el logo (orden: procesar-logo → generar-marca → generar-favicon).

## Logo NUEVO (de Adrián) + paleta

- Adrián trajo un **logo propio** (emblema dorado sobre pizarra con cinta granate):
  `public/logo-adri.jpg` (web, optimizado) y `public/logo-adri-hd.jpg` (alta).
- Se usa en hero (grande), nav, footer, cabecera de reserva y favicon
  (`LogoAdriComponent.jsx`). El hero es ahora pizarra a juego para que el
  emblema se funda con el fondo.
- **Paleta actualizada** en `theme.css` a los colores del logo: pizarra
  `#16202a` (tinta), dorado `#c4a05a` (acento), granate `#6e2329` (vino, usado
  en el banner de la promo).
- Los logos anteriores (SelloComponent, logo-blanco/negro, propuestas) quedan
  en el repo pero ya NO se usan en la web.
- ⏸️ Cambios hechos en LOCAL y commit, **sin desplegar** (a petición del usuario).

## SEO / Google

- ✅ Datos estructurados `HairSalon` en `index.html` (NAP + horario + IG).
- ✅ `public/robots.txt` y `public/sitemap.xml`.
- ✅ Favicon e icono iOS generados del logo (`scripts/generar-favicon.py` →
  `public/favicon.png`, `public/apple-touch-icon.png`).
- ⬜ **Google Search Console:** verificar la propiedad `adrian-barber.vercel.app`
  (pegar el `<meta name="google-site-verification">` que dé Google en `index.html`)
  y pulsar "Solicitar indexación". Es lo que hace que aparezca/actualice rápido en Google.
- ⬜ (Recomendado) Ficha gratuita de **Google Business Profile** para salir en Maps.

## ⚠️ PENDIENTE DE DATOS REALES (de Adrián)

1. **Logo:** soltar el archivo en `public/logo.png`. IDEAL: PNG con **fondo
   transparente** y trazo blanco (luce sobre nav/hero/footer oscuros). Si solo
   está la versión sobre mármol, sirve igual pero se verá el recuadro de fondo.
2. **Duraciones de los servicios** — ahora SON ESTIMADAS (corte 30 min,
   mechas+corte 75 min, tinte+corte 60 min). Críticas para los huecos de la Fase 2.
3. **Horario exacto** — editar `src/data/horarios.js`. Ahora de ejemplo: L–V 10–14
   y 17–21, sábado 10–14, domingo cerrado.
4. **Fotos reales** de trabajos — soltar en `src/assets/galeria/` (se detectan
   solas vía `import.meta.glob`; orden por nombre descendente, p. ej. 2026-01.jpg).
   Tiene 4 historias destacadas en IG: 2026, 2025, 2024 y "Cortes".
5. **Foto de Adrián** para "Sobre mí" (`SobreMiComponent.jsx`).
6. **Coordenadas exactas** para el mapa (la dirección ya está bien).

## Datos del negocio (de su Instagram)

- **Nombre:** A.S Peluquería y Barbería · **Barbero:** Adrián Sánchez Aranda
- **Ubicación:** La Rinconada, Sevilla · C/ 28 de Febrero, Nº 2
- **WhatsApp:** 695 81 10 18 · **Instagram:** @adriansanchee
- **Cuenta personal IG:** @adriansanchezarandaa1

## Stack

- **React 19 + Vite 8** + **Tailwind CSS v4** (`@tailwindcss/vite`)
- **lucide-react** v1.x (sin iconos de marca → SVG propios para IG/WhatsApp)
- **react-router-dom** (aún no se usa; entrará con /reserva y /panel)
- JavaScript (NO TypeScript)
- **Backend: Supabase** (PostgreSQL + Auth + Storage) — se configura en Fase 2.
  Cliente en `src/lib/supabase.js` (con fallback: si no hay `.env`, usa datos estáticos).
- **Deploy:** Vercel ✅ conectado al repo. Cada push a `main` redespliega solo.

### Cuidado con Vite 8 / oxc (parser estricto)
- Cerrar etiquetas auto-cerradas con `/>`.
- Atributos booleanos sin `=""` (p. ej. `allowFullScreen`, no `allowFullScreen=""`).
- `lucide-react` v1.x no trae iconos de marcas (Instagram, WhatsApp): SVG propios.

## Estructura (estilo paco.vago / tms.web, "componente por carpeta")

```
src/
├─ components/
│  ├─ layout/    Nav/, Footer/
│  ├─ sections/  Hero/, Servicios/, SobreMi/, Galeria/, Horario/, Ubicacion/
│  ├─ pages/     (Fase 2: Reserva/ · Fase 3: Panel/)
│  └─ ui/        Logo/, CitaButton/, WhatsAppButton/, FloatingActions/,
│                Reveal/, SectionHeading/, Lightbox/, InstagramIcon/, WhatsAppIcon/
├─ hooks/        useScrolled  (Fase 2/3: useAuth, useHuecos, useServicios…)
├─ lib/          supabase.js
├─ data/         contacto.js, servicios.js, horarios.js, galeria.js
├─ theme/        theme.css (tokens @theme), icons.js
└─ utils/        horario.js  (estado abierto/cerrado)
```

## Modelo de datos previsto (Supabase — se crea en Fase 2)

```
servicios   id, nombre, descripcion, duracion_min, precio, color, activo, orden, creado_en
horario     id, dia_semana (0-6), hora_inicio, hora_fin   · varias filas = jornada partida
bloqueos    id, inicio, fin, motivo, todo_el_dia          · descansos/vacaciones
citas       id, servicio_id, cliente_nombre, cliente_movil, cliente_email?,
            inicio, fin, estado (pendiente|atendida|cancelada), notas, creado_en
```

**🔒 Anti-doble-reserva (clave):** exclusion constraint de PostgreSQL que impide
físicamente solapes, además del cálculo de huecos en el frontend:
`EXCLUDE USING gist (tstzrange(inicio, fin) WITH &&) WHERE (estado <> 'cancelada')`

## Próximos pasos

1. (Cuando Adrián los dé) sustituir datos de ejemplo de horario/servicios/fotos.
2. Iniciar **Fase 2**: crear proyecto Supabase, schema + RLS, y la pantalla `/reserva`
   con cálculo de huecos libres.
3. Crear repo en GitHub y proyecto en Vercel para el primer deploy.

## Cómo arrancar en local

```bash
npm install
npm run dev      # desarrollo
npm run build    # verificar build de producción
```
