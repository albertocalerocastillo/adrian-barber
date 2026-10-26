"""
Genera todos los recursos de marca a partir del logo definitivo (sello circular
+ monograma "A.S" con navaja), que llega en UNA sola imagen con transparencia:
logo-propuesta/logo-final.webp  (sello a la izquierda, monograma a la derecha).

Salida (en public/):
  logo-sello.webp / .png    sello circular completo, fondo transparente
  logo-as.webp / .png       solo el monograma (letras hueso + navaja dorada)
  favicon.png               512x512, monograma sobre pizarra redondeada
  apple-touch-icon.png      180x180, igual pero cuadrado (iOS ya redondea)
  og-imagen.jpg             1200x630 para WhatsApp/Facebook al compartir

Reejecutar si cambia el logo:  python scripts/generar-logo-final.py
"""
from PIL import Image, ImageDraw, ImageFilter

FUENTE = "logo-propuesta/logo-final.webp"
PIZARRA = (22, 32, 42, 255)        # --color-tinta
PIZARRA_HONDA = (15, 22, 29, 255)  # --color-tinta-900
CORTE_X = 900                      # el sello acaba antes de x=900

img = Image.open(FUENTE).convert("RGBA")

# El borde lleva restos casi invisibles (alfa 1-5) que ensucian el recorte.
r, g, b, a = img.split()
a = a.point(lambda v: 0 if v < 10 else v)
img = Image.merge("RGBA", (r, g, b, a))


def recortar(im, margen=0):
    caja = im.split()[3].getbbox()
    x0, y0, x1, y1 = caja
    return im.crop((max(x0 - margen, 0), max(y0 - margen, 0), x1 + margen, y1 + margen))


def cuadrado(im):
    lado = max(im.size)
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    lienzo.alpha_composite(im, ((lado - im.width) // 2, (lado - im.height) // 2))
    return lienzo


sello = cuadrado(recortar(img.crop((0, 0, CORTE_X, img.height)), 2))
monograma = recortar(img.crop((CORTE_X, 0, img.width, img.height)), 2)

sello.save("public/logo-sello.png", optimize=True)
sello.save("public/logo-sello.webp", quality=90, method=6)
monograma.save("public/logo-as.png", optimize=True)
monograma.save("public/logo-as.webp", quality=90, method=6)


def icono(tamano, redondear):
    lienzo = Image.new("RGBA", (tamano, tamano), PIZARRA)
    ancho = int(tamano * 0.80)
    m = monograma.resize((ancho, round(ancho * monograma.height / monograma.width)), Image.LANCZOS)
    lienzo.alpha_composite(m, ((tamano - m.width) // 2, (tamano - m.height) // 2))
    if redondear:
        mascara = Image.new("L", (tamano, tamano), 0)
        ImageDraw.Draw(mascara).rounded_rectangle([0, 0, tamano - 1, tamano - 1], int(tamano * 0.22), fill=255)
        lienzo.putalpha(mascara)
    return lienzo


icono(512, True).save("public/favicon.png", optimize=True)
icono(180, False).convert("RGB").save("public/apple-touch-icon.png", optimize=True)

# Imagen para compartir: el sello sobre pizarra, con un halo dorado muy suave.
og = Image.new("RGBA", (1200, 630), PIZARRA_HONDA)
halo = Image.new("RGBA", og.size, (0, 0, 0, 0))
ImageDraw.Draw(halo).ellipse([300, 15, 900, 615], fill=(196, 160, 90, 60))
og.alpha_composite(halo.filter(ImageFilter.GaussianBlur(90)))
s = sello.resize((540, 540), Image.LANCZOS)
og.alpha_composite(s, ((1200 - 540) // 2, (630 - 540) // 2))
og.convert("RGB").save("public/og-imagen.jpg", quality=88)

print("sello", sello.size, "monograma", monograma.size)
