"""Convierte arte/catrina-weave.jpg (la catrina pintada sobre pared crema) en
catrina-mural.webp: pared transparente, cara sólida, bordes que se pierden suave.

    pip install opencv-python-headless numpy scipy pillow
    python3 arte/integrar.py
"""
import cv2, numpy as np
from PIL import Image
from pathlib import Path
AQUI=Path(__file__).parent
S=str(AQUI)+'/'
im=cv2.cvtColor(cv2.imread(S+'catrina-weave.jpg'),cv2.COLOR_BGR2RGB).astype(np.float32)/255
H,W=im.shape[:2]
# color de la pared: mediana de las esquinas claras
muestras=np.concatenate([im[:60,:60].reshape(-1,3),im[-60:,:60].reshape(-1,3),im[:60,-60:].reshape(-1,3),im[-60:,-60:].reshape(-1,3),im[:40,W//2-200:W//2-100].reshape(-1,3)])
claras=muestras[muestras.mean(1)>0.8]
pared=np.median(claras,0); print('pared',(pared*255).round())
d=np.sqrt(((im-pared)**2).sum(2))
d=cv2.GaussianBlur(d,(0,0),1.2)
a=np.clip((d-0.07)/(0.22-0.07),0,1); a=a*a*(3-2*a)
from scipy import ndimage as nd
# huecos chicos dentro de la pintura (puntitos blancos de las mariposas, brillos) son pintura
base=a>0.5
huecos=nd.binary_fill_holes(base)&~base
lab,n=nd.label(huecos); tam=nd.sum(huecos,lab,range(1,n+1))
chicos=np.isin(lab,1+np.where(tam<2500)[0])
a=np.maximum(a,cv2.GaussianBlur(chicos.astype(np.float32),(0,0),1.0))
# lo que está rodeado de pintura (la cara blanca) es pintura, no pared
from scipy import ndimage as nd
# contorno de la cara (medido sobre la vista de 900 px de ancho)
k=W/900
contorno=np.array([(360,175),(450,148),(560,155),(635,205),(668,300),(674,420),(658,520),(640,604),(332,604),(310,520),(304,420),(312,300),(332,225)],np.float32)*k
cara=np.zeros((H,W),np.uint8); cv2.fillPoly(cara,[contorno.astype(np.int32)],255)
a=np.maximum(a,cv2.GaussianBlur(cara.astype(np.float32)/255,(0,0),3.0))
# bordes de la imagen: la pintura se pierde suave, nunca corte recto
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
db=np.minimum.reduce([xx/(W*0.07),(W-1-xx)/(W*0.07),yy/(H*0.06),(H-1-yy)/(H*0.10)])
v=np.clip(db,0,1); v=v*v*(3-2*v)
a*=v
# quitar el tono de pared de los bordes semitransparentes (sin halo)
af=np.maximum(a,1e-3)[...,None]
col=np.clip((im-pared*(1-af))/af,0,1)
col=np.where(a[...,None]>0.02,col,im)
rgba=np.dstack([col,a])
out=Image.fromarray((rgba*255).round().astype(np.uint8),'RGBA')
out=out.resize((1800,round(1800*H/W)),Image.LANCZOS)
out.save(str(AQUI.parent/'catrina-mural.webp'),'WEBP',quality=80,method=6)
print(out.size)
