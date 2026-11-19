(() => {
    'use strict';

    const $ = (selector, context = document) => context.querySelector(selector);
    const burger = $('#burger');
    const menu = $('#menu');
    const visual = $('#visual');
    const label = $('#paletteLabel');
    const links = [...document.querySelectorAll('.links a')];
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile navigation menu toggle
    const setMenu = open => {
        if (!menu || !burger) return;
        menu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    if (burger && menu) {
        burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') setMenu(false);
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) setMenu(false);
        });
    }

    // Active navigation link switching
    links.forEach(a => {
        a.addEventListener('click', () => {
            links.forEach(link => link.classList.remove('active'));
            a.classList.add('active');
            setMenu(false);
        });
    });

    // Clipboard copy utility with fallback for non-secure / local contexts
    const copyToClipboard = async text => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch { }

        try {
            const temp = document.createElement('textarea');
            temp.value = text;
            temp.style.position = 'fixed';
            temp.style.opacity = '0';
            temp.style.pointerEvents = 'none';
            document.body.appendChild(temp);
            temp.focus();
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            return true;
        } catch {
            return false;
        }
    };

    // Palette dots interactive copy
    let feedbackTimer;
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', async () => {
            const hex = dot.dataset.hex;
            if (!hex) return;
            await copyToClipboard(hex);
            if (label) {
                label.textContent = `${hex} copied!`;
                clearTimeout(feedbackTimer);
                feedbackTimer = setTimeout(() => {
                    label.textContent = 'Your Palette';
                }, 1600);
            }
        });
    });

    // 3D ribbon interactive mouse parallax (desktop only)
    if (!reduceMotion && visual && matchMedia('(hover: hover)').matches) {
        window.addEventListener('mousemove', e => {
            const px = ((e.clientX / window.innerWidth - 0.5) * 16).toFixed(1) + 'px';
            const py = ((e.clientY / window.innerHeight - 0.5) * 12).toFixed(1) + 'px';
            visual.style.setProperty('--px', px);
            visual.style.setProperty('--py', py);
        });
    }

    // Smooth scroll button
    const scrollBtn = $('#scrollBtn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            window.scrollBy({
                top: window.innerHeight * 0.85,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        });
    }
})();
