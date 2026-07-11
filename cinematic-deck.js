/* Cinematic Record Player Experience
   Enable: ?cinematic=1
   Disable: ?cinematic=0
*/
(function () {
    const FLAG_KEY = 'cinematicDeckEnabled';
    const THEME_KEY = 'cinematicDeckTheme';
    const params = new URLSearchParams(window.location.search);

    if (params.get('cinematic') === '1') localStorage.setItem(FLAG_KEY, 'true');
    if (params.get('cinematic') === '0') localStorage.removeItem(FLAG_KEY);
    if (localStorage.getItem(FLAG_KEY) !== 'true') return;

    const state = {
        overlay: null,
        refs: {},
        tracks: [],
        selectedIndex: 0,
        isOpen: false,
        isFocus: false,
        syncTimer: null,
        switchTimer: null,
        lastHistoryKey: '',
        history: [],
        theme: localStorage.getItem(THEME_KEY) || 'midnight'
    };

    function q(selector, root = document) {
        return root.querySelector(selector);
    }

    function qa(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function safeText(value, fallback = '') {
        const text = String(value || '').trim();
        return text || fallback;
    }

    function parsePercent(value) {
        const number = Number.parseFloat(String(value || '').replace('%', ''));
        return Number.isFinite(number) ? clamp(number / 100, 0, 1) : 0;
    }

    function dispatchClick(element) {
        if (!element) return;
        element.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }

    function collectShelfTracks() {
        return qa('#record-shelf-list .shelf-track').map((button, index) => {
            const image = q('.shelf-track-cover', button);
            const title = q('.shelf-track-title', button);
            const artist = q('.shelf-track-artist', button);
            return {
                index,
                uri: button.dataset.trackUri || '',
                image: image?.currentSrc || image?.src || '',
                title: safeText(title?.textContent, `Track ${index + 1}`),
                artist: safeText(artist?.textContent, 'Unknown Artist'),
                source: button,
                kind: 'shelf'
            };
        }).filter((track) => track.uri);
    }

    function collectRankingTracks() {
        return qa('#ranking-list .track-row').map((row, index) => {
            const image = q('img', row);
            const title = q('.font-semibold', row);
            const artist = q('.track-artist', row);
            const play = q('.play-btn', row);
            return {
                index,
                uri: row.dataset.trackUri || play?.dataset.trackUri || '',
                image: image?.currentSrc || image?.src || '',
                title: safeText(title?.textContent, `Track ${index + 1}`),
                artist: safeText(artist?.textContent, 'Unknown Artist'),
                source: row,
                kind: 'ranking'
            };
        }).filter((track) => track.uri);
    }

    function collectTracks() {
        const primary = collectShelfTracks();
        const source = primary.length ? primary : collectRankingTracks();
        const seen = new Set();
        return source.filter((track) => {
            if (!track.uri || seen.has(track.uri)) return false;
            seen.add(track.uri);
            return true;
        }).slice(0, 20);
    }

    function installLauncher() {
        const section = document.getElementById('record-shelf-section');
        if (!section || q('.cinematic-deck-launch', section)) return;

        const launcher = document.createElement('button');
        launcher.type = 'button';
        launcher.className = 'cinematic-deck-launch';
        launcher.textContent = 'Open Cinematic Deck';
        launcher.addEventListener('click', openDeck);

        const shelfList = document.getElementById('record-shelf-list');
        if (shelfList?.parentNode) shelfList.parentNode.insertBefore(launcher, shelfList);
        else section.appendChild(launcher);
    }

    function createOverlay() {
        if (state.overlay) return;

        const overlay = document.createElement('section');
        overlay.className = 'cinematic-deck';
        overlay.dataset.theme = state.theme;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Cinematic record player');
        overlay.innerHTML = `
            <img class="cinematic-deck__backdrop" alt="" aria-hidden="true">
            <div class="cinematic-deck__scrim" aria-hidden="true"></div>
            <div class="cinematic-deck__grain" aria-hidden="true"></div>

            <header class="cinematic-deck__header">
                <div class="cinematic-deck__brand">
                    <span class="cinematic-deck__brand-mark" aria-hidden="true"></span>
                    <div>
                        <div class="cinematic-deck__eyebrow">Listening room</div>
                        <div class="cinematic-deck__brand-title">Cinematic Deck</div>
                    </div>
                </div>
                <div class="cinematic-deck__header-actions">
                    <button class="cinematic-deck__theme-button" data-theme="midnight" type="button">Midnight</button>
                    <button class="cinematic-deck__theme-button" data-theme="amber" type="button">Amber</button>
                    <button class="cinematic-deck__theme-button" data-theme="neon" type="button">Neon</button>
                    <button class="cinematic-deck__icon-button cinematic-deck__close" type="button" aria-label="Close">×</button>
                </div>
            </header>

            <main class="cinematic-deck__main">
                <section class="cinematic-deck__stage" aria-label="Turntable stage">
                    <div class="cinematic-deck__plinth" aria-hidden="true">
                        <div class="cinematic-deck__vinyl">
                            <img class="cinematic-deck__label" alt="">
                            <span class="cinematic-deck__spindle"></span>
                        </div>
                        <div class="cinematic-deck__tonearm">
                            <span class="cinematic-deck__tonearm-pivot"></span>
                            <span class="cinematic-deck__tonearm-bar"></span>
                            <span class="cinematic-deck__cartridge"></span>
                        </div>
                    </div>
                    <div class="cinematic-deck__stage-meta">
                        <div class="cinematic-deck__stage-caption">
                            <div class="cinematic-deck__stage-kicker">Selected cut</div>
                            <div class="cinematic-deck__stage-title">Choose a record</div>
                            <div class="cinematic-deck__stage-artist">Your shelf is loading</div>
                        </div>
                        <div class="cinematic-deck__timecode">00:00 / 00:00</div>
                    </div>
                </section>

                <aside class="cinematic-deck__panel">
                    <div class="cinematic-deck__panel-label">Now on the deck</div>
                    <h2 class="cinematic-deck__now-title">Choose a record</h2>
                    <p class="cinematic-deck__now-artist">Your top tracks become a listening scene.</p>

                    <div class="cinematic-deck__progress">
                        <div class="cinematic-deck__progress-track"><div class="cinematic-deck__progress-fill"></div></div>
                        <div class="cinematic-deck__progress-labels"><span class="cinematic-deck__current-time">0:00</span><span class="cinematic-deck__total-time">0:00</span></div>
                    </div>

                    <div class="cinematic-deck__transport">
                        <button class="cinematic-deck__transport-button cinematic-deck__prev" type="button" aria-label="Previous record">←</button>
                        <button class="cinematic-deck__transport-button cinematic-deck__transport-button--primary cinematic-deck__play" type="button" aria-label="Drop the needle">▶</button>
                        <button class="cinematic-deck__transport-button cinematic-deck__next" type="button" aria-label="Next record">→</button>
                    </div>

                    <div class="cinematic-deck__scene-tools">
                        <button class="cinematic-deck__utility-button cinematic-deck__surprise" type="button">Surprise me</button>
                        <button class="cinematic-deck__utility-button cinematic-deck__focus" type="button">Focus scene</button>
                        <button class="cinematic-deck__utility-button cinematic-deck__share" type="button">Share scene</button>
                        <button class="cinematic-deck__utility-button cinematic-deck__return" type="button">Back to shelf</button>
                    </div>

                    <div class="cinematic-deck__session">
                        <div class="cinematic-deck__session-head">
                            <span class="cinematic-deck__session-title">Session tape</span>
                            <span class="cinematic-deck__session-title cinematic-deck__session-count">0 cuts</span>
                        </div>
                        <div class="cinematic-deck__history" aria-live="polite"></div>
                    </div>
                </aside>
            </main>

            <footer class="cinematic-deck__footer">
                <div class="cinematic-deck__crate-wrap">
                    <div class="cinematic-deck__crate-label">Your record crate</div>
                    <div class="cinematic-deck__crate"></div>
                </div>
                <div class="cinematic-deck__footer-note">← → select · Space play · F focus · Esc close</div>
            </footer>
        `;

        document.body.appendChild(overlay);
        state.overlay = overlay;
        state.refs = {
            backdrop: q('.cinematic-deck__backdrop', overlay),
            label: q('.cinematic-deck__label', overlay),
            stageTitle: q('.cinematic-deck__stage-title', overlay),
            stageArtist: q('.cinematic-deck__stage-artist', overlay),
            nowTitle: q('.cinematic-deck__now-title', overlay),
            nowArtist: q('.cinematic-deck__now-artist', overlay),
            currentTime: q('.cinematic-deck__current-time', overlay),
            totalTime: q('.cinematic-deck__total-time', overlay),
            timecode: q('.cinematic-deck__timecode', overlay),
            play: q('.cinematic-deck__play', overlay),
            focus: q('.cinematic-deck__focus', overlay),
            crate: q('.cinematic-deck__crate', overlay),
            history: q('.cinematic-deck__history', overlay),
            sessionCount: q('.cinematic-deck__session-count', overlay)
        };

        bindOverlayEvents();
        applyTheme(state.theme);
    }

    function bindOverlayEvents() {
        const overlay = state.overlay;
        q('.cinematic-deck__close', overlay).addEventListener('click', closeDeck);
        q('.cinematic-deck__return', overlay).addEventListener('click', closeDeck);
        q('.cinematic-deck__prev', overlay).addEventListener('click', () => selectRelative(-1));
        q('.cinematic-deck__next', overlay).addEventListener('click', () => selectRelative(1));
        q('.cinematic-deck__play', overlay).addEventListener('click', playSelected);
        q('.cinematic-deck__surprise', overlay).addEventListener('click', surpriseMe);
        q('.cinematic-deck__focus', overlay).addEventListener('click', toggleFocus);
        q('.cinematic-deck__share', overlay).addEventListener('click', shareScene);
        qa('.cinematic-deck__theme-button', overlay).forEach((button) => {
            button.addEventListener('click', () => applyTheme(button.dataset.theme));
        });
        window.addEventListener('keydown', handleKeyboard);
    }

    function buildCrate() {
        const crate = state.refs.crate;
        crate.textContent = '';

        if (!state.tracks.length) {
            const empty = document.createElement('div');
            empty.className = 'cinematic-deck__footer-note';
            empty.textContent = 'No records found. Open Shelf Mode after loading your top tracks.';
            crate.appendChild(empty);
            return;
        }

        state.tracks.forEach((track, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'cinematic-deck__record-card';
            button.dataset.index = String(index);
            button.setAttribute('aria-label', `${track.title} - ${track.artist}`);

            const image = document.createElement('img');
            image.src = track.image || 'https://placehold.co/300x300/111111/FFFFFF?text=PLAY';
            image.alt = '';
            image.loading = 'lazy';

            const rank = document.createElement('span');
            rank.className = 'cinematic-deck__record-rank';
            rank.textContent = `#${index + 1}`;

            button.append(image, rank);
            button.addEventListener('click', () => selectTrack(index));
            button.addEventListener('dblclick', () => {
                selectTrack(index);
                playSelected();
            });
            crate.appendChild(button);
        });
    }

    function updateSelectedVisuals() {
        const track = state.tracks[state.selectedIndex];
        qa('.cinematic-deck__record-card', state.refs.crate).forEach((card, index) => {
            card.classList.toggle('is-selected', index === state.selectedIndex);
            card.setAttribute('aria-current', index === state.selectedIndex ? 'true' : 'false');
        });

        if (!track) {
            state.refs.stageTitle.textContent = 'Choose a record';
            state.refs.stageArtist.textContent = 'Your shelf is loading';
            state.refs.nowTitle.textContent = 'Choose a record';
            state.refs.nowArtist.textContent = 'No tracks are available yet.';
            state.refs.backdrop.removeAttribute('src');
            state.refs.label.removeAttribute('src');
            return;
        }

        state.refs.stageTitle.textContent = track.title;
        state.refs.stageArtist.textContent = track.artist;
        state.refs.nowTitle.textContent = track.title;
        state.refs.nowArtist.textContent = track.artist;
        state.refs.backdrop.src = track.image;
        state.refs.label.src = track.image;
        state.refs.label.alt = `${track.title} cover`;

        const selectedCard = q(`.cinematic-deck__record-card[data-index="${state.selectedIndex}"]`, state.refs.crate);
        selectedCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    function selectTrack(index) {
        if (!state.tracks.length) return;
        state.selectedIndex = clamp(index, 0, state.tracks.length - 1);
        state.overlay.classList.add('is-switching');
        window.clearTimeout(state.switchTimer);
        state.switchTimer = window.setTimeout(() => state.overlay?.classList.remove('is-switching'), 360);
        updateSelectedVisuals();
    }

    function selectRelative(delta) {
        if (!state.tracks.length) return;
        const next = (state.selectedIndex + delta + state.tracks.length) % state.tracks.length;
        selectTrack(next);
    }

    function playSelected() {
        const track = state.tracks[state.selectedIndex];
        if (!track) return;

        const section = document.getElementById('record-shelf-section');
        const selectedSource = track.kind === 'shelf' && track.source.classList.contains('is-selected');
        const isPlaying = section?.classList.contains('is-playing');

        if (selectedSource && isPlaying) {
            dispatchClick(document.getElementById('play-pause-btn'));
            return;
        }

        state.overlay.classList.add('is-switching');
        window.clearTimeout(state.switchTimer);
        state.switchTimer = window.setTimeout(() => {
            dispatchClick(track.source);
            state.overlay?.classList.remove('is-switching');
        }, 260);
    }

    function surpriseMe() {
        if (!state.tracks.length) return;
        let next = state.selectedIndex;
        if (state.tracks.length > 1) {
            while (next === state.selectedIndex) next = Math.floor(Math.random() * state.tracks.length);
        }
        selectTrack(next);
        window.setTimeout(playSelected, 420);
    }

    function toggleFocus() {
        state.isFocus = !state.isFocus;
        state.overlay.classList.toggle('is-focus', state.isFocus);
        state.refs.focus.classList.toggle('is-active', state.isFocus);
        state.refs.focus.textContent = state.isFocus ? 'Exit focus' : 'Focus scene';
    }

    function applyTheme(theme) {
        const allowed = ['midnight', 'amber', 'neon'];
        state.theme = allowed.includes(theme) ? theme : 'midnight';
        localStorage.setItem(THEME_KEY, state.theme);
        if (state.overlay) state.overlay.dataset.theme = state.theme;
        qa('.cinematic-deck__theme-button', state.overlay || document).forEach((button) => {
            button.classList.toggle('is-active', button.dataset.theme === state.theme);
        });
    }

    async function shareScene() {
        const track = state.tracks[state.selectedIndex];
        if (!track) return;
        const text = `Now spinning: ${track.title} — ${track.artist}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: 'Cinematic Deck', text, url: window.location.href });
                return;
            }
            await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
            const button = q('.cinematic-deck__share', state.overlay);
            button.textContent = 'Copied';
            window.setTimeout(() => { button.textContent = 'Share scene'; }, 1400);
        } catch (error) {
            console.warn('Cinematic share cancelled or failed:', error);
        }
    }

    function pushHistory(name, artist, image) {
        const key = `${name}|${artist}|${image}`;
        if (!name || name === 'Shelf Mode' || key === state.lastHistoryKey) return;
        state.lastHistoryKey = key;
        state.history = [{ name, artist, image }, ...state.history.filter((item) => `${item.name}|${item.artist}|${item.image}` !== key)].slice(0, 6);
        renderHistory();
    }

    function renderHistory() {
        state.refs.history.textContent = '';
        state.refs.sessionCount.textContent = `${state.history.length} cut${state.history.length === 1 ? '' : 's'}`;
        state.history.forEach((item) => {
            const image = document.createElement('img');
            image.className = 'cinematic-deck__history-item';
            image.src = item.image || 'https://placehold.co/80x80/111111/FFFFFF?text=PLAY';
            image.alt = `${item.name} — ${item.artist}`;
            image.title = image.alt;
            state.refs.history.appendChild(image);
        });
    }

    function syncFromApp() {
        if (!state.isOpen || !state.overlay) return;

        const section = document.getElementById('record-shelf-section');
        const image = document.getElementById('shelf-record-image');
        const name = safeText(document.getElementById('shelf-track-name')?.textContent);
        const artist = safeText(document.getElementById('shelf-track-artist')?.textContent);
        const imageUrl = image?.currentSrc || image?.src || '';
        const progress = parsePercent(document.getElementById('shelf-progress-fill')?.style.width);
        const currentTime = safeText(document.getElementById('current-time')?.textContent, '0:00');
        const totalTime = safeText(document.getElementById('total-time')?.textContent, '0:00');
        const isPlaying = Boolean(section?.classList.contains('is-playing'));

        state.overlay.classList.toggle('is-playing', isPlaying);
        state.overlay.style.setProperty('--deck-progress', String(progress));
        state.refs.play.textContent = isPlaying ? 'Ⅱ' : '▶';
        state.refs.play.setAttribute('aria-label', isPlaying ? 'Pause' : 'Drop the needle');
        state.refs.currentTime.textContent = currentTime;
        state.refs.totalTime.textContent = totalTime;
        state.refs.timecode.textContent = `${currentTime} / ${totalTime}`;

        if (name && name !== 'Shelf Mode') pushHistory(name, artist, imageUrl);
    }

    function startSync() {
        stopSync();
        syncFromApp();
        state.syncTimer = window.setInterval(syncFromApp, 420);
    }

    function stopSync() {
        if (state.syncTimer) window.clearInterval(state.syncTimer);
        state.syncTimer = null;
    }

    function handleKeyboard(event) {
        if (!state.isOpen) return;
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeDeck();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            event.stopPropagation();
            selectRelative(-1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            event.stopPropagation();
            selectRelative(1);
        } else if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            playSelected();
        } else if (event.key.toLowerCase() === 'f') {
            event.preventDefault();
            toggleFocus();
        } else if (event.key.toLowerCase() === 'r') {
            event.preventDefault();
            surpriseMe();
        }
    }

    function openDeck() {
        createOverlay();
        state.tracks = collectTracks();
        buildCrate();

        const activeIndex = state.tracks.findIndex((track) => track.kind === 'shelf' && track.source.classList.contains('is-selected'));
        state.selectedIndex = activeIndex >= 0 ? activeIndex : clamp(state.selectedIndex, 0, Math.max(0, state.tracks.length - 1));
        updateSelectedVisuals();

        state.isOpen = true;
        document.body.classList.add('cinematic-deck-open');
        requestAnimationFrame(() => state.overlay?.classList.add('is-open'));
        startSync();
        window.setTimeout(() => q('.cinematic-deck__play', state.overlay)?.focus(), 320);
    }

    function closeDeck() {
        if (!state.overlay) return;
        state.isOpen = false;
        state.overlay.classList.remove('is-open', 'is-focus');
        state.isFocus = false;
        document.body.classList.remove('cinematic-deck-open');
        stopSync();
    }

    function boot() {
        installLauncher();
        window.CinematicDeck = {
            open: openDeck,
            close: closeDeck,
            refresh: () => {
                state.tracks = collectTracks();
                buildCrate();
                updateSelectedVisuals();
            }
        };
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();
