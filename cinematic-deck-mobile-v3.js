/* Mobile Cinematic Deck v3 behavior. */
(function () {
    const media = window.matchMedia('(max-width: 820px)');
    const GUIDE_KEY = 'cinematicDeckMobileGuideSeenV2';

    function q(selector, root = document) {
        return root.querySelector(selector);
    }

    function setText(selector, text, root) {
        const node = q(selector, root);
        if (node) node.textContent = text;
    }

    function createGuide(deck) {
        if (!media.matches || localStorage.getItem(GUIDE_KEY) === 'true') return;
        q('.cinematic-deck__mobile-guide', deck)?.remove();

        const guide = document.createElement('div');
        guide.className = 'cinematic-deck__mobile-guide';
        guide.setAttribute('role', 'dialog');
        guide.setAttribute('aria-modal', 'true');
        guide.setAttribute('aria-label', 'スマホでの操作方法');

        const card = document.createElement('div');
        card.className = 'cinematic-deck__mobile-guide-card';
        const kicker = document.createElement('div');
        kicker.className = 'cinematic-deck__mobile-guide-kicker';
        kicker.textContent = 'スマホでの操作';
        const title = document.createElement('h2');
        title.className = 'cinematic-deck__mobile-guide-title';
        title.textContent = '盤を選んで、再生するだけ';
        card.append(kicker, title);

        const steps = [
            '下のジャケットを横にスワイプして、聴きたい盤をタップ。',
            '中央の丸い再生ボタン、またはレコード盤をタップ。'
        ];
        steps.forEach((text, index) => {
            const row = document.createElement('div');
            row.className = 'cinematic-deck__mobile-guide-step';
            const number = document.createElement('span');
            number.className = 'cinematic-deck__mobile-guide-number';
            number.textContent = String(index + 1);
            const copy = document.createElement('span');
            copy.textContent = text;
            row.append(number, copy);
            card.appendChild(row);
        });

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cinematic-deck__mobile-guide-button';
        button.textContent = 'レコードを選ぶ';
        button.addEventListener('click', () => {
            localStorage.setItem(GUIDE_KEY, 'true');
            guide.remove();
            q('.cinematic-deck__record-card.is-selected', deck)?.scrollIntoView({ block: 'nearest', inline: 'center' });
        });
        card.appendChild(button);
        guide.appendChild(card);
        deck.appendChild(guide);
    }

    function addStageHint(deck) {
        const stage = q('.cinematic-deck__stage', deck);
        if (!stage || q('.cinematic-deck__mobile-hint', stage)) return;
        const hint = document.createElement('div');
        hint.className = 'cinematic-deck__mobile-hint';
        hint.textContent = '盤をタップで再生・停止';
        stage.appendChild(hint);
    }

    function optimize(deck) {
        if (!deck || !media.matches) return;
        deck.classList.add('is-mobile-v3');
        deck.classList.remove('is-focus');
        setText('.cinematic-deck__eyebrow', 'NOW SELECTING', deck);
        setText('.cinematic-deck__brand-title', 'Cinematic Deck', deck);
        setText('.cinematic-deck__stage-kicker', '選択中', deck);
        setText('.cinematic-deck__crate-label', 'レコードを選ぶ', deck);
        setText('.cinematic-deck__surprise', 'おまかせ再生', deck);
        setText('.cinematic-deck__share', 'この曲を共有', deck);
        q('.cinematic-deck__close', deck)?.setAttribute('aria-label', 'Cinematic Deckを閉じる');
        addStageHint(deck);
        createGuide(deck);
    }

    function runSoon() {
        window.setTimeout(() => optimize(q('.cinematic-deck')), 0);
        window.setTimeout(() => optimize(q('.cinematic-deck')), 160);
    }

    document.addEventListener('click', (event) => {
        if (event.target.closest('.cinematic-deck-launch')) runSoon();
    }, true);

    media.addEventListener?.('change', runSoon);
    window.addEventListener('orientationchange', runSoon);
    window.addEventListener('resize', () => {
        if (document.body.classList.contains('cinematic-deck-open')) runSoon();
    }, { passive: true });
})();
