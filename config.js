// 設定ファイル - 環境変数から設定を読み込み
// 本番環境では適切な環境変数を設定してください

function normalizeBaseUrl(url) {
    return url.endsWith('/') ? url : `${url}/`;
}

function getRuntimeRedirectUri() {
    const configuredBaseUrl = window.PUBLIC_BASE_URL || window.SPOTIFY_PUBLIC_BASE_URL;
    if (configuredBaseUrl) {
        return normalizeBaseUrl(configuredBaseUrl);
    }

    const path = window.location.pathname.endsWith('/')
        ? window.location.pathname
        : window.location.pathname.replace(/\/[^/]*$/, '/');

    return `${window.location.origin}${path}`;
}

function loadShelfModeTurntableSkin() {
    const stylesheets = [
        {
            href: 'turntable-realism.css?v=20260705-photoreal-turntable',
            key: 'photoreal-turntable'
        },
        {
            href: 'turntable-cover-boost.css?v=20260705-cover-boost',
            key: 'record-cover-boost'
        },
        {
            href: 'turntable-physics.css?v=20260705-physics-v8',
            key: 'turntable-physics'
        },
        {
            href: 'turntable-reference-match.css?v=20260705-reference-match-v4',
            key: 'turntable-reference-match'
        }
    ];

    const scripts = [
        {
            src: 'turntable-physics.js?v=20260705-physics-v6',
            key: 'turntable-physics'
        },
        {
            src: 'turntable-arm-detail.js?v=20260705-arm-detail-v4',
            key: 'turntable-arm-detail'
        },
        {
            src: 'turntable-polish.js?v=20260705-polish-v1',
            key: 'turntable-polish'
        },
        {
            src: 'turntable-reference-match.js?v=20260705-reference-match-v4',
            key: 'turntable-reference-match'
        }
    ];

    const appendAssets = () => {
        stylesheets.forEach(({ href, key }) => {
            if (document.querySelector(`link[data-shelf-mode-skin="${key}"]`)) return;

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.shelfModeSkin = key;
            document.head.appendChild(link);
        });

        scripts.forEach(({ src, key }) => {
            if (document.querySelector(`script[data-shelf-mode-script="${key}"]`)) return;

            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.dataset.shelfModeScript = key;
            document.head.appendChild(script);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', appendAssets, { once: true });
        return;
    }

    appendAssets();
}

const config = {
    // Spotify API設定 - 本番環境では環境変数から取得
    CLIENT_ID: window.SPOTIFY_CLIENT_ID
        || (typeof process !== 'undefined' && process.env ? process.env.SPOTIFY_CLIENT_ID : undefined)
        || 'YOUR_SPOTIFY_CLIENT_ID_HERE',
    REDIRECT_URI: getRuntimeRedirectUri(),
    SCOPES: 'user-top-read user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state',
    
    // Spotify API エンドポイント
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
};

loadShelfModeTurntableSkin();

// 設定検証とデバッグ
console.log('🔍 CLIENT_ID確認:', config.CLIENT_ID ? `${config.CLIENT_ID.substring(0, 8)}...` : 'NOT SET');
console.log('🔍 REDIRECT_URI確認:', config.REDIRECT_URI);

if (config.CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID_HERE') {
    console.warn('⚠️ CLIENT_IDが設定されていません。環境変数 SPOTIFY_CLIENT_ID を設定するか、config.js を編集してください。');
}

window.appConfig = config;
