/* Cinematic Deck keyboard isolation and lightweight tonearm sync. */
(function () {
    let timer = null;

    function isOpen() {
        return document.body.classList.contains('cinematic-deck-open');
    }

    function click(selector) {
        document.querySelector(selector)?.click();
    }

    function handleKey(event) {
        if (!isOpen()) return;
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
        if ((event.key === 'Enter' || event.key === ' ') && target instanceof HTMLButtonElement) return;

        const key = event.key.toLowerCase();
        const handled = ['arrowleft', 'arrowright', ' ', 'enter', 'escape', 'f', 'r'].includes(key);
        if (!handled) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (key === 'arrowleft') click('.cinematic-deck__prev');
        if (key === 'arrowright') click('.cinematic-deck__next');
        if (key === ' ' || key === 'enter') click('.cinematic-deck__play');
        if (key === 'escape') click('.cinematic-deck__close');
        if (key === 'f') click('.cinematic-deck__focus');
        if (key === 'r') click('.cinematic-deck__surprise');
    }

    function syncTonearm() {
        const deck = document.querySelector('.cinematic-deck');
        if (!deck || !isOpen()) return;
        const raw = getComputedStyle(deck).getPropertyValue('--deck-progress').trim();
        const progress = Math.max(0, Math.min(1, Number.parseFloat(raw) || 0));
        const angle = deck.classList.contains('is-playing') ? (-22 + progress * 15) : -34;
        deck.style.setProperty('--deck-tonearm-angle', `${angle}deg`);
    }

    function start() {
        if (timer) return;
        syncTonearm();
        timer = window.setInterval(syncTonearm, 420);
    }

    function stop() {
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
    }

    window.addEventListener('keydown', handleKey, true);
    window.setInterval(() => {
        if (isOpen()) start();
        else stop();
    }, 500);
})();
