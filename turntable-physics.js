/* Turntable playback physics guard
   Prevents tonearm release from starting playback unless the visible needle is actually on the vinyl groove area. */

(function () {
    const READY_DELAY_MS = 80;
    const PLAYABLE_OUTER_RATIO = 0.96;
    const PLAYABLE_INNER_RATIO = 0.43;

    function getElements() {
        return {
            section: document.getElementById('record-shelf-section'),
            tonearm: document.querySelector('#record-shelf-section .tonearm'),
            pipe: document.querySelector('#record-shelf-section .tonearm .tonearm-pipe'),
            disc: document.querySelector('#record-shelf-section .record-disc'),
            label: document.getElementById('shelf-state-label')
        };
    }

    function getCurrentTonearmAngle(tonearm) {
        const raw = tonearm?.style?.getPropertyValue('--tonearm-angle') || '';
        const parsed = Number.parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : -72;
    }

    function getVisibleNeedlePoint({ tonearm, pipe }) {
        if (!tonearm || !pipe) return null;

        const tonearmRect = tonearm.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();
        const angle = getCurrentTonearmAngle(tonearm);
        const radians = angle * Math.PI / 180;

        // The pivot is the right-center of the pipe. The CSS headshell sits a little beyond
        // the pipe's left edge, so use the rendered pipe length plus a small visual stylus offset.
        const pivotX = pipeRect.right;
        const pivotY = pipeRect.top + pipeRect.height / 2;
        const armLength = pipeRect.width * 1.22;
        const stylusDrop = tonearmRect.height * 0.018;

        return {
            x: pivotX - Math.cos(radians) * armLength,
            y: pivotY - Math.sin(radians) * armLength + stylusDrop
        };
    }

    function getNeedleState() {
        const elements = getElements();
        const needle = getVisibleNeedlePoint(elements);
        const discRect = elements.disc?.getBoundingClientRect();

        if (!needle || !discRect?.width) {
            return { state: 'off-record', distanceRatio: Infinity };
        }

        const centerX = discRect.left + discRect.width / 2;
        const centerY = discRect.top + discRect.height / 2;
        const radius = discRect.width / 2;
        const distanceRatio = Math.hypot(needle.x - centerX, needle.y - centerY) / radius;

        let state = 'groove';
        if (distanceRatio > PLAYABLE_OUTER_RATIO) {
            state = 'off-record';
        } else if (distanceRatio < PLAYABLE_INNER_RATIO) {
            state = 'label';
        }

        return { state, distanceRatio, needle };
    }

    function setNeedleClasses(state) {
        const { section } = getElements();
        if (!section) return;

        section.classList.toggle('is-needle-on-groove', state === 'groove');
        section.classList.toggle('is-needle-on-label', state === 'label');
        section.classList.toggle('is-needle-off-record', state === 'off-record');
    }

    function updateNeedleStatusText(state) {
        const { label } = getElements();
        if (!label) return;

        if (state === 'groove') {
            label.textContent = 'NEEDLE ON THE GROOVE';
        } else if (state === 'label') {
            label.textContent = 'THE LABEL DOES NOT PLAY';
        } else {
            label.textContent = 'NEEDLE OFF THE RECORD';
        }
    }

    function pauseIfNeedleIsNotOnGroove() {
        const { state } = getNeedleState();
        setNeedleClasses(state);

        if (state === 'groove') return;

        const audio = document.getElementById('audio-player');
        if (audio && !audio.paused) {
            audio.pause();
        }

        if (window.player?.pause) {
            window.player.pause().catch(() => {});
        }

        const section = document.getElementById('record-shelf-section');
        section?.classList.remove('is-playing');
        updateNeedleStatusText(state);
    }

    function blockInvalidTonearmRelease(event) {
        const { tonearm } = getElements();
        if (!tonearm) return;

        const targetIsTonearm = event.target === tonearm || tonearm.contains(event.target);
        const pointerWasCaptured = typeof tonearm.hasPointerCapture === 'function'
            && event.pointerId !== undefined
            && tonearm.hasPointerCapture(event.pointerId);

        if (!targetIsTonearm && !pointerWasCaptured) return;

        const { state } = getNeedleState();
        setNeedleClasses(state);

        if (state === 'groove') return;

        event.preventDefault();
        event.stopImmediatePropagation();
        window.setTimeout(pauseIfNeedleIsNotOnGroove, READY_DELAY_MS);
    }

    function observePlaybackPhysics() {
        window.setInterval(() => {
            const { section } = getElements();
            if (!section?.classList.contains('is-playing')) return;
            pauseIfNeedleIsNotOnGroove();
        }, 350);
    }

    function bind() {
        document.addEventListener('pointermove', () => {
            const { state } = getNeedleState();
            setNeedleClasses(state);
        }, true);

        document.addEventListener('pointerup', blockInvalidTonearmRelease, true);
        document.addEventListener('pointercancel', blockInvalidTonearmRelease, true);
        observePlaybackPhysics();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind, { once: true });
    } else {
        bind();
    }
})();
