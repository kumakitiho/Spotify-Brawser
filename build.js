const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://kumakitiho.github.io/Spotify-Brawser/';
const DIST_DIR = path.join(__dirname, 'dist');
const SHELF_TURNTABLE_CSS = 'turntable-realism.css';
const SHELF_TURNTABLE_CSS_VERSION = '20260705-photoreal-turntable';

if (!CLIENT_ID) {
    console.error('❌ SPOTIFY_CLIENT_ID 環境変数が設定されていません');
    process.exit(1);
}

function normalizeBaseUrl(url) {
    return url.endsWith('/') ? url : `${url}/`;
}

function jsString(value) {
    return JSON.stringify(value);
}

fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(DIST_DIR, 'index.html'));
fs.copyFileSync(path.join(__dirname, SHELF_TURNTABLE_CSS), path.join(DIST_DIR, SHELF_TURNTABLE_CSS));
fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');

const configContent = `// 本番用設定ファイル（自動生成）
function loadShelfModeTurntableSkin() {
    const href = '${SHELF_TURNTABLE_CSS}?v=${SHELF_TURNTABLE_CSS_VERSION}';

    const appendStylesheet = () => {
        if (document.querySelector('link[data-shelf-mode-skin="photoreal-turntable"]')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.dataset.shelfModeSkin = 'photoreal-turntable';
        document.head.appendChild(link);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', appendStylesheet, { once: true });
        return;
    }

    appendStylesheet();
}

const config = {
    CLIENT_ID: ${jsString(CLIENT_ID)},
    REDIRECT_URI: ${jsString(normalizeBaseUrl(PUBLIC_BASE_URL))},
    SCOPES: 'user-top-read user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state',
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
};

loadShelfModeTurntableSkin();

window.appConfig = config;
`;

fs.writeFileSync(path.join(DIST_DIR, 'config.js'), configContent);
console.log(`✅ dist/ に GitHub Pages 用ファイルを生成しました: ${normalizeBaseUrl(PUBLIC_BASE_URL)}`);
