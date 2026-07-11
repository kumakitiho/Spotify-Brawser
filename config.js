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
    const previewClientId = params.get('spotifyClientId');
    if (previewClientId) {
        localStorage.setItem('spotifyClientIdOverride', previewClientId);
    }
    if (params.get('clearSpotifyClientId') === '1') {
        localStorage.removeItem('spotifyClientIdOverride');
    }

    return window.SPOTIFY_CLIENT_ID
        || (typeof process !== 'undefined' && process.env ? process.env.SPOTIFY_CLIENT_ID : undefined)
        || localStorage.getItem('spotifyClientIdOverride')
        || 'YOUR_SPOTIFY_CLIENT_ID_HERE';
}

function loadShelfModeLoader() {
    const appendLoader = () => {
        const key = 'shelf-mode-loader';
        if (document.querySelector(`script[data-shelf-mode-script="${key}"]`)) return;

        const script = document.createElement('script');
        script.src = 'shelf-mode-loader.js?v=20260712-loader-cinematic-v1';
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
    CLIENT_ID: getRuntimeSpotifyClientId(),
    REDIRECT_URI: getRuntimeRedirectUri(),
    SCOPES: 'user-top-read user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state',
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
};

loadShelfModeLoader();

console.log('🔍 CLIENT_ID確認:', config.CLIENT_ID ? `${config.CLIENT_ID.substring(0, 8)}...` : 'NOT SET');
console.log('🔍 REDIRECT_URI確認:', config.REDIRECT_URI);

if (config.CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID_HERE') {
    console.warn('⚠️ CLIENT_IDが設定されていません。GitHub Actionsの環境変数または spotifyClientId クエリを使用してください。');
}

window.appConfig = config;
