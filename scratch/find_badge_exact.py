from PIL import Image

img_path = r'g:\projects\Adzio\assets\contractor_website_mockup.png'
img = Image.open(img_path).convert('RGB')
width, height = img.size

# We will scan the bottom right region (x from 800 to 930, y from 800 to 980)
# The badge contains text and a border. Let's find any pixels that stand out from the dark background (e.g. R > 40 or G > 40)
# and print their coordinates.
active_pixels = []
for y in range(800, 980):
    for x in range(800, 930):
        r, g, b = img.getpixel((x, y))
        # The website background is very dark (around 19, 19, 19).
        # Any pixel with r > 30 or g > 30 or b > 30 is likely part of the badge or text.
        if r > 30 or g > 30 or b > 30:
            active_pixels.append((x, y))

if active_pixels:
    min_x = min(p[0] for p in active_pixels)
    max_x = max(p[0] for p in active_pixels)
    min_y = min(p[1] for p in active_pixels)
    max_y = max(p[1] for p in active_pixels)
    print(f"Badge Bounding Box: x={min_x} to {max_x}, y={min_y} to {max_y}")
else:
    print("No active pixels found.")
