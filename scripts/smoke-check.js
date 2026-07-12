const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function read(file) {
    return fs.readFileSync(path.join(root, file), 'utf8');
}
function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function assertContains(text, needle, label) {
    assert(text.includes(needle), `${label} should contain ${needle}`);
}
function assertNotContains(text, needle, label) {
    assert(!text.includes(needle), `${label} should not contain ${needle}`);
}
function assertFile(file) {
    assert(fs.existsSync(path.join(root, file)), `${file} should exist`);
}

function checkSourceFiles() {
    const config = read('config.js');
    const loader = read('shelf-mode-loader.js');
    const manifest = read('shelf-mode-assets.js');
    const deck = read('cinematic-deck.js');
    const guard = read('cinematic-deck-guard.js');
    const mobile = read('cinematic-deck-mobile.js');
    const mobileV3 = read('cinematic-deck-mobile-v3.js');
    const mobileCss = read('cinematic-deck-mobile.css');
    const mobileCssV3 = read('cinematic-deck-mobile-v3.css');
    const build = read('build.js');

    [
        'cinematic-deck.css',
        'cinematic-deck-themes.css',
        'cinematic-deck-fixes.css',
        'cinematic-deck-mobile.css',
        'cinematic-deck-mobile-v3.css',
        'cinematic-deck.js',
        'cinematic-deck-guard.js',
        'cinematic-deck-mobile.js',
        'cinematic-deck-mobile-v3.js'
    ].forEach(assertFile);

    assertContains(config, 'spotifyClientId', 'config.js');
    assertContains(config, 'shelf-mode-loader.js?v=20260712-loader-mobile-v3', 'config.js');
    assertNotContains(config, 'turntable-live-controls.js', 'config.js');

    assertContains(loader, 'shelf-mode-assets.js?v=20260712-assets-mobile-v3', 'shelf-mode-loader.js');
    assertContains(loader, 'window[LOADER_STATE_KEY]', 'shelf-mode-loader.js');

    assertContains(manifest, 'cinematic-deck-mobile.css?v=20260712-mobile-v1', 'shelf-mode-assets.js');
    assertContains(manifest, 'cinematic-deck-mobile-v3.css?v=20260712-mobile-v3', 'shelf-mode-assets.js');
    assertContains(manifest, 'cinematic-deck-mobile-v3.js?v=20260712-mobile-v3', 'shelf-mode-assets.js');
    assertContains(manifest, 'experimentalScripts', 'shelf-mode-assets.js');

    assertContains(deck, "params.get('cinematic')", 'cinematic-deck.js');
    assertNotContains(deck, 'MutationObserver', 'cinematic-deck.js');
    assertContains(guard, "window.addEventListener('keydown', handleKey, true)", 'cinematic-deck-guard.js');

    assertContains(mobile, 'cinematicDeckMobileGuideSeenV1', 'cinematic-deck-mobile.js');
    assertNotContains(mobile, 'MutationObserver', 'cinematic-deck-mobile.js');
    assertNotContains(mobile, 'setInterval', 'cinematic-deck-mobile.js');

    assertContains(mobileV3, 'cinematicDeckMobileGuideSeenV2', 'cinematic-deck-mobile-v3.js');
    assertContains(mobileV3, '盤を選んで、再生するだけ', 'cinematic-deck-mobile-v3.js');
    assertContains(mobileV3, "deck.classList.remove('is-focus')", 'cinematic-deck-mobile-v3.js');
    assertNotContains(mobileV3, 'MutationObserver', 'cinematic-deck-mobile-v3.js');
    assertNotContains(mobileV3, 'setInterval', 'cinematic-deck-mobile-v3.js');

    assertContains(mobileCss, 'height: 100dvh', 'cinematic-deck-mobile.css');
    assertContains(mobileCssV3, 'grid-template-rows:auto minmax(0,1fr) auto', 'cinematic-deck-mobile-v3.css');
    assertContains(mobileCssV3, 'width:min(94vw,calc(35dvh * 1.5),30rem)', 'cinematic-deck-mobile-v3.css');
    assertContains(mobileCssV3, ".cinematic-deck__prev::after { content:'前へ'; }", 'cinematic-deck-mobile-v3.css');
    assertContains(mobileCssV3, '.cinematic-deck__focus,.cinematic-deck__return { display:none!important; }', 'cinematic-deck-mobile-v3.css');
    assertContains(mobileCssV3, 'env(safe-area-inset-bottom)', 'cinematic-deck-mobile-v3.css');

    assertContains(build, "'cinematic-deck-mobile-v3.css'", 'build.js');
    assertContains(build, "'cinematic-deck-mobile-v3.js'", 'build.js');
    assertContains(build, 'shelf-mode-loader.js?v=20260712-loader-mobile-v3', 'build.js');
}

function runBuild() {
    childProcess.execFileSync(process.execPath, ['build.js'], {
        cwd: root,
        env: {
            ...process.env,
            SPOTIFY_CLIENT_ID: 'test-client-id',
            PUBLIC_BASE_URL: 'https://kumakitiho.github.io/Spotify-Brawser/'
        },
        stdio: 'inherit'
    });
}

function checkDistFiles() {
    const required = [
        'index.html',
        'config.js',
        'shelf-mode-loader.js',
        'shelf-mode-assets.js',
        'cinematic-deck.css',
        'cinematic-deck-themes.css',
        'cinematic-deck-fixes.css',
        'cinematic-deck-mobile.css',
        'cinematic-deck-mobile-v3.css',
        'cinematic-deck.js',
        'cinematic-deck-guard.js',
        'cinematic-deck-mobile.js',
        'cinematic-deck-mobile-v3.js',
        'turntable-live-controls.js'
    ];
    required.forEach((file) => {
        assert(fs.existsSync(path.join(dist, file)), `dist/${file} should exist`);
    });

    const distConfig = fs.readFileSync(path.join(dist, 'config.js'), 'utf8');
    assertContains(distConfig, 'shelf-mode-loader.js?v=20260712-loader-mobile-v3', 'dist/config.js');
    assertContains(distConfig, 'spotifyClientId', 'dist/config.js');
    assertContains(distConfig, 'test-client-id', 'dist/config.js');
    assertNotContains(distConfig, 'turntable-live-controls.js', 'dist/config.js');
}

checkSourceFiles();
runBuild();
checkDistFiles();
console.log('Cinematic Deck mobile v3 smoke check passed.');
