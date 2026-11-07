"""Convierte arte/catrina-figma.jpg (la catrina pintada sobre pared crema, generada
con Figma IA) en catrina-mural.webp: pared transparente y bordes nítidos, sin
desvanecidos ni sombras (se ven pegados). La cara blanca se mantiene sólida.

    pip install opencv-python-headless numpy scipy pillow
    python3 arte/integrar.py
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as nd

AQUI = Path(__file__).parent
im = cv2.cvtColor(cv2.imread(str(AQUI / 'catrina-figma.jpg')), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
H, W = im.shape[:2]

# color de la pared: las esquinas
esquinas = np.concatenate([im[:80, :80].reshape(-1, 3), im[:80, -80:].reshape(-1, 3),
                           im[-80:, :80].reshape(-1, 3), im[-80:, -80:].reshape(-1, 3)])
pared = np.median(esquinas, 0)
print('pared', (pared * 255).round())

# pintura = lo que se aleja del color de la pared (borde nítido, 1 px de suavizado)
d = np.sqrt(((im - pared) ** 2).sum(2))
pintura = d > 0.09
pintura = nd.binary_opening(pintura, iterations=1)
# quedarse con la figura (el componente grande) y lo que esté cerca de ella (mariposas)
lab, n = nd.label(pintura)
tam = nd.sum(pintura, lab, range(1, n + 1))
pintura = np.isin(lab, 1 + np.where(tam > 400)[0])

# huecos: la cara blanca (y brillos) se rellena; huecos grandes de pared fuera de la cara, no
huecos = nd.binary_fill_holes(pintura) & ~pintura
lab, n = nd.label(huecos)
yy, xx = np.mgrid[0:H, 0:W]
cara = (((xx - 0.51 * W) / (0.15 * W)) ** 2 + ((yy - 0.47 * H) / (0.30 * H)) ** 2) < 1
for i in range(1, n + 1):
    zona = lab == i
    if zona.sum() < 2500 or (zona & cara).sum() > 0.5 * zona.sum():
        pintura |= zona

a = cv2.GaussianBlur(pintura.astype(np.float32), (0, 0), 0.8)
af = np.maximum(a, 1e-3)[..., None]
col = np.clip((im - pared * (1 - af)) / af, 0, 1)
col = np.where(a[..., None] > 0.02, col, im)
out = Image.fromarray((np.dstack([col, a]) * 255).round().astype(np.uint8), 'RGBA')
out = out.crop(out.getbbox())
out.save(AQUI.parent / 'catrina-mural.webp', 'WEBP', quality=84, method=6)
print('catrina-mural.webp', out.size)
