"""
Extrae el monograma "A.S" (solo la parte de arriba del logo) en blanco y
transparente, para incrustarlo en el emblema/sello.

Salida:
  public/logo-as-blanco.png  (A.S blanco, para fondos oscuros)
  public/logo-as-negro.png   (A.S tinta,  para fondos claros)

Requiere haber corrido antes procesar-logo.py (logo-blanco/negro.png).
Reejecutar tras cambiar el logo:  python scripts/generar-marca.py
"""
from PIL import Image

PROP_AS = 0.70  # parte superior del logo que contiene el "A.S"
MARGEN = 18     # aire transparente alrededor (para que no quede pegado al borde)


def extraer(origen, destino):
    logo = Image.open(origen).convert("RGBA")
    w, h = logo.size
    arriba = logo.crop((0, 0, w, int(h * PROP_AS)))
    bbox = arriba.split()[3].point(lambda x: 255 if x > 30 else 0).getbbox()
    if bbox:
        arriba = arriba.crop(bbox)
    # Lienzo transparente con margen alrededor del A.S.
    lienzo = Image.new("RGBA", (arriba.width + 2 * MARGEN, arriba.height + 2 * MARGEN), (0, 0, 0, 0))
    lienzo.alpha_composite(arriba, (MARGEN, MARGEN))
    lienzo.save(destino)
    print(f"{destino}  ({lienzo.width}x{lienzo.height})")


extraer("public/logo-blanco.png", "public/logo-as-blanco.png")
extraer("public/logo-negro.png", "public/logo-as-negro.png")
