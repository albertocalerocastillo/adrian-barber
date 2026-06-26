"""
Procesa el logo original (public/logo.jpg, trazo negro sobre mármol claro) y
genera dos versiones recortadas con FONDO TRANSPARENTE:

  - public/logo-blanco.png : trazo blanco  -> para fondos OSCUROS (nav, hero, footer)
  - public/logo-negro.png  : trazo tinta   -> para fondos CLAROS

Cómo: se construye una máscara de opacidad a partir de la "oscuridad" de cada
píxel (el texto negro = opaco; el mármol claro = transparente), con un ajuste
de niveles para limpiar el fondo sin perder el suavizado de los trazos.

Reejecutar tras cambiar el logo:  python scripts/procesar-logo.py
"""
from PIL import Image, ImageOps

ORIGEN = "public/logo.jpg"
LO, HI = 82, 165          # umbrales de niveles (mármol -> 0, texto -> 255)
MARGEN = 12               # margen en px alrededor del recorte

# 1) Máscara de opacidad desde la luminancia invertida
gris = Image.open(ORIGEN).convert("L")
oscuro = ImageOps.invert(gris)            # texto claro, mármol oscuro


def nivel(x):
    if x <= LO:
        return 0
    if x >= HI:
        return 255
    return int((x - LO) * 255 / (HI - LO))


alpha = oscuro.point(nivel)

# 2) Recorte al contenido (bbox de lo que es claramente texto)
solido = alpha.point(lambda x: 255 if x > 30 else 0)
bbox = solido.getbbox()
if bbox:
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - MARGEN); y0 = max(0, y0 - MARGEN)
    x1 = min(alpha.width, x1 + MARGEN); y1 = min(alpha.height, y1 + MARGEN)
    alpha = alpha.crop((x0, y0, x1, y1))

w, h = alpha.size


def guardar(color, destino):
    img = Image.new("RGBA", (w, h), color + (0,))
    img.putalpha(alpha)
    img.save(destino)
    print(f"  {destino}  ({w}x{h})")


print("Generando versiones del logo:")
guardar((255, 255, 255), "public/logo-blanco.png")  # fondos oscuros
guardar((12, 12, 13), "public/logo-negro.png")        # fondos claros
print("Hecho.")
