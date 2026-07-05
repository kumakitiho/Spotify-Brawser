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

function getRuntimeSpotifyClientId() {
    const params = new URLSearchParams(window.location.search);
    const clientIdFromUrl = params.get('spotifyClientId') || params.get('client_id');
    if (clientIdFromUrl) {
        localStorage.setItem('spotifyClientIdOverride', clientIdFromUrl);
        return clientIdFromUrl;
    }

    return window.SPOTIFY_CLIENT_ID
        || localStorage.getItem('spotifyClientIdOverride')
        || (typeof process !== 'undefined' && process.env ? process.env.SPOTIFY_CLIENT_ID : undefined)
        || 'YOUR_SPOTIFY_CLIENT_ID_HERE';
}

function loadShelfModeLoader() {
    const appendLoader = () => {
        const key = 'shelf-mode-loader';
        if (document.querySelector(`script[data-shelf-mode-script="${key}"]`)) return;

        const script = document.createElement('script');
        script.src = 'shelf-mode-loader.js?v=20260705-loader-v2';
        script.defer = true;
        script.dataset.shelfModeScript = key;
        script.onerror = () => console.warn('Shelf Mode loader failed to load.');
        document.head.appendChild(script);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', appendLoader, { once: true });
        return;
    }

    appendLoader();
}

const config = {
    // Spotify API設定 - 本番環境では環境変数から取得
    CLIENT_ID: getRuntimeSpotifyClientId(),
    REDIRECT_URI: getRuntimeRedirectUri(),
    SCOPES: 'user-top-read user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state',
    
    // Spotify API エンドポイント
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
};

loadShelfModeLoader();

// 設定検証とデバッグ
console.log('🔍 CLIENT_ID確認:', config.CLIENT_ID ? `${config.CLIENT_ID.substring(0, 8)}...` : 'NOT SET');
console.log('🔍 REDIRECT_URI確認:', config.REDIRECT_URI);

if (config.CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID_HERE') {
    console.warn('⚠️ CLIENT_IDが設定されていません。環境変数 SPOTIFY_CLIENT_ID を設定するか、config.js を編集してください。');
}

window.appConfig = config;
