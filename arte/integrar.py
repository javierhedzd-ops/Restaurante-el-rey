"""Exporta la catrina del nicho de la portada.

arte/catrina-weave.jpg es el mural del local repintado con Weave (Nano Banana Pro).
La página la muestra dentro de un nicho de arco (`.muro`, `background-size: cover`),
así que solo hace falta reducirla y pasarla a WebP:

    pip install pillow
    python3 arte/integrar.py
"""
from pathlib import Path
from PIL import Image

AQUI = Path(__file__).parent
im = Image.open(AQUI / 'catrina-weave.jpg').convert('RGB')
im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
im.save(AQUI.parent / 'catrina-nicho.webp', 'WEBP', quality=82, method=6)
print('catrina-nicho.webp', im.size)
