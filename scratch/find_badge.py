from PIL import Image

img_path = r'g:\projects\Adzio\assets\contractor_website_mockup.png'
img = Image.open(img_path)
width, height = img.size

# Search for the black badge in the bottom-right quadrant (x > 700, y > 700)
# We know the badge is dark grey/black, surrounded by dark grey (9, 13, 17) or (12, 12, 12).
# Let's inspect a grid of pixels to find where it is located.
print("Inspecting bottom-right quadrant:")
for y in range(750, 1024, 25):
    line = []
    for x in range(750, 1024, 25):
        line.append(img.getpixel((x, y)))
    print(f"y={y}: {line}")
