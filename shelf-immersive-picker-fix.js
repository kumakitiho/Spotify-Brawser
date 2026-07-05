/* Emergency visibility fallback for immersive picker cards. */
(function () {
    const STATE_KEY = '__immersivePickerFixActive';
    if (window[STATE_KEY]) return;
    window[STATE_KEY] = true;

    function patchOverlay() {
        const overlay = document.querySelector('.immersive-picker');
        if (!overlay) return;

        const cards = Array.from(overlay.querySelectorAll('.immersive-picker__card'));
        const empty = overlay.querySelector('.immersive-picker__empty');
        if (cards.length && empty) {
            empty.hidden = true;
            empty.classList.add('is-force-hidden');
        }

        cards.forEach((card) => {
            const cover = card.querySelector('.immersive-picker__cover');
            const sleeve = card.querySelector('.immersive-picker__sleeve');
            const src = cover?.currentSrc || cover?.src || '';
            if (src) {
                card.style.setProperty('--cover-bg', `url("${src}")`);
            }
            if (sleeve) {
                sleeve.style.display = 'block';
            }
            if (cover) {
                cover.style.display = 'block';
                cover.style.opacity = '1';
                cover.style.visibility = 'visible';
            }
        });

        let badge = overlay.querySelector('.immersive-picker__debug-count');
        const stage = overlay.querySelector('.immersive-picker__stage');
        if (stage && !badge) {
            badge = document.createElement('div');
            badge.className = 'immersive-picker__debug-count';
            stage.appendChild(badge);
        }
        if (badge) {
            const visibleCards = cards.filter((card) => card.getAttribute('aria-hidden') !== 'true').length;
            badge.textContent = `records ${cards.length} / visible ${visibleCards}`;
        }
    }

    const observer = new MutationObserver(patchOverlay);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-hidden', 'src', 'hidden'] });

    window.addEventListener('resize', patchOverlay);
    setInterval(patchOverlay, 500);
    patchOverlay();
})();
