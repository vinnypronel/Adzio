from PIL import Image, ImageDraw

img_path = r'g:\projects\Adzio\assets\contractor_website_mockup.png'
img = Image.open(img_path).convert('RGB')
width, height = img.size

# Target fill color (matches the dark background around it)
# The section background is #090D11. Let's use exactly (9, 13, 17) which is #090D11.
fill_color = (9, 13, 17)

# We will perform flood-fill from the four corners.
# Pillow's ImageDraw.floodfill takes: (image, xy, value, thresh)
# thresh is the tolerance for color matching. Let's use 15.
for corner in [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]:
    ImageDraw.floodfill(img, corner, fill_color, thresh=20)

# Save the updated image
img.save(img_path)
print("Background replacement completed successfully.")
