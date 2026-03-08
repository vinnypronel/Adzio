import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# For about-us.html
# Find everything up to the Hero section
header_match = re.search(r'^(.*?)(\s*<!-- Hero Section -->)', html, re.DOTALL)
header = header_match.group(1)

# Modify nav links in header to point to index.html
header = header.replace('href="#home"', 'href="index.html#home"')
header = header.replace('href="#services"', 'href="index.html#services"')
header = header.replace('href="#contact"', 'href="index.html#contact"')
header = header.replace('href="#about"', 'href="about-us.html"')

# Extract About section
about_match = re.search(r'(\s*<!-- About Section -->.*?^\s*</section>)', html, re.DOTALL | re.MULTILINE)
about = about_match.group(1)

# Extract Footer through end
footer_match = re.search(r'(\s*<!-- Footer -->.*)', html, re.DOTALL)
footer = footer_match.group(1)

# Write about-us.html
with open('about-us.html', 'w', encoding='utf-8') as f:
    f.write(header + '\\n    <main style="padding-top: 100px;">' + about + '\\n    </main>' + footer)

# For index.html, remove the about section and modify the nav links
new_index = html.replace(about, '')
new_index = new_index.replace('href="#about"', 'href="about-us.html"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_index)

print("success")
