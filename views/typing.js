document.addEventListener('DOMContentLoaded', function() {
    const element = document.querySelector('.masthead-subheading');
    const texts = ["Welcome To thoughtVine", "Fall in love with your community"];
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let delay = 150;

    function type() {
        const text = texts[currentTextIndex];
        if (isDeleting) {
            element.textContent = text.substring(0, currentCharIndex--);
            if (currentCharIndex < 0) {
                isDeleting = false;
                currentTextIndex = (currentTextIndex + 1) % texts.length;
                delay = 150;
            }
        } else {
            element.textContent = text.substring(0, currentCharIndex++);
            if (currentCharIndex > text.length) {
                isDeleting = true;
                delay = 500;
            }
        }
        setTimeout(type, delay);
    }
    type();
});
