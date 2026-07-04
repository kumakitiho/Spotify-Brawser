/* Keeps the decorative tonearm in sync with actual Shelf playback state.
   This layer observes state only; it does not start or stop Spotify playback. */

(function () {
    const MARKER = 'turntableStateGuardApplied';
    const ARM_REST_ANGLE = 0;
    const ARM_PLAY_ANGLE = 18;
    const ARM_PIVOT_X = 710;
    const ARM_PIVOT_Y = 172;

    function getElements() {
        return {
            section: document.getElementById('record-shelf-section'),
            armGroup: document.querySelector('#record-shelf-section .turntable-svg-moving-arm'),
            label: document.getElementById('shelf-state-label')
        };
    }

    function setArmAngle(angle) {
        const { armGroup } = getElements();
        if (!armGroup) return;
        armGroup.setAttribute('transform', `rotate(${angle} ${ARM_PIVOT_X} ${ARM_PIVOT_Y})`);
    }

    function setNeedleState(isPlaying) {
        const { section, label } = getElements();
        if (!section) return;

        section.classList.remove('is-cueing-in', 'is-cueing-out', 'is-needle-lifted', 'is-needle-on-label', 'is-needle-off-record', 'is-needle-on-groove');

        if (isPlaying) {
            section.classList.add('is-needle-on-groove');
            setArmAngle(ARM_PLAY_ANGLE);
            if (label && /NEEDLE OFF|TAP A COVER|READY ON/.test(label.textContent || '')) {
                label.textContent = 'PLAYING ON YOUR SHELF';
            }
            return;
        }

        section.classList.add('is-needle-off-record');
        setArmAngle(ARM_REST_ANGLE);
        if (label && /PLAYING|NEEDLE ON|CUEING/.test(label.textContent || '')) {
            label.textContent = 'READY ON YOUR SHELF';
        }
    }

    function syncFromClass() {
        const { section } = getElements();
        if (!section) return;

        const isPlaying = section.classList.contains('is-playing');
        const needleOnGroove = section.classList.contains('is-needle-on-groove');
        const needleOffRecord = section.classList.contains('is-needle-off-record');
        const cueing = section.classList.contains('is-cueing-in') || section.classList.contains('is-cueing-out');

        if (cueing) return;
        if (isPlaying && !needleOnGroove) setNeedleState(true);
        if (!isPlaying && !needleOffRecord) setNeedleState(false);
    }

    function bind() {
        const { section } = getElements();
        if (!section || section.dataset[MARKER] === 'true') return false;
        section.dataset[MARKER] = 'true';

        const observer = new MutationObserver(() => {
            window.requestAnimationFrame(syncFromClass);
        });

        observer.observe(section, {
            attributes: true,
            attributeFilter: ['class']
        });

        window.addEventListener('focus', syncFromClass);
        window.addEventListener('pageshow', syncFromClass);
        syncFromClass();
        return true;
    }

    function boot() {
        if (bind()) return;

        let tries = 0;
        const timer = window.setInterval(() => {
            tries += 1;
            if (bind() || tries > 40) {
                window.clearInterval(timer);
            }
        }, 120);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
