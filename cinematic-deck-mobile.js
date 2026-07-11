/* Mobile interaction layer for Cinematic Deck. */
(function () {
    const MOBILE_QUERY = '(max-width: 820px)';
    const GUIDE_KEY = 'cinematicDeckMobileGuideSeenV1';
    const media = window.matchMedia(MOBILE_QUERY);

    function q(selector, root = document) {
        return root.querySelector(selector);
    }

    function setText(selector, value, root) {
        const element = q(selector, root);
        if (element) element.textContent = value;
    }

    function localize(deck) {
        if (!deck || !media.matches) return;
        deck.classList.add('is-mobile-layout');

        setText('.cinematic-deck__brand-title', 'Cinematic Deck', deck);
        setText('.cinematic-deck__stage-kicker', '選択中のレコード', deck);
        setText('.cinematic-deck__panel-label', '再生コントロール', deck);
        setText('.cinematic-deck__crate-label', 'レコードを選ぶ', deck);
        setText('.cinematic-deck__surprise', 'おまかせ', deck);
        setText('.cinematic-deck__focus', deck.classList.contains('is-focus') ? '通常表示' : '画面に集中', deck);
        setText('.cinematic-deck__share', '共有', deck);
        setText('.cinematic-deck__return', '棚へ戻る', deck);

        const close = q('.cinematic-deck__close', deck);
        const play = q('.cinematic-deck__play', deck);
        const prev = q('.cinematic-deck__prev', deck);
        const next = q('.cinematic-deck__next', deck);
        if (close) close.setAttribute('aria-label', '閉じる');
        if (play) play.setAttribute('aria-label', '再生または停止');
        if (prev) prev.setAttribute('aria-label', '前のレコード');
        if (next) next.setAttribute('aria-label', '次のレコード');
    }

    function installGuide(deck) {
        if (!deck || !media.matches || localStorage.getItem(GUIDE_KEY) === 'true') return;
        if (q('.cinematic-deck__mobile-guide', deck)) return;

        const guide = document.createElement('div');
        guide.className = 'cinematic-deck__mobile-guide';
        guide.setAttribute('role', 'dialog');
        guide.setAttribute('aria-modal', 'true');
        guide.setAttribute('aria-label', 'Cinematic Deckの使い方');

        const card = document.createElement('div');
        card.className = 'cinematic-deck__mobile-guide-card';

        const kicker = document.createElement('div');
        kicker.className = 'cinematic-deck__mobile-guide-kicker';
        kicker.textContent = 'はじめての操作';

        const title = document.createElement('h2');
        title.className = 'cinematic-deck__mobile-guide-title';
        title.textContent = '3つだけ覚えればOK';

        const steps = [
            '画面下のジャケットを横にスワイプして、聴きたい盤を選びます。',
            '中央の再生ボタン、またはレコード盤をタップして再生・停止します。',
            '迷ったときは「おまかせ」で棚からランダムに一曲選べます。'
        ];

        card.append(kicker, title);
        steps.forEach((text, index) => {
            const row = document.createElement('div');
            row.className = 'cinematic-deck__mobile-guide-step';
            const number = document.createElement('span');
            number.className = 'cinematic-deck__mobile-guide-number';
            number.textContent = String(index + 1);
            const description = document.createElement('div');
            description.textContent = text;
            row.append(number, description);
            card.appendChild(row);
        });

        const start = document.createElement('button');
        start.type = 'button';
        start.className = 'cinematic-deck__mobile-guide-button';
        start.textContent = 'レコードを選ぶ';
        start.addEventListener('click', () => {
            localStorage.setItem(GUIDE_KEY, 'true');
            guide.remove();
            q('.cinematic-deck__record-card.is-selected', deck)?.focus({ preventScroll: true });
        });

        card.appendChild(start);
        guide.appendChild(card);
        deck.appendChild(guide);
        window.setTimeout(() => start.focus({ preventScroll: true }), 120);
    }

    function bindMobileGestures(deck) {
        if (!deck || deck.dataset.mobileGesturesBound === 'true') return;
        deck.dataset.mobileGesturesBound = 'true';

        const stage = q('.cinematic-deck__stage', deck);
        const vinyl = q('.cinematic-deck__vinyl', deck);
        const focus = q('.cinematic-deck__focus', deck);
        const share = q('.cinematic-deck__share', deck);
        let startX = 0;
        let startY = 0;
        let pointerId = null;

        stage?.addEventListener('pointerdown', (event) => {
            if (!media.matches) return;
            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            stage.setPointerCapture?.(event.pointerId);
        });

        stage?.addEventListener('pointerup', (event) => {
            if (!media.matches || pointerId !== event.pointerId) return;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            pointerId = null;
            stage.releasePointerCapture?.(event.pointerId);
            if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
            q(dx < 0 ? '.cinematic-deck__next' : '.cinematic-deck__prev', deck)?.click();
        });

        vinyl?.addEventListener('click', (event) => {
            if (!media.matches) return;
            event.preventDefault();
            q('.cinematic-deck__play', deck)?.click();
        });

        focus?.addEventListener('click', () => {
            window.setTimeout(() => {
                setText('.cinematic-deck__focus', deck.classList.contains('is-focus') ? '通常表示' : '画面に集中', deck);
            }, 20);
        });

        share?.addEventListener('click', () => {
            window.setTimeout(() => {
                if (share.textContent === 'Share scene') share.textContent = '共有';
            }, 1600);
        });
    }

    function enhance() {
        if (!media.matches) return;
        const deck = q('.cinematic-deck');
        if (!deck) return;
        localize(deck);
        bindMobileGestures(deck);
        installGuide(deck);
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.cinematic-deck-launch')) return;
        window.setTimeout(enhance, 0);
        window.setTimeout(enhance, 180);
    }, true);

    media.addEventListener?.('change', () => {
        const deck = q('.cinematic-deck');
        if (!deck) return;
        deck.classList.toggle('is-mobile-layout', media.matches);
        if (media.matches) enhance();
    });

    window.addEventListener('orientationchange', () => window.setTimeout(enhance, 180));
    window.addEventListener('resize', () => {
        if (document.body.classList.contains('cinematic-deck-open')) enhance();
    }, { passive: true });
})();
