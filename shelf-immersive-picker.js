/* Immersive Record Picker MVP.
   Enable with ?immersivePicker=1. Disable with ?immersivePicker=0. */

(function () {
    const ENABLE_KEY = 'immersiveRecordPickerEnabled';
    const params = new URLSearchParams(window.location.search);

    if (params.get('immersivePicker') === '1') {
        localStorage.setItem(ENABLE_KEY, 'true');
    }
    if (params.get('immersivePicker') === '0') {
        localStorage.removeItem(ENABLE_KEY);
    }

    if (localStorage.getItem(ENABLE_KEY) !== 'true') {
        return;
    }

    const state = {
        overlay: null,
        carousel: null,
        stage: null,
        detailImage: null,
        detailRank: null,
        detailTitle: null,
        detailArtist: null,
        selectButton: null,
        tracks: [],
        selectedIndex: 0,
        virtualIndex: 0,
        isOpen: false,
        isDragging: false,
        dragStartX: 0,
        dragStartVirtualIndex: 0,
        lastPointerX: 0,
        lastPointerTime: 0,
        velocity: 0,
        rafId: null
    };

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function qs(selector, root = document) {
        return root.querySelector(selector);
    }

    function qsa(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    }

    function getTrackButtons() {
        return qsa('#record-shelf-list .shelf-track');
    }

    function collectTracks() {
        return getTrackButtons().map((button, index) => {
            const image = qs('.shelf-track-cover', button);
            const title = qs('.shelf-track-title', button);
            const artist = qs('.shelf-track-artist', button);
            return {
                index,
                uri: button.dataset.trackUri || '',
                title: title?.textContent?.trim() || `Track ${index + 1}`,
                artist: artist?.textContent?.trim() || 'Unknown Artist',
                image: image?.currentSrc || image?.src || '',
                button
            };
        }).filter((track) => track.uri && track.image);
    }

    function installLauncher() {
        const section = document.getElementById('record-shelf-section');
        if (!section || qs('.immersive-picker-launch', section)) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'immersive-picker-launch';
        button.textContent = 'レコード棚から選ぶ';
        button.addEventListener('click', openPicker);

        const shelfList = document.getElementById('record-shelf-list');
        if (shelfList?.parentNode) {
            shelfList.parentNode.insertBefore(button, shelfList);
        } else {
            section.appendChild(button);
        }
    }

    function ensureOverlay() {
        if (state.overlay) return state.overlay;

        const overlay = document.createElement('div');
        overlay.className = 'immersive-picker';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'レコード棚から選ぶ');
        overlay.innerHTML = `
            <header class="immersive-picker__topbar">
                <div>
                    <div class="immersive-picker__kicker">Immersive Shelf</div>
                    <h2 class="immersive-picker__title">Pick your record</h2>
                    <p class="immersive-picker__subtitle">ドラッグで棚をめくって、選んだジャケットをターンテーブルへ送ります。</p>
                </div>
                <button class="immersive-picker__close" type="button" aria-label="閉じる">×</button>
            </header>
            <main class="immersive-picker__main">
                <section class="immersive-picker__stage" aria-label="レコード棚">
                    <span class="immersive-picker__horizon" aria-hidden="true"></span>
                    <div class="immersive-picker__carousel"></div>
                    <div class="immersive-picker__empty" hidden>棚に表示できるレコードがまだありません。Shelf Modeでトップ楽曲を取得してください。</div>
                </section>
                <aside class="immersive-picker__detail">
                    <div class="immersive-picker__detail-art-wrap"><img class="immersive-picker__detail-art" alt=""></div>
                    <div>
                        <div class="immersive-picker__detail-rank"></div>
                        <h3 class="immersive-picker__detail-title"></h3>
                        <p class="immersive-picker__detail-artist"></p>
                    </div>
                    <button class="immersive-picker__select" type="button">このレコードをかける</button>
                </aside>
            </main>
            <footer class="immersive-picker__footer">
                <div class="immersive-picker__hint">ドラッグ / ホイール / ← → で選択。Enterで再生、Escで閉じる。</div>
                <div class="immersive-picker__controls">
                    <button class="immersive-picker__nav immersive-picker__nav--prev" type="button" aria-label="前のレコード">←</button>
                    <button class="immersive-picker__nav immersive-picker__nav--next" type="button" aria-label="次のレコード">→</button>
                </div>
            </footer>
        `;

        document.body.appendChild(overlay);
        state.overlay = overlay;
        state.carousel = qs('.immersive-picker__carousel', overlay);
        state.stage = qs('.immersive-picker__stage', overlay);
        state.detailImage = qs('.immersive-picker__detail-art', overlay);
        state.detailRank = qs('.immersive-picker__detail-rank', overlay);
        state.detailTitle = qs('.immersive-picker__detail-title', overlay);
        state.detailArtist = qs('.immersive-picker__detail-artist', overlay);
        state.selectButton = qs('.immersive-picker__select', overlay);

        qs('.immersive-picker__close', overlay).addEventListener('click', closePicker);
        qs('.immersive-picker__nav--prev', overlay).addEventListener('click', () => step(-1));
        qs('.immersive-picker__nav--next', overlay).addEventListener('click', () => step(1));
        state.selectButton.addEventListener('click', playSelected);

        state.stage.addEventListener('pointerdown', onPointerDown);
        state.stage.addEventListener('pointermove', onPointerMove);
        state.stage.addEventListener('pointerup', onPointerUp);
        state.stage.addEventListener('pointercancel', onPointerUp);
        state.stage.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKeyDown);

        return overlay;
    }

    function buildCards() {
        const carousel = state.carousel;
        carousel.innerHTML = '';
        state.tracks.forEach((track, index) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'immersive-picker__card';
            card.dataset.index = String(index);
            card.setAttribute('aria-label', `${track.title} - ${track.artist}`);
            card.innerHTML = `
                <span class="immersive-picker__sleeve">
                    <span class="immersive-picker__vinyl-peek" aria-hidden="true"></span>
                    <img class="immersive-picker__cover" src="${track.image}" alt="">
                    <span class="immersive-picker__rank">#${index + 1}</span>
                    <span class="immersive-picker__card-caption">
                        <span class="immersive-picker__card-title"></span>
                        <span class="immersive-picker__card-artist"></span>
                    </span>
                </span>
            `;
            qs('.immersive-picker__card-title', card).textContent = track.title;
            qs('.immersive-picker__card-artist', card).textContent = track.artist;
            card.addEventListener('click', () => {
                if (Math.abs(state.velocity) > 0.015) return;
                if (state.selectedIndex === index) {
                    playSelected();
                    return;
                }
                selectIndex(index);
            });
            carousel.appendChild(card);
        });
    }

    function renderCards() {
        const total = state.tracks.length;
        const empty = qs('.immersive-picker__empty', state.overlay);
        if (empty) empty.hidden = total > 0;
        state.selectButton.disabled = total === 0;

        const viewport = state.stage?.getBoundingClientRect().width || window.innerWidth;
        const spacing = clamp(viewport * 0.19, 118, 188);

        qsa('.immersive-picker__card', state.carousel).forEach((card) => {
            const index = Number(card.dataset.index);
            const diff = index - state.virtualIndex;
            const abs = Math.abs(diff);
            const hidden = abs > 5.25;
            const x = diff * spacing;
            const z = -Math.min(abs * 60, 260);
            const ry = clamp(diff * -13, -54, 54);
            const scale = Math.max(0.58, 1 - abs * 0.075);
            const opacity = hidden ? 0 : Math.max(0.16, 1 - abs * 0.18);
            const glow = Math.max(0, 1 - abs);
            const blur = abs > 3.5 ? 1.8 : 0;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--z', `${z}px`);
            card.style.setProperty('--ry', `${ry}deg`);
            card.style.setProperty('--s', String(scale));
            card.style.setProperty('--o', String(opacity));
            card.style.setProperty('--glow', String(glow));
            card.style.setProperty('--blur', `${blur}px`);
            card.style.zIndex = String(1000 - Math.round(abs * 100));
            card.setAttribute('aria-hidden', String(hidden));
            card.classList.toggle('is-selected', Math.round(state.virtualIndex) === index);
        });

        renderDetail();
    }

    function renderDetail() {
        const track = state.tracks[state.selectedIndex];
        if (!track) {
            state.detailImage.removeAttribute('src');
            state.detailRank.textContent = 'NO RECORD';
            state.detailTitle.textContent = 'Shelf is empty';
            state.detailArtist.textContent = 'トップ楽曲を取得してください';
            return;
        }

        state.detailImage.src = track.image;
        state.detailImage.alt = `${track.title} のジャケット`;
        state.detailRank.textContent = `SELECTED #${state.selectedIndex + 1}`;
        state.detailTitle.textContent = track.title;
        state.detailArtist.textContent = track.artist;
    }

    function selectIndex(index, { immediate = false } = {}) {
        if (!state.tracks.length) return;
        state.selectedIndex = clamp(index, 0, state.tracks.length - 1);
        if (immediate) {
            state.virtualIndex = state.selectedIndex;
            renderCards();
            return;
        }
        animateToSelected();
    }

    function animateToSelected() {
        cancelAnimationFrame(state.rafId);
        const tick = () => {
            const delta = state.selectedIndex - state.virtualIndex;
            state.virtualIndex += delta * 0.18;
            if (Math.abs(delta) < 0.003) {
                state.virtualIndex = state.selectedIndex;
                renderCards();
                return;
            }
            renderCards();
            state.rafId = requestAnimationFrame(tick);
        };
        tick();
    }

    function step(delta) {
        selectIndex(state.selectedIndex + delta);
    }

    function onPointerDown(event) {
        if (!state.tracks.length) return;
        state.isDragging = true;
        state.dragStartX = event.clientX;
        state.dragStartVirtualIndex = state.virtualIndex;
        state.lastPointerX = event.clientX;
        state.lastPointerTime = performance.now();
        state.velocity = 0;
        state.stage.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    }

    function onPointerMove(event) {
        if (!state.isDragging) return;
        const now = performance.now();
        const viewport = state.stage?.getBoundingClientRect().width || window.innerWidth;
        const spacing = clamp(viewport * 0.19, 118, 188);
        const deltaX = event.clientX - state.dragStartX;
        const nextVirtual = state.dragStartVirtualIndex - (deltaX / spacing);
        const dt = Math.max(16, now - state.lastPointerTime);
        state.velocity = ((state.lastPointerX - event.clientX) / spacing) / dt * 16;
        state.lastPointerX = event.clientX;
        state.lastPointerTime = now;
        state.virtualIndex = clamp(nextVirtual, 0, state.tracks.length - 1);
        state.selectedIndex = Math.round(state.virtualIndex);
        renderCards();
        event.preventDefault();
    }

    function onPointerUp(event) {
        if (!state.isDragging) return;
        state.isDragging = false;
        state.stage.releasePointerCapture?.(event.pointerId);
        const projected = state.virtualIndex + state.velocity * 7;
        selectIndex(Math.round(projected));
    }

    function onWheel(event) {
        if (!state.isOpen || !state.tracks.length) return;
        event.preventDefault();
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        const next = state.virtualIndex + delta / 360;
        state.virtualIndex = clamp(next, 0, state.tracks.length - 1);
        state.selectedIndex = Math.round(state.virtualIndex);
        renderCards();
        clearTimeout(onWheel.snapTimer);
        onWheel.snapTimer = setTimeout(() => selectIndex(state.selectedIndex), 90);
    }

    function onKeyDown(event) {
        if (!state.isOpen) return;
        if (event.key === 'Escape') closePicker();
        if (event.key === 'ArrowLeft') step(-1);
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'Enter') playSelected();
    }

    function openPicker() {
        ensureOverlay();
        state.tracks = collectTracks();
        buildCards();

        const selectedButtonIndex = getTrackButtons().findIndex((button) => button.classList.contains('is-selected'));
        selectIndex(selectedButtonIndex >= 0 ? selectedButtonIndex : 0, { immediate: true });

        state.isOpen = true;
        document.body.classList.add('immersive-picker-open');
        requestAnimationFrame(() => state.overlay.classList.add('is-open'));
    }

    function closePicker() {
        if (!state.overlay) return;
        state.isOpen = false;
        state.overlay.classList.remove('is-open');
        document.body.classList.remove('immersive-picker-open');
    }

    function playSelected() {
        const track = state.tracks[state.selectedIndex];
        if (!track?.button || state.overlay?.classList.contains('is-deploying')) return;
        animateCoverToTurntable(track, () => {
            closePicker();
            track.button.click();
        });
    }

    function animateCoverToTurntable(track, done) {
        const selectedCard = qs(`.immersive-picker__card[data-index="${state.selectedIndex}"] .immersive-picker__cover`, state.overlay);
        const target = document.getElementById('shelf-record-image');
        if (!selectedCard || !target) {
            done();
            return;
        }

        const from = selectedCard.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const clone = document.createElement('img');
        clone.className = 'immersive-picker__fly-cover';
        clone.src = track.image;
        clone.alt = '';
        clone.style.left = `${from.left}px`;
        clone.style.top = `${from.top}px`;
        clone.style.width = `${from.width}px`;
        clone.style.height = `${from.height}px`;
        document.body.appendChild(clone);
        state.overlay.classList.add('is-deploying');

        const scaleX = to.width / from.width;
        const scaleY = to.height / from.height;
        const x = to.left - from.left;
        const y = to.top - from.top;
        requestAnimationFrame(() => {
            clone.style.transform = `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY}) rotate(8deg)`;
            clone.style.opacity = '0.18';
            clone.style.borderRadius = '50%';
        });

        setTimeout(() => {
            clone.remove();
            state.overlay.classList.remove('is-deploying');
            done();
        }, 780);
    }

    function boot() {
        installLauncher();
        const list = document.getElementById('record-shelf-list');
        if (list) {
            new MutationObserver(() => installLauncher()).observe(list, { childList: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
