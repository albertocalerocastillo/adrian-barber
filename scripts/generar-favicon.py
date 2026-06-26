"""
Genera el favicon a partir del logo original: recorta el monograma "A.S" de
public/logo-blanco.png y lo centra sobre un cuadrado tinta (oscuro), legible
en la pestaña del navegador tanto en modo claro como oscuro.

Salida:
  public/favicon.png        (512x512, para la pestaña)
  public/apple-touch-icon.png (180x180, para "añadir a inicio" en iOS)

Reejecutar tras cambiar el logo:  python scripts/generar-favicon.py
(requiere haber corrido antes procesar-logo.py para tener logo-blanco.png)
"""
from PIL import Image, ImageDraw

FONDO = (12, 12, 13, 255)   # color tinta
PROP_AS = 0.66              # parte superior del logo que contiene el "A.S"
PAD = 0.16                  # margen relativo dentro del cuadrado

logo = Image.open("public/logo-blanco.png").convert("RGBA")
w, h = logo.size

# 1) Recorta la zona del "A.S" (parte superior) y ajústala a su contenido
arriba = logo.crop((0, 0, w, int(h * PROP_AS)))
mascara = arriba.split()[3].point(lambda x: 255 if x > 30 else 0)
bbox = mascara.getbbox()
if bbox:
    arriba = arriba.crop(bbox)


def construir(tamano, salida, redondear=True):
    canvas = Image.new("RGBA", (tamano, tamano), FONDO)
    if redondear:
        # Esquinas redondeadas suaves
        radio = int(tamano * 0.22)
        mask = Image.new("L", (tamano, tamano), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, tamano, tamano], radio, fill=255)
        canvas.putalpha(mask)

    # Escala el A.S para que quepa con margen
    libre = int(tamano * (1 - 2 * PAD))
    aw, ah = arriba.size
    escala = min(libre / aw, libre / ah)
    nw, nh = int(aw * escala), int(ah * escala)
    icono = arriba.resize((nw, nh), Image.LANCZOS)
    canvas.alpha_composite(icono, ((tamano - nw) // 2, (tamano - nh) // 2))
    canvas.save(salida)
    print(f"  {salida}  ({tamano}x{tamano})")


print("Generando favicon desde el logo:")
construir(512, "public/favicon.png")
construir(180, "public/apple-touch-icon.png", redondear=False)
print("Hecho.")
