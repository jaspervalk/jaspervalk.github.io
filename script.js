document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const cards = document.querySelectorAll('.card');
    const themeToggle = document.querySelector('.theme-toggle');

    const applyTheme = (theme) => {
        const nextTheme = theme === 'light' ? 'light' : 'dark';
        const isLight = nextTheme === 'light';

        root.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);

        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(isLight));
            themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');

            const label = themeToggle.querySelector('.theme-toggle-label');

            if (label) {
                label.textContent = isLight ? 'Light mode' : 'Dark mode';
            }
        }
    };

    const setPageDepth = (clientX, clientY) => {
        const xPercent = (clientX / window.innerWidth) * 100;
        const yPercent = (clientY / window.innerHeight) * 100;
        const shiftX = ((clientX / window.innerWidth) - 0.5) * 18;
        const shiftY = ((clientY / window.innerHeight) - 0.5) * 18;

        root.style.setProperty('--page-mouse-x', `${xPercent}%`);
        root.style.setProperty('--page-mouse-y', `${yPercent}%`);
        root.style.setProperty('--bg-shift-x', `${shiftX}px`);
        root.style.setProperty('--bg-shift-y', `${shiftY}px`);
    };

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    if (themeToggle) {
        applyTheme(root.getAttribute('data-theme'));
        themeToggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    window.addEventListener('pointermove', (event) => {
        setPageDepth(event.clientX, event.clientY);
    }, { passive: true });

    setPageDepth(window.innerWidth * 0.5, window.innerHeight * 0.35);
});
