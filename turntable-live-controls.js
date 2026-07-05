/* Shelf Mode live controls.
   Enabled by default. Disable temporarily with ?shelfControls=0.
   Re-enable with ?shelfControls=1. */

(function () {
    const DISABLED_KEY = 'shelfControlsDisabled';
    const LEGACY_FLAG_KEY = 'shelfControlsEnabled';
    const VOLUME_KEY = 'shelfVolume';
    const CONTROL_SELECTOR = '#record-shelf-section .turntable-control.stop';
    const RING_SELECTOR = '#record-shelf-section .record-progress-ring';
    const PROGRESS_SELECTORS = ['#shelf-progress-fill', '#progress-bar', '#progress-bar-mobile'];

    const params = new URLSearchParams(window.location.search);
    if (params.get('shelfControls') === '1') {
        localStorage.removeItem(DISABLED_KEY);
        localStorage.removeItem(LEGACY_FLAG_KEY);
    }
    if (params.get('shelfControls') === '0') {
        localStorage.setItem(DISABLED_KEY, 'true');
        localStorage.removeItem(LEGACY_FLAG_KEY);
    }

    if (localStorage.getItem(DISABLED_KEY) === 'true') {
        return;
    }

    let spotifyPlayer = null;
    let spotifyNamespace = window.Spotify || null;
    let currentVolume = readVolume();
    let isDraggingVolume = false;
    let lastProgressPercent = -1;

    function clamp(value, min = 0, max = 1) {
        return Math.min(max, Math.max(min, value));
    }

    function readVolume() {
        const stored = Number(localStorage.getItem(VOLUME_KEY));
        return Number.isFinite(stored) ? clamp(stored) : 0.55;
    }

    function saveVolume(value) {
        localStorage.setItem(VOLUME_KEY, String(clamp(value)));
    }

    function getSection() {
        return document.getElementById('record-shelf-section');
    }

    function getVolumeControl() {
        return document.querySelector(CONTROL_SELECTOR);
    }

    function getRing() {
        return document.querySelector(RING_SELECTOR);
    }

    function markFeatureEnabled() {
        getSection()?.classList.add('shelf-live-controls-enabled');
    }

    function capturePlayer(instance) {
        if (!instance) return instance;
        spotifyPlayer = instance;
        window.__shelfSpotifyPlayer = instance;
        applyVolume(currentVolume, { persist: false });
        return instance;
    }

    function wrapSpotifyPlayerConstructor(namespace) {
        if (!namespace || !namespace.Player || namespace.Player.__shelfControlsPatched) {
            return Boolean(spotifyPlayer || window.__shelfSpotifyPlayer);
        }

        const OriginalPlayer = namespace.Player;

        function ShelfControlsPlayer(options) {
            const instance = new OriginalPlayer(options);
            return capturePlayer(instance);
        }

        ShelfControlsPlayer.prototype = OriginalPlayer.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(ShelfControlsPlayer, OriginalPlayer);
        }
        ShelfControlsPlayer.__shelfControlsPatched = true;
        namespace.Player = ShelfControlsPlayer;
        return true;
    }

    function installSpotifyNamespaceCapture() {
        if (wrapSpotifyPlayerConstructor(window.Spotify || spotifyNamespace)) {
            return true;
        }

        const descriptor = Object.getOwnPropertyDescriptor(window, 'Spotify');
        if (descriptor && descriptor.configurable === false) {
            return false;
        }

        try {
            Object.defineProperty(window, 'Spotify', {
                configurable: true,
                enumerable: true,
                get() {
                    return spotifyNamespace;
                },
                set(value) {
                    spotifyNamespace = value;
                    wrapSpotifyPlayerConstructor(spotifyNamespace);
                }
            });
            return true;
        } catch (error) {
            console.warn('Shelf controls could not install Spotify capture:', error);
            return false;
        }
    }

    function ensureStyles() {
        if (document.getElementById('turntable-live-controls-style')) return;

        const style = document.createElement('style');
        style.id = 'turntable-live-controls-style';
        style.textContent = `
            #record-shelf-section .turntable-control.stop.shelf-volume-fader {
                cursor: ns-resize;
                touch-action: none;
                pointer-events: auto;
            }

            #record-shelf-section .turntable-control.stop.shelf-volume-fader::before,
            #record-shelf-section .turntable-control.stop.shelf-volume-fader::after {
                content: none !important;
                display: none !important;
                opacity: 0 !important;
            }

            #record-shelf-section.shelf-live-controls-enabled .reference-match-svg > g:nth-of-type(2) {
                display: none !important;
            }

            #record-shelf-section .shelf-volume-ui {
                position: absolute;
                inset: 0;
                z-index: 6;
                pointer-events: none;
            }

            #record-shelf-section .shelf-volume-label {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 3.5%;
                text-align: center;
                font-family: Inter, Arial, sans-serif;
                font-size: 6px;
                font-weight: 800;
                letter-spacing: .9px;
                color: rgba(17, 21, 20, .46);
                text-shadow: 0 1px 0 rgba(255,255,255,.28);
            }

            #record-shelf-section .shelf-volume-rail {
                position: absolute;
                left: 50%;
                top: 15%;
                bottom: 18%;
                width: 3px;
                transform: translateX(-50%);
                border-radius: 999px;
                background: rgba(12, 18, 14, 0.82);
                box-shadow: 1px 0 0 rgba(255,255,255,.18);
            }

            #record-shelf-section .shelf-volume-fill {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 55%;
                border-radius: inherit;
                background: rgba(29, 185, 84, .44);
            }

            #record-shelf-section .shelf-volume-thumb {
                position: absolute;
                left: 15%;
                top: 40%;
                width: 70%;
                height: 9.5%;
                border-radius: 5px;
                background: linear-gradient(180deg, #eef1e8, #9aa49b 48%, #414943 100%);
                border: 1px solid rgba(35, 42, 38, .78);
                box-shadow: 0 5px 9px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.62);
            }

            #record-shelf-section .shelf-ring-progress {
                position: absolute;
                inset: 0;
                border-radius: 50%;
                pointer-events: none;
                opacity: .58;
                background: conic-gradient(from -90deg, rgba(29,185,84,.42) 0deg, rgba(29,185,84,.42) var(--shelf-progress-deg, 0deg), transparent var(--shelf-progress-deg, 0deg), transparent 360deg);
                -webkit-mask: radial-gradient(circle, transparent 0 88%, #000 88.5% 91%, transparent 91.5% 100%);
                mask: radial-gradient(circle, transparent 0 88%, #000 88.5% 91%, transparent 91.5% 100%);
            }
        `;
        document.head.appendChild(style);
    }

    function ensureVolumeUi() {
        const control = getVolumeControl();
        if (!control) return false;

        control.classList.add('shelf-volume-fader');
        control.setAttribute('role', 'slider');
        control.setAttribute('aria-label', '音量');
        control.setAttribute('aria-valuemin', '0');
        control.setAttribute('aria-valuemax', '100');
        control.tabIndex = 0;

        if (!control.querySelector('.shelf-volume-ui')) {
            const ui = document.createElement('span');
            ui.className = 'shelf-volume-ui';
            ui.setAttribute('aria-hidden', 'true');
            ui.innerHTML = '<span class="shelf-volume-rail"><span class="shelf-volume-fill"></span></span><span class="shelf-volume-thumb"></span><span class="shelf-volume-label">VOL</span>';
            control.appendChild(ui);
        }

        paintVolume();
        return true;
    }

    function paintVolume() {
        const control = getVolumeControl();
        if (!control) return;

        const percent = Math.round(currentVolume * 100);
        control.setAttribute('aria-valuenow', String(percent));
        control.setAttribute('aria-valuetext', `${percent}%`);

        const fill = control.querySelector('.shelf-volume-fill');
        const thumb = control.querySelector('.shelf-volume-thumb');
        if (fill) fill.style.height = `${percent}%`;
        if (thumb) thumb.style.top = `calc(${100 - percent}% - 4.75%)`;
    }

    async function applyVolume(value, { persist = true } = {}) {
        currentVolume = clamp(value);
        if (persist) saveVolume(currentVolume);
        paintVolume();

        const previewAudio = document.getElementById('audio-player');
        if (previewAudio) previewAudio.volume = currentVolume;

        const player = spotifyPlayer || window.__shelfSpotifyPlayer;
        if (player && typeof player.setVolume === 'function') {
            try {
                await player.setVolume(currentVolume);
            } catch (error) {
                console.warn('Shelf volume set failed:', error);
            }
        }
    }

    function volumeFromPointer(event) {
        const control = getVolumeControl();
        if (!control) return currentVolume;
        const rect = control.getBoundingClientRect();
        if (!rect.height) return currentVolume;
        return clamp(1 - ((event.clientY - rect.top) / rect.height));
    }

    function bindVolumeControl() {
        const control = getVolumeControl();
        if (!control || control.dataset.shelfVolumeBound === 'true') return false;

        control.dataset.shelfVolumeBound = 'true';

        control.addEventListener('pointerdown', (event) => {
            isDraggingVolume = true;
            control.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            event.stopPropagation();
            applyVolume(volumeFromPointer(event));
        });

        control.addEventListener('pointermove', (event) => {
            if (!isDraggingVolume) return;
            event.preventDefault();
            event.stopPropagation();
            applyVolume(volumeFromPointer(event));
        });

        const endDrag = (event) => {
            if (!isDraggingVolume) return;
            isDraggingVolume = false;
            control.releasePointerCapture?.(event.pointerId);
            event.preventDefault();
            event.stopPropagation();
            applyVolume(volumeFromPointer(event));
        };

        control.addEventListener('pointerup', endDrag);
        control.addEventListener('pointercancel', endDrag);

        control.addEventListener('keydown', (event) => {
            const step = event.shiftKey ? 0.1 : 0.05;
            if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                event.preventDefault();
                applyVolume(currentVolume + step);
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                event.preventDefault();
                applyVolume(currentVolume - step);
            }
        });

        applyVolume(currentVolume, { persist: false });
        return true;
    }

    function ensureProgressRing() {
        const ring = getRing();
        if (!ring) return false;
        if (!ring.querySelector('.shelf-ring-progress')) {
            const progress = document.createElement('span');
            progress.className = 'shelf-ring-progress';
            ring.appendChild(progress);
        }
        return true;
    }

    function readProgressPercent() {
        for (const selector of PROGRESS_SELECTORS) {
            const node = document.querySelector(selector);
            const width = node?.style?.width || '';
            if (!width.endsWith('%')) continue;
            const value = Number.parseFloat(width);
            if (Number.isFinite(value)) return Math.max(0, Math.min(100, value));
        }
        return 0;
    }

    function paintProgressRing() {
        const ring = getRing();
        if (!ring) return;
        const percent = readProgressPercent();
        if (Math.abs(percent - lastProgressPercent) < 0.1) return;
        lastProgressPercent = percent;
        ring.style.setProperty('--shelf-progress-deg', `${percent * 3.6}deg`);
    }

    function exposeDebugState() {
        window.__shelfLiveControls = {
            enabled: true,
            hasSpotifyNamespace: Boolean(window.Spotify || spotifyNamespace),
            playerCaptured: Boolean(spotifyPlayer || window.__shelfSpotifyPlayer),
            volume: currentVolume,
            progressPercent: lastProgressPercent
        };
    }

    function tick() {
        markFeatureEnabled();
        installSpotifyNamespaceCapture();
        wrapSpotifyPlayerConstructor(window.Spotify || spotifyNamespace);
        ensureStyles();
        ensureVolumeUi();
        bindVolumeControl();
        ensureProgressRing();
        paintProgressRing();
        exposeDebugState();
    }

    function boot() {
        installSpotifyNamespaceCapture();
        tick();
        window.setInterval(tick, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
        installSpotifyNamespaceCapture();
    } else {
        boot();
    }
})();
