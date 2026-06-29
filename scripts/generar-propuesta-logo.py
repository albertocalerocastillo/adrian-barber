"""
Genera 3 PROPUESTAS de logo para enseñar a Adrián (NO se usan en la web).
Todas con su monograma A.S manuscrito real + motivos de barbería/peluquería.

Salida (se abren con doble clic en el navegador):
  logo-propuesta/1-sello.svg     medallón con poste + tijeras + peine
  logo-propuesta/2-moderno.svg   tijeras cruzadas grandes + A.S (sin marco)
  logo-propuesta/3-postes.svg    A.S flanqueado por dos postes de barbero

Reejecutar:  python scripts/generar-propuesta-logo.py
"""
import base64, io, os
from PIL import Image

os.makedirs("logo-propuesta", exist_ok=True)


def b64(ancho=420):
    im = Image.open("public/logo-as-blanco.png").convert("RGBA")
    h = round(im.height * ancho / im.width)
    im = im.resize((ancho, h), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


AS = b64()

# ── 1 · SELLO (medallón vintage) ────────────────────────────
SELLO = f"""<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="150" r="146" fill="#0c0c0d"/>
  <circle cx="150" cy="150" r="140" fill="none" stroke="#b08d57" stroke-width="2.5"/>
  <circle cx="150" cy="150" r="122" fill="none" stroke="#b08d57" stroke-width="1" opacity="0.45"/>
  <path id="t1" d="M58 150 A92 92 0 0 1 242 150" fill="none"/>
  <path id="b1" d="M64 162 A86 86 0 0 0 236 162" fill="none"/>
  <text font-family="Georgia,serif" font-size="15" letter-spacing="3" fill="#e9e5dc"><textPath href="#t1" startOffset="50%" text-anchor="middle">PELUQUERÍA · BARBERÍA</textPath></text>
  <text font-family="Georgia,serif" font-size="12.5" letter-spacing="2.5" fill="#b08d57"><textPath href="#b1" startOffset="50%" text-anchor="middle">LA RINCONADA · SEVILLA</textPath></text>
  <g fill="#b08d57"><path d="M70 150 l5 -5 5 5 -5 5 z"/><path d="M220 150 l5 -5 5 5 -5 5 z"/></g>
  <image href="{AS}" x="88" y="84" width="124" height="70" preserveAspectRatio="xMidYMid meet"/>
  <defs><clipPath id="cp1"><rect x="144" y="170" width="12" height="44" rx="6"/></clipPath></defs>
  <rect x="144" y="170" width="12" height="44" rx="6" fill="#1a1a1d" stroke="#b08d57" stroke-width="1.5"/>
  <g clip-path="url(#cp1)" stroke="#b08d57" stroke-width="3" opacity="0.9">
    <line x1="138" y1="226" x2="162" y2="198"/><line x1="138" y1="216" x2="162" y2="188"/>
    <line x1="138" y1="206" x2="162" y2="178"/><line x1="138" y1="196" x2="162" y2="168"/></g>
  <ellipse cx="150" cy="168" rx="5" ry="3.4" fill="#b08d57"/><ellipse cx="150" cy="216" rx="5" ry="3.4" fill="#b08d57"/>
  <g stroke="#b08d57" stroke-width="2" fill="none" transform="translate(120,189)">
    <circle cx="-5" cy="9" r="4"/><circle cx="5" cy="9" r="4"/>
    <line x1="-3" y1="6" x2="9" y2="-9"/><line x1="3" y1="6" x2="-9" y2="-9"/></g>
  <g stroke="#b08d57" stroke-width="2" fill="none" transform="translate(180,184)">
    <rect x="-11" y="0" width="22" height="6" rx="2"/>
    <line x1="-8" y1="6" x2="-8" y2="18"/><line x1="-3" y1="6" x2="-3" y2="18"/>
    <line x1="2" y1="6" x2="2" y2="18"/><line x1="7" y1="6" x2="7" y2="18"/></g>
</svg>"""

# ── 2 · MODERNO (tijeras cruzadas + A.S, sin marco) ─────────
MODERNO = f"""<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="6" width="288" height="288" rx="44" fill="#0c0c0d"/>
  <rect x="18" y="18" width="264" height="264" rx="34" fill="none" stroke="#b08d57" stroke-width="1" opacity="0.4"/>
  <g stroke="#b08d57" stroke-width="4" fill="none" opacity="0.9" transform="translate(150,128)">
    <circle cx="-34" cy="40" r="13"/><circle cx="34" cy="40" r="13"/>
    <line x1="-26" y1="32" x2="48" y2="-58"/><line x1="26" y1="32" x2="-48" y2="-58"/></g>
  <image href="{AS}" x="80" y="104" width="140" height="79" preserveAspectRatio="xMidYMid meet"/>
  <line x1="86" y1="214" x2="214" y2="214" stroke="#b08d57" stroke-width="1"/>
  <text x="150" y="236" text-anchor="middle" font-family="Georgia,serif" font-size="13" letter-spacing="4" fill="#e9e5dc">BARBERÍA · PELUQUERÍA</text>
  <text x="150" y="256" text-anchor="middle" font-family="Georgia,serif" font-size="10.5" letter-spacing="3" fill="#b08d57">LA RINCONADA · SEVILLA</text>
</svg>"""

# ── 3 · POSTES (A.S entre dos postes de barbero) ────────────
def poste(cx):
    return f"""<defs><clipPath id="cp{cx}"><rect x="{cx-7}" y="96" width="14" height="92" rx="7"/></clipPath></defs>
  <rect x="{cx-7}" y="96" width="14" height="92" rx="7" fill="#1a1a1d" stroke="#b08d57" stroke-width="1.5"/>
  <g clip-path="url(#cp{cx})" stroke="#b08d57" stroke-width="3.4" opacity="0.9">
    <line x1="{cx-9}" y1="200" x2="{cx+9}" y2="176"/><line x1="{cx-9}" y1="190" x2="{cx+9}" y2="166"/>
    <line x1="{cx-9}" y1="180" x2="{cx+9}" y2="156"/><line x1="{cx-9}" y1="170" x2="{cx+9}" y2="146"/>
    <line x1="{cx-9}" y1="160" x2="{cx+9}" y2="136"/><line x1="{cx-9}" y1="150" x2="{cx+9}" y2="126"/>
    <line x1="{cx-9}" y1="140" x2="{cx+9}" y2="116"/><line x1="{cx-9}" y1="130" x2="{cx+9}" y2="106"/></g>
  <ellipse cx="{cx}" cy="94" rx="6" ry="4" fill="#b08d57"/><ellipse cx="{cx}" cy="190" rx="6" ry="4" fill="#b08d57"/>"""

POSTES = f"""<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="150" r="146" fill="#0c0c0d"/>
  <circle cx="150" cy="150" r="140" fill="none" stroke="#b08d57" stroke-width="2.5"/>
  {poste(70)}
  {poste(230)}
  <image href="{AS}" x="96" y="108" width="108" height="61" preserveAspectRatio="xMidYMid meet"/>
  <line x1="104" y1="196" x2="196" y2="196" stroke="#b08d57" stroke-width="1"/>
  <text x="150" y="218" text-anchor="middle" font-family="Georgia,serif" font-size="13.5" letter-spacing="3" fill="#e9e5dc">PELUQUERÍA · BARBERÍA</text>
  <text x="150" y="238" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="2.5" fill="#b08d57">LA RINCONADA · SEVILLA</text>
</svg>"""

for nombre, svg in [("1-sello", SELLO), ("2-moderno", MODERNO), ("3-postes", POSTES)]:
    with open(f"logo-propuesta/{nombre}.svg", "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"  logo-propuesta/{nombre}.svg")

print("Listo. Ábrelos con doble clic (se ven en el navegador).")
