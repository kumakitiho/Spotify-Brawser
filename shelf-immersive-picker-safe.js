/* Safe record picker. */
(function () {
    const key = 'immersiveRecordPickerEnabled';
    const params = new URLSearchParams(location.search);
    if (params.get('immersivePicker') === '1') localStorage.setItem(key, 'true');
    if (params.get('immersivePicker') === '0') localStorage.removeItem(key);
    if (localStorage.getItem(key) !== 'true') return;

    let overlay;
    let grid;
    let status;

    function q(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qa(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function getTracks() {
        return qa('#record-shelf-list .shelf-track').map(function (button, index) {
            const image = q('.shelf-track-cover', button);
            const title = q('.shelf-track-title', button);
            const artist = q('.shelf-track-artist', button);
            return {
                index: index,
                button: button,
                uri: button.dataset.trackUri || '',
                image: image ? (image.currentSrc || image.src || '') : '',
                title: title ? title.textContent.trim() : 'Track ' + (index + 1),
                artist: artist ? artist.textContent.trim() : 'Unknown Artist'
            };
        }).filter(function (track) { return track.uri; });
    }

    function installLauncher() {
        const section = document.getElementById('record-shelf-section');
        if (!section || q('.immersive-picker-launch', section)) return;
        const launch = document.createElement('button');
        launch.type = 'button';
        launch.className = 'immersive-picker-launch';
        launch.textContent = 'レコード棚から選ぶ';
        launch.addEventListener('click', openPicker);
        const list = document.getElementById('record-shelf-list');
        if (list && list.parentNode) list.parentNode.insertBefore(launch, list);
        else section.appendChild(launch);
    }

    function ensureOverlay() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.className = 'immersive-safe-picker';

        const head = document.createElement('header');
        head.className = 'immersive-safe-picker__head';
        const titleWrap = document.createElement('div');
        const kicker = document.createElement('div');
        kicker.className = 'immersive-safe-picker__kicker';
        kicker.textContent = 'Record Shelf';
        const title = document.createElement('h2');
        title.className = 'immersive-safe-picker__title';
        title.textContent = 'Pick your record';
        titleWrap.append(kicker, title);
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'immersive-safe-picker__close';
        close.textContent = '×';
        close.addEventListener('click', closePicker);
        head.append(titleWrap, close);

        const body = document.createElement('main');
        body.className = 'immersive-safe-picker__body';
        grid = document.createElement('div');
        grid.className = 'immersive-safe-picker__grid';
        body.appendChild(grid);

        const foot = document.createElement('footer');
        foot.className = 'immersive-safe-picker__foot';
        status = document.createElement('div');
        status.className = 'immersive-safe-picker__status';
        status.textContent = 'ready';
        const hint = document.createElement('div');
        hint.className = 'immersive-safe-picker__status';
        hint.textContent = 'Escで閉じる';
        foot.append(status, hint);

        overlay.append(head, body, foot);
        document.body.appendChild(overlay);
        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closePicker();
        });
    }

    function render(tracks) {
        grid.textContent = '';
        status.textContent = 'records ' + tracks.length;
        if (!tracks.length) {
            const empty = document.createElement('div');
            empty.className = 'immersive-safe-picker__empty';
            empty.textContent = '棚に表示できるレコードがまだありません。';
            grid.appendChild(empty);
            return;
        }
        tracks.forEach(function (track) {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'immersive-safe-picker__record';
            const coverWrap = document.createElement('div');
            coverWrap.className = 'immersive-safe-picker__cover-wrap';
            const img = document.createElement('img');
            img.className = 'immersive-safe-picker__cover';
            img.alt = '';
            img.src = track.image || 'https://placehold.co/400x400/111111/FFFFFF?text=PLAY';
            const rank = document.createElement('span');
            rank.className = 'immersive-safe-picker__rank';
            rank.textContent = '#' + (track.index + 1);
            coverWrap.append(img, rank);
            const name = document.createElement('div');
            name.className = 'immersive-safe-picker__name';
            name.textContent = track.title;
            const artist = document.createElement('div');
            artist.className = 'immersive-safe-picker__artist';
            artist.textContent = track.artist;
            card.append(coverWrap, name, artist);
            card.addEventListener('click', function () {
                closePicker();
                track.button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            });
            grid.appendChild(card);
        });
    }

    function openPicker() {
        ensureOverlay();
        render(getTracks());
        overlay.classList.add('is-open');
        document.body.classList.add('immersive-picker-open');
    }

    function closePicker() {
        if (!overlay) return;
        overlay.classList.remove('is-open');
        document.body.classList.remove('immersive-picker-open');
    }

    function boot() {
        installLauncher();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();
