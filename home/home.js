(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const burger = $('#burger'), menu = $('#menu'), visual = $('#visual');
    const label = $('#paletteLabel'), links = [...document.querySelectorAll('.links a')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // mobile menu
    const setMenu = open => {
        menu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open);
    };
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    document.addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
    addEventListener('resize', () => innerWidth > 900 && setMenu(false));

    // active nav link
    links.forEach(a => a.addEventListener('click', () => {
        links.forEach(l => l.classList.remove('active'));
        a.classList.add('active');
        setMenu(false);
    }));

    // palette dots: click to copy hex
    let timer;
    document.querySelectorAll('.dot').forEach(dot => dot.addEventListener('click', () => {
        const hex = dot.dataset.hex;
        navigator.clipboard?.writeText(hex).catch(() => { });
        label.textContent = hex + ' copied';
        clearTimeout(timer);
        timer = setTimeout(() => (label.textContent = 'Your Palette'), 1500);
    }));

    // ribbon parallax (mouse devices only)
    if (!reduce && matchMedia('(hover: hover)').matches) {
        addEventListener('mousemove', e => {
            visual.style.setProperty('--px', ((e.clientX / innerWidth - .5) * 16).toFixed(1) + 'px');
            visual.style.setProperty('--py', ((e.clientY / innerHeight - .5) * 12).toFixed(1) + 'px');
        });
    }

    // scroll-down button
    $('#scrollBtn').addEventListener('click', () =>
        scrollBy({ top: innerHeight * .9, behavior: reduce ? 'auto' : 'smooth' }));
})();