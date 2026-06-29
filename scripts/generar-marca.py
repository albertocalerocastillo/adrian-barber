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

PROP_AS = 0.66  # parte superior del logo que contiene el "A.S"


def extraer(origen, destino):
    logo = Image.open(origen).convert("RGBA")
    w, h = logo.size
    arriba = logo.crop((0, 0, w, int(h * PROP_AS)))
    bbox = arriba.split()[3].point(lambda x: 255 if x > 30 else 0).getbbox()
    if bbox:
        arriba = arriba.crop(bbox)
    arriba.save(destino)
    print(f"{destino}  ({arriba.width}x{arriba.height})")


extraer("public/logo-blanco.png", "public/logo-as-blanco.png")
extraer("public/logo-negro.png", "public/logo-as-negro.png")
