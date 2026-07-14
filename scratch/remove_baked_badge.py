from PIL import Image, ImageDraw

img_path = r'g:\projects\Adzio\assets\contractor_website_mockup.png'
img = Image.open(img_path).convert('RGB')

# Let's inspect the area and paint over the badge
# The website background color is around (19, 19, 19)
bg_color = (19, 19, 19)

# Draw a rectangle covering the badge
# The badge is in the bottom right, roughly between x: 840-990 and y: 840-980
draw = ImageDraw.Draw(img)
draw.rectangle([840, 840, 990, 980], fill=bg_color)

# Save the updated image
img.save(img_path)
print("Badge painted over successfully.")
