(() => {
    'use strict';

    const $ = (selector, context = document) => context.querySelector(selector);
    const burger = $('#burger');
    const menu = $('#menu');
    const label = $('#paletteLabel');
    const links = [...document.querySelectorAll('.links a')];

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
                    label.textContent = 'Our Palette';
                }, 1600);
            }
        });
    });
})();
