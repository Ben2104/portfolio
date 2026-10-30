# Assemble real normal-motion interaction screenshots; timing is illustrative, not a performance measurement.
from PIL import Image, ImageDraw
from pathlib import Path
folder = Path(__file__).resolve().parent
frames = []
for name, label in [('desktop-shelf.png', 'SHELF'), ('desktop-open.png', 'OPEN BOOK'), ('desktop-plate.png', 'OVERVIEW / PLATE')]:
    image = Image.open(folder / name).convert('RGB')
    draw = ImageDraw.Draw(image)
    draw.rectangle((12, 12, 400, 42), fill='#171717')
    draw.text((22, 21), label + '  |  NORMAL MOTION - STILL SEQUENCE', fill='white')
    frames.append(image)
frames[0].save(folder / 'interaction.gif', save_all=True, append_images=frames[1:], duration=[1600, 1600, 2200], loop=0, optimize=True)
