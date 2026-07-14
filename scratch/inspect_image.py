from PIL import Image

img_path = r'g:\projects\Adzio\assets\contractor_website_mockup.png'
img = Image.open(img_path)
width, height = img.size
print(f"Dimensions: {width}x{height}")

# Inspect corner colors
corners = [
    (0, 0),
    (width - 1, 0),
    (0, height - 1),
    (width - 1, height - 1)
]
for x, y in corners:
    print(f"Pixel at ({x}, {y}): {img.getpixel((x, y))}")
