const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://kumakitiho.github.io/Spotify-Brawser/';
const DIST_DIR = path.join(__dirname, 'dist');
const SHELF_MODE_STYLESHEETS = [
    {
        file: 'turntable-realism.css',
        version: '20260705-photoreal-turntable',
        key: 'photoreal-turntable'
    },
    {
        file: 'turntable-cover-boost.css',
        version: '20260705-cover-boost',
        key: 'record-cover-boost'
    }
];

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
SHELF_MODE_STYLESHEETS.forEach(({ file }) => {
    fs.copyFileSync(path.join(__dirname, file), path.join(DIST_DIR, file));
});
fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');

const stylesheetConfig = JSON.stringify(SHELF_MODE_STYLESHEETS.map(({ file, version, key }) => ({
    href: `${file}?v=${version}`,
    key
})), null, 8);

const configContent = `// 本番用設定ファイル（自動生成）
function loadShelfModeTurntableSkin() {
    const stylesheets = ${stylesheetConfig};

    const appendStylesheets = () => {
        stylesheets.forEach(({ href, key }) => {
            if (document.querySelector(\`link[data-shelf-mode-skin="\${key}"]\`)) return;

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.shelfModeSkin = key;
            document.head.appendChild(link);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', appendStylesheets, { once: true });
        return;
    }

    appendStylesheets();
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
