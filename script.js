window.__portfolioScript = 'loaded';

const initPortfolio = () => {
    window.__portfolioScript = 'initialised';
    const root = document.documentElement;
    const cards = document.querySelectorAll('.card');
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // --- Project tile preview: only enable hover-bg when the image loads ---
    document.querySelectorAll('.project-tile[data-preview]').forEach((tile) => {
        const src = tile.getAttribute('data-preview');
        if (!src) return;
        const pos = tile.getAttribute('data-preview-position');
        const probe = new Image();
        probe.onload = () => {
            const bg = tile.querySelector('.project-tile-bg');
            if (bg) {
                bg.style.backgroundImage = `url("${src}")`;
                if (pos) bg.style.setProperty('--preview-pos', pos);
            }
            tile.classList.add('has-preview');
        };
        probe.onerror = () => {
            // Silent: tile stays in text-only fallback state.
        };
        probe.src = src;
    });

    // --- Scroll reveal ---
    // Default state in CSS = visible. We opt-in to the hidden+animate state
    // by toggling .js-reveal on <html> here. If JS errors before this point,
    // content remains visible.
    const revealTargets = document.querySelectorAll('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
    } else {
        root.classList.add('js-reveal');
        // Reveal anything already in the initial viewport immediately
        // so above-the-fold content doesn't fade in unnecessarily.
        revealTargets.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.95) {
                el.classList.add('is-visible');
            }
        });
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        revealTargets.forEach((el) => {
            if (!el.classList.contains('is-visible')) revealObserver.observe(el);
        });
        // Safety net: if anything is still hidden after 2.5s, reveal it.
        setTimeout(() => {
            revealTargets.forEach((el) => el.classList.add('is-visible'));
        }, 2500);
    }

    // --- Stat count-up ---
    const formatNumber = (n, opts) => {
        const decimals = opts.decimals || 0;
        let str = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
        if (opts.format === 'comma') {
            const [intPart, decPart] = str.split('.');
            const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            str = decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
        }
        return `${opts.prefix || ''}${str}`;
    };

    const animateCount = (el) => {
        const target = parseFloat(el.dataset.target);
        if (isNaN(target)) return;
        const numEl = el.querySelector('.stat-num');
        if (!numEl) return;

        const opts = {
            prefix: el.dataset.prefix || '',
            decimals: parseInt(el.dataset.decimals || '0', 10),
            format: el.dataset.format || ''
        };
        const finalText = numEl.textContent;
        const duration = 1100;
        const start = performance.now();

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            const value = target * eased;
            numEl.textContent = formatNumber(value, opts);
            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                numEl.textContent = finalText; // snap to original for accuracy
            }
        };
        requestAnimationFrame(tick);
    };

    // --- Interactive product demo ---
    // Trigger once on viewport entry. Stagger via CSS keyframes; numbers count up via JS.
    const formatEUR = (n) => {
        const rounded = Math.round(n);
        return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const animateDemoCount = (el, startDelayMs, durationMs) => {
        const target = parseFloat(el.dataset.count);
        if (isNaN(target)) return;
        const prefix = el.dataset.prefix || '';
        const startAt = performance.now() + startDelayMs;

        const tick = (now) => {
            if (now < startAt) {
                requestAnimationFrame(tick);
                return;
            }
            const t = Math.min(1, (now - startAt) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            const value = target * eased;
            el.textContent = prefix + formatEUR(value);
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = prefix + formatEUR(target);
        };
        requestAnimationFrame(tick);
    };

    const finalizeDemo = (frame) => {
        frame.querySelectorAll('[data-count]').forEach((el) => {
            const target = parseFloat(el.dataset.count);
            if (!isNaN(target)) {
                el.textContent = (el.dataset.prefix || '') + formatEUR(target);
            }
        });
    };

    document.querySelectorAll('[data-demo]').forEach((frame) => {
        if (frame.dataset.demoStarted === '1') return;

        const start = () => {
            if (frame.dataset.demoStarted === '1') return;
            frame.dataset.demoStarted = '1';

            if (prefersReducedMotion) {
                frame.classList.add('is-running');
                finalizeDemo(frame);
                return;
            }

            frame.classList.add('is-running');

            // Counts begin when each result line finishes its fade-in.
            // Fade-in starts at: line0=2200ms, line1=2400ms, line2=2600ms, total=3200ms
            // Each count takes ~700ms with easeOutCubic.
            const values = frame.querySelectorAll('.demo-pane--output .demo-line-value[data-count]');
            if (values[0]) animateDemoCount(values[0], 2300, 800);
            if (values[1]) animateDemoCount(values[1], 2500, 800);
            if (values[2]) animateDemoCount(values[2], 2700, 800);

            const total = frame.querySelector('.demo-total-value[data-count]');
            if (total) animateDemoCount(total, 3300, 900);
        };

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        start();
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.35 });
            obs.observe(frame);
        } else {
            // Old browser: just play it.
            start();
        }
    });

    const statTargets = document.querySelectorAll('.stat-value[data-target]');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        // leave the static values in place
    } else {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        statTargets.forEach((el) => countObserver.observe(el));
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
    initPortfolio();
}
