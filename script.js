// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

const currentTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', function() {
    let theme = htmlElement.getAttribute('data-theme');
    let newTheme = theme === 'light' ? 'dark' : 'light';

    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ===== ANIMATED GRADIENT BACKGROUND =====
const gradientCanvas = document.getElementById('gradient-canvas');
const gradientCtx = gradientCanvas.getContext('2d');

let gradientTime = 0;

function resizeGradientCanvas() {
    gradientCanvas.width = window.innerWidth;
    gradientCanvas.height = window.innerHeight;
}

resizeGradientCanvas();
window.addEventListener('resize', resizeGradientCanvas);

function drawGradient() {
    const width = gradientCanvas.width;
    const height = gradientCanvas.height;

    const isDark = htmlElement.getAttribute('data-theme') === 'dark';

    // Create multiple gradient circles that move
    gradientCtx.clearRect(0, 0, width, height);

    // Gradient 1
    const x1 = width * (0.5 + 0.3 * Math.sin(gradientTime * 0.001));
    const y1 = height * (0.5 + 0.3 * Math.cos(gradientTime * 0.0015));
    const gradient1 = gradientCtx.createRadialGradient(x1, y1, 0, x1, y1, width * 0.6);

    if (isDark) {
        gradient1.addColorStop(0, 'rgba(51, 153, 255, 0.15)');
        gradient1.addColorStop(0.5, 'rgba(131, 56, 236, 0.08)');
        gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
        gradient1.addColorStop(0, 'rgba(0, 102, 255, 0.2)');
        gradient1.addColorStop(0.5, 'rgba(131, 56, 236, 0.1)');
        gradient1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }

    gradientCtx.fillStyle = gradient1;
    gradientCtx.fillRect(0, 0, width, height);

    // Gradient 2
    const x2 = width * (0.3 + 0.2 * Math.cos(gradientTime * 0.0012));
    const y2 = height * (0.7 + 0.2 * Math.sin(gradientTime * 0.0008));
    const gradient2 = gradientCtx.createRadialGradient(x2, y2, 0, x2, y2, width * 0.5);

    if (isDark) {
        gradient2.addColorStop(0, 'rgba(255, 0, 110, 0.12)');
        gradient2.addColorStop(0.5, 'rgba(131, 56, 236, 0.06)');
        gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
        gradient2.addColorStop(0, 'rgba(255, 0, 110, 0.15)');
        gradient2.addColorStop(0.5, 'rgba(131, 56, 236, 0.08)');
        gradient2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }

    gradientCtx.fillStyle = gradient2;
    gradientCtx.fillRect(0, 0, width, height);

    gradientTime += 16;
    requestAnimationFrame(drawGradient);
}

drawGradient();

// ===== PARTICLE NETWORK BACKGROUND =====
const particleCanvas = document.getElementById('particle-canvas');
const particleCtx = particleCanvas.getContext('2d');

let particles = [];
const particleCount = 50;
const maxDistance = 150;

function resizeParticleCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * particleCanvas.width;
        this.y = Math.random() * particleCanvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > particleCanvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > particleCanvas.height) this.vy *= -1;
    }

    draw() {
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        particleCtx.beginPath();
        particleCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        particleCtx.fillStyle = isDark ? 'rgba(51, 153, 255, 0.5)' : 'rgba(0, 102, 255, 0.4)';
        particleCtx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    const isDark = htmlElement.getAttribute('data-theme') === 'dark';

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * 0.3;
                particleCtx.beginPath();
                particleCtx.strokeStyle = isDark
                    ? `rgba(51, 153, 255, ${opacity})`
                    : `rgba(0, 102, 255, ${opacity})`;
                particleCtx.lineWidth = 1;
                particleCtx.moveTo(particles[i].x, particles[i].y);
                particleCtx.lineTo(particles[j].x, particles[j].y);
                particleCtx.stroke();
            }
        }
    }

    requestAnimationFrame(animateParticles);
}

resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);
animateParticles();

// ===== CUSTOM CURSOR =====
const cursorDot = document.querySelector("[data-cursor-dot]");

window.addEventListener("mousemove", function (e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
});

const links = document.querySelectorAll('a, button, .work-item, .education-item, .project-item, .sidebar-toggle, .sidebar-link');

links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
    });

    link.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
});

// ===== 3D TILT EFFECT FOR CARDS =====
const cardItems = document.querySelectorAll('.work-item, .education-item, .project-item');

cardItems.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation angles (more subtle with division by 30 instead of 10)
        // Corrected: rotateX should be negative when mouse is above center (y < centerY)
        const rotateX = -(y - centerY) / 30;
        // rotateY should be positive when mouse is to the right of center (x > centerX)
        const rotateY = (x - centerX) / 30;

        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(1.01, 1.01, 1.01)
        `;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// ===== FADE IN ANIMATIONS =====
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('appear');
            appearOnScroll.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// ===== PARALLAX SCROLL EFFECT =====
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (header) {
        header.style.transform = `translateY(${scrollTop * 0.3}px)`;
    }

    lastScrollTop = scrollTop;
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== TYPEWRITER EFFECT FOR TAGLINE =====
const tagline = document.querySelector('.tagline');
if (tagline) {
    const text = tagline.textContent;
    tagline.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            tagline.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 30);
        }
    }

    setTimeout(typeWriter, 500);
}

// ===== SECTION ANIMATION DELAYS =====
const sections = document.querySelectorAll('section');
sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.1}s`;
});

// ===== SIDEBAR FUNCTIONALITY =====
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
let sidebarHoverTimeout;

function showSidebar() {
    if (!sidebar.classList.contains('active')) {
        clearTimeout(sidebarHoverTimeout);
        sidebar.classList.add('sidebar-hover');
    }
}

function hideSidebar() {
    if (!sidebar.classList.contains('active')) {
        sidebarHoverTimeout = setTimeout(() => {
            sidebar.classList.remove('sidebar-hover');
        }, 300);
    }
}

sidebar.addEventListener('mouseenter', showSidebar);
sidebar.addEventListener('mouseleave', hideSidebar);

sidebarToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const isActive = sidebar.classList.contains('active');

    if (isActive) {
        sidebar.classList.remove('active');
        sidebar.classList.remove('sidebar-hover');
    } else {
        sidebar.classList.add('active');
        sidebar.classList.remove('sidebar-hover');
    }
});

document.addEventListener('click', function(e) {
    if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

const sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            sidebar.classList.remove('active');
        }
    });
});

console.log('✨ Portfolio loaded with enhanced effects');
