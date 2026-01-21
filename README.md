# Adzio - Marketing Agency Website

A premium, modern marketing agency website built with HTML, CSS, and JavaScript. Features a stunning dark theme with electric cyan accents, smooth animations, and a prominent Video Sales Letter (VSL) section.

## 🚀 Features

- **VSL Hero Section** - Eye-catching video player with animated glow effects
- **Dark Premium Theme** - Sophisticated design with electric cyan and purple accents
- **Smooth Animations** - Scroll-triggered animations, floating elements, and micro-interactions
- **Fully Responsive** - Mobile-first design that looks great on all devices
- **Interactive Elements** - Cursor glow effect, animated counters, and form handling
- **Performance Optimized** - Lazy loading, reduced motion support, and efficient animations

## 📁 Project Structure

```
Adzio/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Main styles
│   └── animations.css  # Animation classes
├── js/
│   └── main.js         # JavaScript functionality
├── assets/
│   └── favicon.svg     # Site favicon
└── README.md           # This file
```

## 🎨 Design System

### Colors
- **Primary Background**: `#0a0a0f` (Deep Black)
- **Secondary Background**: `#111118` (Dark Gray)
- **Accent Primary**: `#00d4ff` (Electric Cyan)
- **Accent Secondary**: `#7c3aed` (Purple)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#a1a1aa` (Light Gray)

### Typography
- **Headings**: Syne (Google Fonts)
- **Body**: Outfit (Google Fonts)

## 🛠️ Getting Started

### Option 1: Open Directly
Simply open `index.html` in your browser.

### Option 2: Local Server
For the best experience, use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## ✏️ Customization

### Replacing the VSL Video

1. Open `js/main.js`
2. Find the `initVSLPlayer` function
3. Replace the YouTube embed URL with your video URL:

```javascript
const videoEmbed = `
    <iframe 
        src="YOUR_VIDEO_URL_HERE?autoplay=1" 
        ...
    ></iframe>
`;
```

### Changing Colors

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --accent-primary: #00d4ff;    /* Change main accent */
    --accent-secondary: #7c3aed;  /* Change secondary accent */
    --bg-primary: #0a0a0f;        /* Change background */
}
```

### Updating Content

All content is in `index.html`. Key sections to customize:
- Hero section (headline, subtitle, stats)
- Services (titles, descriptions, features)
- Results/testimonials
- Contact form fields
- Footer links and social media

### Adding Your Logo

Replace the text logo with an image:

```html
<a href="#" class="nav-logo">
    <img src="assets/your-logo.svg" alt="Adzio" height="40">
</a>
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: Below 480px

## ⚡ Performance Tips

1. **Images**: Use WebP format and proper sizing
2. **Fonts**: Consider self-hosting for faster load times
3. **Video**: Use optimized video formats (MP4 with H.264)
4. **Minify**: Minify CSS and JS for production

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 📝 License

This project is for Adzio. Feel free to customize and use for your business.

## 🤝 Support

For questions or customization help, contact hello@adzio.io

---

Built with ❤️ for Adzio

