// TextType - Typing Animation Effect
// Converted from React to vanilla JavaScript

class TextType {
    constructor(element, options = {}) {
        this.element = element;
        this.text = options.text || element.textContent;
        this.typingSpeed = options.typingSpeed || 50;
        this.initialDelay = options.initialDelay || 0;
        this.pauseDuration = options.pauseDuration || 2000;
        this.deletingSpeed = options.deletingSpeed || 30;
        this.loop = options.loop !== undefined ? options.loop : true;
        this.showCursor = options.showCursor !== undefined ? options.showCursor : true;
        this.cursorCharacter = options.cursorCharacter || '|';
        this.cursorBlinkDuration = options.cursorBlinkDuration || 500;
        this.textColor = options.textColor || null;
        this.startOnVisible = options.startOnVisible !== undefined ? options.startOnVisible : true;

        this.textArray = Array.isArray(this.text) ? this.text : [this.text];
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.displayedText = '';
        this.isVisible = !this.startOnVisible;
        this.timeout = null;

        this.init();
    }

    init() {
        // Store original text and clear element
        this.element.textContent = '';
        this.element.classList.add('text-type');

        // Create content span
        this.contentSpan = document.createElement('span');
        this.contentSpan.className = 'text-type__content';
        if (this.textColor) {
            this.contentSpan.style.color = this.textColor;
        }
        this.element.appendChild(this.contentSpan);

        // Create cursor
        if (this.showCursor) {
            this.cursorSpan = document.createElement('span');
            this.cursorSpan.className = 'text-type__cursor';
            this.cursorSpan.textContent = this.cursorCharacter;
            this.element.appendChild(this.cursorSpan);
            this.startCursorBlink();
        }

        // Setup visibility observer
        if (this.startOnVisible) {
            this.setupIntersectionObserver();
        } else {
            this.startTyping();
        }
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isVisible) {
                    this.isVisible = true;
                    setTimeout(() => this.startTyping(), this.initialDelay);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this.element);
    }

    startCursorBlink() {
        // Use CSS animation instead of setInterval for zero JS overhead
        this.cursorSpan.style.animation = `cursorBlink ${this.cursorBlinkDuration * 2}ms step-end infinite`;
    }

    startTyping() {
        this.type();
    }

    type() {
        const currentText = this.textArray[this.currentTextIndex];

        if (this.isDeleting) {
            // Deleting (simpler to just clear for HTML support)
            this.contentSpan.innerHTML = '';
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.textArray.length;
            this.currentCharIndex = 0;
            this.timeout = setTimeout(() => this.type(), this.pauseDuration / 2);
        } else {
            // Typing
            if (this.currentCharIndex < currentText.length) {
                // If we encounter a tag, skip to the end of it
                if (currentText[this.currentCharIndex] === '<') {
                    const tagEnd = currentText.indexOf('>', this.currentCharIndex);
                    if (tagEnd !== -1) {
                        this.currentCharIndex = tagEnd + 1;
                    }
                } else {
                    this.currentCharIndex++;
                }

                this.contentSpan.innerHTML = currentText.slice(0, this.currentCharIndex);
                this.timeout = setTimeout(() => this.type(), this.typingSpeed);
            } else {
                // Done typing
                this.element.classList.add('typing-complete');
                if (this.textArray.length > 1 || this.loop) {
                    this.timeout = setTimeout(() => {
                        this.isDeleting = true;
                        this.type();
                    }, this.pauseDuration);
                }
            }
        }
    }

    destroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}

// Auto-initialize elements with data-text-type attribute
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-text-type]').forEach(el => {
        const text = el.dataset.textType || el.textContent;
        const options = {
            text: text.includes(',') ? text.split(',').map(t => t.trim()) : text,
            typingSpeed: parseInt(el.dataset.typingSpeed) || 50,
            deletingSpeed: parseInt(el.dataset.deletingSpeed) || 30,
            pauseDuration: parseInt(el.dataset.pauseDuration) || 2000,
            loop: el.dataset.loop !== 'false',
            showCursor: el.dataset.showCursor !== 'false',
            cursorCharacter: el.dataset.cursor || '|',
            startOnVisible: el.dataset.startOnVisible !== 'false'
        };
        new TextType(el, options);
    });
});

// Export for manual use
window.TextType = TextType;
