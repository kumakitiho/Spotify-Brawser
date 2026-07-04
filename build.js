const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://kumakitiho.github.io/Spotify-Brawser/';
const DIST_DIR = path.join(__dirname, 'dist');
const SHELF_MODE_ASSETS = [
    'turntable-realism.css',
    'turntable-cover-boost.css',
    'turntable-physics.css',
    'turntable-physics.js',
    'turntable-arm-detail.js',
    'turntable-polish.js',
    'turntable-reference-match.css',
    'turntable-reference-match.js'
];

if (!CLIENT_ID) {
    console.error('❌ SPOTIFY_CLIENT_ID 環境変数が設定されていません');
    process.exit(1);
}

function normalizeBaseUrl(url) {
    return url.endsWith('/') ? url : url + '/';
}

function jsString(value) {
    return JSON.stringify(value);
}

fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(DIST_DIR, 'index.html'));
SHELF_MODE_ASSETS.forEach((file) => {
    fs.copyFileSync(path.join(__dirname, file), path.join(DIST_DIR, file));
});
fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '');

const configContent = [
    '// 本番用設定ファイル（自動生成）',
    'function loadShelfModeTurntableSkin() {',
    '    const stylesheets = [',
    '        { href: "turntable-realism.css?v=20260705-photoreal-turntable", key: "photoreal-turntable" },',
    '        { href: "turntable-cover-boost.css?v=20260705-cover-boost", key: "record-cover-boost" },',
    '        { href: "turntable-physics.css?v=20260705-physics-v8", key: "turntable-physics" },',
    '        { href: "turntable-reference-match.css?v=20260705-reference-match-v3", key: "turntable-reference-match" }',
    '    ];',
    '    const scripts = [',
    '        { src: "turntable-physics.js?v=20260705-physics-v5", key: "turntable-physics" },',
    '        { src: "turntable-arm-detail.js?v=20260705-arm-detail-v4", key: "turntable-arm-detail" },',
    '        { src: "turntable-polish.js?v=20260705-polish-v1", key: "turntable-polish" },',
    '        { src: "turntable-reference-match.js?v=20260705-reference-match-v3", key: "turntable-reference-match" }',
    '    ];',
    '    const appendAssets = () => {',
    '        stylesheets.forEach(({ href, key }) => {',
    '            if (document.querySelector("link[data-shelf-mode-skin=\\\"" + key + "\\\"]")) return;',
    '            const link = document.createElement("link");',
    '            link.rel = "stylesheet";',
    '            link.href = href;',
    '            link.dataset.shelfModeSkin = key;',
    '            document.head.appendChild(link);',
    '        });',
    '        scripts.forEach(({ src, key }) => {',
    '            if (document.querySelector("script[data-shelf-mode-script=\\\"" + key + "\\\"]")) return;',
    '            const script = document.createElement("script");',
    '            script.src = src;',
    '            script.defer = true;',
    '            script.dataset.shelfModeScript = key;',
    '            document.head.appendChild(script);',
    '        });',
    '    };',
    '    if (document.readyState === "loading") {',
    '        document.addEventListener("DOMContentLoaded", appendAssets, { once: true });',
    '        return;',
    '    }',
    '    appendAssets();',
    '}',
    'const config = {',
    '    CLIENT_ID: ' + jsString(CLIENT_ID) + ',',
    '    REDIRECT_URI: ' + jsString(normalizeBaseUrl(PUBLIC_BASE_URL)) + ',',
    '    SCOPES: "user-top-read user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state",',
    '    TOKEN_ENDPOINT: "https://accounts.spotify.com/api/token",',
    '    AUTH_URL: "https://accounts.spotify.com/authorize"',
    '};',
    'loadShelfModeTurntableSkin();',
    'window.appConfig = config;',
    ''
].join('\n');

fs.writeFileSync(path.join(DIST_DIR, 'config.js'), configContent);
console.log('✅ dist/ に GitHub Pages 用ファイルを生成しました: ' + normalizeBaseUrl(PUBLIC_BASE_URL));
