/* Turntable playback physics
   Tonearm is no longer draggable. Playback buttons drive the cueing animation. */

(function () {
    const ARM_REST_ANGLE = -88;
    const ARM_PLAY_ANGLE = -60;
    const ARM_CUE_MS = 980;
    const NEEDLE_SETTLE_MS = 160;

    let allowPlaybackButtonClick = false;
    let cueSequenceId = 0;

    function getElements() {
        return {
            section: document.getElementById('record-shelf-section'),
            tonearm: document.querySelector('#record-shelf-section .tonearm'),
            pipe: document.querySelector('#record-shelf-section .tonearm .tonearm-pipe'),
            label: document.getElementById('shelf-state-label'),
            playPauseButton: document.getElementById('play-pause-btn')
        };
    }

    function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function setTonearmAngle(angle) {
        const { tonearm } = getElements();
        tonearm?.style.setProperty('--tonearm-angle', angle + 'deg');
    }

    function setLabel(text) {
        const { label } = getElements();
        if (label) label.textContent = text;
    }

    function clearCueClasses(section) {
        section?.classList.remove('is-cueing-in', 'is-cueing-out', 'is-needle-lifted', 'is-needle-on-label', 'is-needle-off-record', 'is-needle-on-groove');
    }

    async function cueInThenRunOriginal(button) {
        const { section } = getElements();
        const sequenceId = ++cueSequenceId;

        clearCueClasses(section);
        section?.classList.add('is-needle-lifted', 'is-cueing-in');
        setTonearmAngle(ARM_REST_ANGLE);
        setLabel('CUEING THE NEEDLE');
        await wait(60);

        if (sequenceId !== cueSequenceId) return;
        setTonearmAngle(ARM_PLAY_ANGLE);
        await wait(ARM_CUE_MS);

        if (sequenceId !== cueSequenceId) return;
        section?.classList.remove('is-cueing-in', 'is-needle-lifted');
        section?.classList.add('is-needle-on-groove');
        setLabel('NEEDLE ON THE GROOVE');
        await wait(NEEDLE_SETTLE_MS);

        if (sequenceId !== cueSequenceId) return;
        allowPlaybackButtonClick = true;
        button.click();
        allowPlaybackButtonClick = false;
    }

    async function runOriginalThenCueOut(button) {
        const { section } = getElements();
        const sequenceId = ++cueSequenceId;

        allowPlaybackButtonClick = true;
        button.click();
        allowPlaybackButtonClick = false;

        clearCueClasses(section);
        section?.classList.add('is-needle-lifted', 'is-cueing-out');
        setLabel('LIFTING THE NEEDLE');
        await wait(NEEDLE_SETTLE_MS);

        if (sequenceId !== cueSequenceId) return;
        setTonearmAngle(ARM_REST_ANGLE);
        await wait(ARM_CUE_MS);

        if (sequenceId !== cueSequenceId) return;
        section?.classList.remove('is-cueing-out', 'is-needle-lifted');
        section?.classList.add('is-needle-off-record');
        setLabel('NEEDLE OFF THE RECORD');
    }

    function handlePlaybackButtonClick(event) {
        if (allowPlaybackButtonClick) return;

        const { section } = getElements();
        const button = event.currentTarget;
        const isCurrentlyPlaying = section?.classList.contains('is-playing');

        event.preventDefault();
        event.stopImmediatePropagation();

        if (isCurrentlyPlaying) {
            runOriginalThenCueOut(button);
            return;
        }

        cueInThenRunOriginal(button);
    }

    function bindPlaybackButton() {
        const { playPauseButton } = getElements();
        if (!playPauseButton || playPauseButton.dataset.turntableCueBound === 'true') return;
        playPauseButton.dataset.turntableCueBound = 'true';
        playPauseButton.addEventListener('click', handlePlaybackButtonClick, true);
    }

    function bind() {
        const { section } = getElements();
        clearCueClasses(section);
        section?.classList.add('is-needle-off-record');
        setTonearmAngle(ARM_REST_ANGLE);
        bindPlaybackButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind, { once: true });
    } else {
        bind();
    }
})();
