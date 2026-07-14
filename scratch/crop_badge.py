from PIL import Image

img_path = r'g:\projects\Adzio\assets\contractor_website_mockup.png'
img = Image.open(img_path)
width, height = img.size

# Crop the region x: 750 to 1024, y: 750 to 1024
region = img.crop((750, 750, width, height))
region.save(r'g:\projects\Adzio\scratch\badge_region.png')
print("Cropped region saved successfully.")
