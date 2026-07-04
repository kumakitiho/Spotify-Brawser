/* Turntable playback physics
   Tonearm is no longer draggable. Playback buttons drive an SVG tonearm based on the original mock. */

(function () {
    const ARM_REST_ANGLE = 0;
    const ARM_PLAY_ANGLE = 18;
    const ARM_CUE_MS = 980;
    const NEEDLE_SETTLE_MS = 160;
    const ARM_PIVOT_X = 710;
    const ARM_PIVOT_Y = 172;

    let allowPlaybackButtonClick = false;
    let cueSequenceId = 0;
    let currentArmAngle = ARM_REST_ANGLE;

    function getElements() {
        return {
            section: document.getElementById('record-shelf-section'),
            dropZone: document.querySelector('#record-shelf-section .shelf-drop-zone'),
            armGroup: document.querySelector('#record-shelf-section .turntable-svg-moving-arm'),
            label: document.getElementById('shelf-state-label'),
            playPauseButton: document.getElementById('play-pause-btn')
        };
    }

    function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function ensureSvgTonearm() {
        const { dropZone } = getElements();
        if (!dropZone || dropZone.querySelector('.turntable-svg-arm')) return;

        const svgMarkup = `
            <svg class="turntable-svg-arm" viewBox="0 0 900 665" aria-hidden="true" focusable="false">
                <defs>
                    <linearGradient id="svgArmMetal" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#ffffff"/>
                        <stop offset="0.24" stop-color="#bfc4bf"/>
                        <stop offset="0.46" stop-color="#f4f6ef"/>
                        <stop offset="0.68" stop-color="#929991"/>
                        <stop offset="1" stop-color="#4f5851"/>
                    </linearGradient>
                    <linearGradient id="svgArmTube" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#eef1ea"/>
                        <stop offset="0.22" stop-color="#a7afa8"/>
                        <stop offset="0.48" stop-color="#fbfcf7"/>
                        <stop offset="0.72" stop-color="#7e8780"/>
                        <stop offset="1" stop-color="#414842"/>
                    </linearGradient>
                    <filter id="svgArmShadow" x="-35%" y="-35%" width="170%" height="170%">
                        <feDropShadow dx="3" dy="8" stdDeviation="5" flood-color="#000" flood-opacity="0.38"/>
                    </filter>
                    <filter id="svgSmallShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.30"/>
                    </filter>
                    <filter id="svgNeedleGlow" x="-80%" y="-80%" width="260%" height="260%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#1DB954" flood-opacity="0.70"/>
                        <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#1DB954" flood-opacity="0.32"/>
                    </filter>
                </defs>

                <g filter="url(#svgSmallShadow)">
                    <circle cx="710" cy="172" r="92" fill="#0f1211" stroke="#303532" stroke-width="6"/>
                    <circle cx="710" cy="172" r="83" fill="none" stroke="#747b74" stroke-width="1.5" opacity="0.55"/>
                    <circle cx="710" cy="172" r="71" fill="#d9dbd4" stroke="#4d534f" stroke-width="4" opacity="0.88"/>
                    <circle cx="710" cy="172" r="59" fill="none" stroke="#f8f9f1" stroke-width="1" opacity="0.38"/>
                    <circle cx="710" cy="172" r="50" fill="#b8bbb5" stroke="#4e5550" stroke-width="4"/>
                    <circle cx="710" cy="172" r="32" fill="#eef0ea" stroke="#5c625e" stroke-width="4"/>
                    <circle cx="710" cy="172" r="21" fill="none" stroke="#9ba29a" stroke-width="2" opacity="0.48"/>
                    <circle cx="710" cy="172" r="11" fill="url(#svgArmMetal)" stroke="#2c302e" stroke-width="3"/>
                    <path d="M677 136 C698 122 729 126 746 148" fill="none" stroke="#777e78" stroke-width="10" stroke-linecap="round" opacity=".76"/>
                    <path d="M663 180 C682 210 724 224 756 197" fill="none" stroke="#676e69" stroke-width="10" stroke-linecap="round" opacity=".58"/>
                    <circle cx="648" cy="125" r="7" fill="#262b28"/><circle cx="772" cy="134" r="7" fill="#262b28"/><circle cx="650" cy="220" r="7" fill="#262b28"/>
                    <circle cx="648" cy="125" r="3" fill="#a4aaa4" opacity="0.65"/><circle cx="772" cy="134" r="3" fill="#a4aaa4" opacity="0.65"/><circle cx="650" cy="220" r="3" fill="#a4aaa4" opacity="0.65"/>
                </g>

                <g filter="url(#svgSmallShadow)">
                    <rect x="696" y="55" width="64" height="34" rx="9" fill="url(#svgArmMetal)" stroke="#404541" stroke-width="4"/>
                    <path d="M700 63 H756 M700 73 H756 M700 83 H756" stroke="#616862" stroke-width="2" opacity=".55"/>
                    <path d="M702 58 H752" stroke="#fff" stroke-width="2" opacity=".42"/>
                    <rect x="716" y="87" width="29" height="34" rx="6" fill="url(#svgArmMetal)" stroke="#4e5450" stroke-width="3"/>
                </g>

                <g class="turntable-svg-moving-arm" filter="url(#svgArmShadow)" transform="rotate(0 710 172)">
                    <path d="M710 172 C664 224 665 311 638 407 C622 465 585 523 512 587" fill="none" stroke="#565e58" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" opacity="0.58"/>
                    <path d="M710 172 C664 224 665 311 638 407 C622 465 585 523 512 587" fill="none" stroke="url(#svgArmTube)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M701 183 C666 232 660 314 634 405 C618 459 579 516 506 580" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.63"/>
                    <path d="M717 180 C672 230 671 314 644 410 C630 462 593 520 522 580" fill="none" stroke="#2e3531" stroke-width="2" stroke-linecap="round" opacity="0.36"/>
                    <circle cx="710" cy="172" r="16" fill="url(#svgArmMetal)" stroke="#313632" stroke-width="4"/>
                    <circle cx="710" cy="172" r="7" fill="#6e766f" stroke="#f2f3ee" stroke-width="1" opacity="0.88"/>

                    <g transform="translate(492 571) rotate(-25)">
                        <rect x="-2" y="-2" width="82" height="54" rx="9" fill="#070908" opacity="0.34"/>
                        <rect x="0" y="0" width="78" height="50" rx="8" fill="#1c211f" stroke="#060807" stroke-width="3"/>
                        <path d="M6 7 H67 L74 22 H8 Z" fill="#303833" stroke="#090b0a" stroke-width="2"/>
                        <rect x="9" y="8" width="54" height="11" rx="5" fill="#424a45"/>
                        <path d="M8 41 H68" stroke="#4d5650" stroke-width="2" opacity="0.75"/>
                        <circle cx="18" cy="30" r="5" fill="#d6d8d2"/><circle cx="38" cy="30" r="5" fill="#d6d8d2"/><circle cx="58" cy="30" r="5" fill="#d6d8d2"/>
                        <circle cx="18" cy="30" r="2" fill="#252a27" opacity="0.7"/><circle cx="38" cy="30" r="2" fill="#252a27" opacity="0.7"/><circle cx="58" cy="30" r="2" fill="#252a27" opacity="0.7"/>
                        <path d="M69 42 L91 48" stroke="#111" stroke-width="6" stroke-linecap="round"/>
                        <path class="turntable-svg-needle" d="M71 47 L95 55" stroke="#1DB954" stroke-width="4" stroke-linecap="round" filter="url(#svgNeedleGlow)"/>
                        <circle class="turntable-svg-needle" cx="95" cy="55" r="4" fill="#1DB954" filter="url(#svgNeedleGlow)"/>
                    </g>
                </g>

                <g filter="url(#svgSmallShadow)">
                    <rect x="790" y="171" width="19" height="86" rx="9" fill="#202523" stroke="#111" stroke-width="3" transform="rotate(-18 790 171)"/>
                    <path d="M761 227 L796 276" stroke="#171b19" stroke-width="7" stroke-linecap="round"/>
                    <path d="M763 225 L793 268" stroke="#7a827b" stroke-width="2" stroke-linecap="round" opacity="0.48"/>
                </g>
            </svg>`;

        dropZone.insertAdjacentHTML('beforeend', svgMarkup);
    }

    function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function setSvgArmAngle(angle) {
        currentArmAngle = angle;
        const { armGroup } = getElements();
        armGroup?.setAttribute('transform', `rotate(${angle} ${ARM_PIVOT_X} ${ARM_PIVOT_Y})`);
    }

    function animateSvgArmTo(targetAngle, duration = ARM_CUE_MS) {
        const fromAngle = currentArmAngle;
        const startedAt = performance.now();

        return new Promise((resolve) => {
            function frame(now) {
                const progress = Math.min((now - startedAt) / duration, 1);
                const eased = easeOutCubic(progress);
                const nextAngle = fromAngle + (targetAngle - fromAngle) * eased;
                setSvgArmAngle(nextAngle);

                if (progress < 1) {
                    requestAnimationFrame(frame);
                    return;
                }

                setSvgArmAngle(targetAngle);
                resolve();
            }

            requestAnimationFrame(frame);
        });
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
        setSvgArmAngle(ARM_REST_ANGLE);
        setLabel('CUEING THE NEEDLE');
        await wait(60);

        if (sequenceId !== cueSequenceId) return;
        await animateSvgArmTo(ARM_PLAY_ANGLE);

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
        await animateSvgArmTo(ARM_REST_ANGLE);

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
        ensureSvgTonearm();
        clearCueClasses(section);
        section?.classList.add('is-needle-off-record');
        setSvgArmAngle(ARM_REST_ANGLE);
        bindPlaybackButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind, { once: true });
    } else {
        bind();
    }
})();
