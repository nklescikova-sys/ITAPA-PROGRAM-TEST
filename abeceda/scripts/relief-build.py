"""
Vygeneruje 3D (tieňovanú) mapu Slovenska public/images/mapa-reliefu.webp
z verejných výškových údajov (AWS Terrain Tiles / Mapzen, zdroj SRTM a ďalšie
otvorené dáta – https://registry.opendata.aws/terrain-tiles/).

Potrebné: python3, numpy, pillow a súbor ne_10m_admin_0_countries.geojson
(Natural Earth, návod v scripts/map-build.ts).

  python3 scripts/relief-build.py geo/

Projekcia zodpovedá src/content/map-projection.ts (viewBox 400 × 210).
Aplikácia sama nič nesťahuje – výsledný obrázok je súčasťou aplikácie.
"""
import io, json, math, os, sys, urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GEO = sys.argv[1] if len(sys.argv) > 1 else 'geo'
OUT = 'public/images/mapa-reliefu.webp'
Z = 9                      # úroveň priblíženia dlaždíc
SCALE = 5                  # výstup = 5 × viewBox (2000 × 1050 px)

# --- rovnaká projekcia ako map-projection.ts ---
W, H = 400, 210
WEST, EAST, SOUTH, NORTH = 16.75, 22.65, 47.68, 49.66
K = math.cos(math.radians(48.7))
PAD = 6
spanX, spanY = (EAST - WEST) * K, NORTH - SOUTH
S = min((W - 2 * PAD) / spanX, (H - 2 * PAD) / spanY)
OX, OY = (W - spanX * S) / 2, (H - spanY * S) / 2
def project(lon, lat):
    return OX + (lon - WEST) * K * S, OY + (NORTH - lat) * S

# --- stiahnutie dlaždíc ---
def tile_xy(lon, lat):
    n = 2 ** Z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y
x0, y0 = map(int, tile_xy(WEST - 0.1, NORTH + 0.1))
x1, y1 = map(int, tile_xy(EAST + 0.1, SOUTH - 0.1))
cache = os.path.join(GEO, 'tiles'); os.makedirs(cache, exist_ok=True)
mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), dtype=np.float32)
for ty in range(y0, y1 + 1):
    for tx in range(x0, x1 + 1):
        f = os.path.join(cache, f'{Z}-{tx}-{ty}.png')
        if not os.path.exists(f):
            url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png'
            with urllib.request.urlopen(url, timeout=60) as r, open(f, 'wb') as o:
                o.write(r.read())
        a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
        elev = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768   # Terrarium kódovanie
        mosaic[(ty - y0) * 256:(ty - y0 + 1) * 256, (tx - x0) * 256:(tx - x0 + 1) * 256] = elev

# --- preprojekcia do mapy ---
ow, oh = W * SCALE, H * SCALE
px, py = np.meshgrid(np.arange(ow) + 0.5, np.arange(oh) + 0.5)
lon = WEST + (px / SCALE - OX) / (K * S)
lat = NORTH - (py / SCALE - OY) / S
n = 2 ** Z
mx = ((lon + 180) / 360 * n - x0) * 256
my = ((1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * n - y0) * 256
# bilineárne vzorkovanie
mx0 = np.clip(np.floor(mx).astype(int), 0, mosaic.shape[1] - 2); fx = np.clip(mx - mx0, 0, 1)
my0 = np.clip(np.floor(my).astype(int), 0, mosaic.shape[0] - 2); fy = np.clip(my - my0, 0, 1)
e = (mosaic[my0, mx0] * (1 - fx) * (1 - fy) + mosaic[my0, mx0 + 1] * fx * (1 - fy)
     + mosaic[my0 + 1, mx0] * (1 - fx) * fy + mosaic[my0 + 1, mx0 + 1] * fx * fy)
e = np.maximum(e, 0)

# --- tieňovanie (svetlo zo severozápadu) ---
cell = (1 / (K * S * SCALE)) * 111320 * K       # veľkosť pixelu v metroch
gy, gx = np.gradient(e, cell)
exag = 2.2                                      # prevýšenie, aby boli hory výraznejšie
slope = np.arctan(exag * np.hypot(gx, gy))
aspect = np.arctan2(-gx, gy)
az, alt = math.radians(315), math.radians(45)
shade = (math.sin(alt) * np.cos(slope) + math.cos(alt) * np.sin(slope) * np.cos(az - aspect + math.pi / 2))
shade = np.clip(shade, 0, 1)

# --- farby podľa nadmorskej výšky (pastelové, ako v zošite) ---
stops = [(0, (170, 212, 138)), (160, (184, 218, 146)), (280, (222, 230, 168)), (450, (244, 236, 186)),
         (750, (242, 222, 172)), (1100, (232, 196, 142)), (1600, (214, 160, 108)), (2100, (190, 132, 98)),
         (2600, (240, 236, 230))]
lev = np.array([s[0] for s in stops], dtype=np.float32)
rgb = np.stack([np.interp(e, lev, [s[1][i] for s in stops]) for i in range(3)], axis=-1)
light = 1.0 + 0.75 * (shade - math.sin(alt))     # rovina = 1.0, svahy tmavšie/svetlejšie
rgb = np.clip(rgb * light[..., None], 0, 255)

# --- orezanie na územie Slovenska ---
countries = json.load(open(os.path.join(GEO, 'ne_10m_admin_0_countries.geojson'), encoding='utf-8'))
svk = next(f for f in countries['features'] if f['properties'].get('ADM0_A3') == 'SVK')
ring = [project(lo, la) for lo, la in svk['geometry']['coordinates'][0]]
mask = Image.new('L', (ow, oh), 0)
ImageDraw.Draw(mask).polygon([(x * SCALE, y * SCALE) for x, y in ring], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(0.8))
img = Image.fromarray(rgb.astype(np.uint8), 'RGB').convert('RGBA')
img.putalpha(mask)
img.save(OUT, 'WEBP', quality=82, method=6)
print('✔', OUT, img.size, f'{os.path.getsize(OUT) // 1024} kB')
