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
    const build = read('build.js');

    [
        'cinematic-deck.css',
        'cinematic-deck-themes.css',
        'cinematic-deck-fixes.css',
        'cinematic-deck.js',
        'cinematic-deck-guard.js'
    ].forEach(assertFile);

    assertContains(config, 'spotifyClientId', 'config.js');
    assertContains(config, 'shelf-mode-loader.js?v=20260712-loader-cinematic-v1', 'config.js');
    assertNotContains(config, 'turntable-live-controls.js', 'config.js');

    assertContains(loader, 'shelf-mode-assets.js?v=20260712-assets-cinematic-v1', 'shelf-mode-loader.js');
    assertContains(loader, 'window[LOADER_STATE_KEY]', 'shelf-mode-loader.js');

    assertContains(manifest, 'cinematic-deck.css?v=20260712-cinematic-v1', 'shelf-mode-assets.js');
    assertContains(manifest, 'cinematic-deck.js?v=20260712-cinematic-v1', 'shelf-mode-assets.js');
    assertContains(manifest, 'cinematic-deck-guard.js?v=20260712-cinematic-v1', 'shelf-mode-assets.js');
    assertContains(manifest, 'experimentalScripts', 'shelf-mode-assets.js');
    assertContains(manifest, 'turntable-live-controls.js?v=20260705-live-controls-flagged-v6', 'shelf-mode-assets.js');

    assertContains(deck, "params.get('cinematic')", 'cinematic-deck.js');
    assertContains(deck, 'Surprise me', 'cinematic-deck.js');
    assertContains(deck, 'Focus scene', 'cinematic-deck.js');
    assertContains(deck, 'Session tape', 'cinematic-deck.js');
    assertContains(deck, 'navigator.share', 'cinematic-deck.js');
    assertNotContains(deck, 'MutationObserver', 'cinematic-deck.js');

    assertContains(guard, "window.addEventListener('keydown', handleKey, true)", 'cinematic-deck-guard.js');
    assertNotContains(guard, 'MutationObserver', 'cinematic-deck-guard.js');

    assertContains(build, "'cinematic-deck.css'", 'build.js');
    assertContains(build, "'cinematic-deck.js'", 'build.js');
    assertContains(build, 'getRuntimeSpotifyClientId', 'build.js');
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
        'cinematic-deck.js',
        'cinematic-deck-guard.js',
        'turntable-live-controls.js'
    ];

    required.forEach((file) => {
        assert(fs.existsSync(path.join(dist, file)), `dist/${file} should exist`);
    });

    const distConfig = fs.readFileSync(path.join(dist, 'config.js'), 'utf8');
    assertContains(distConfig, 'shelf-mode-loader.js?v=20260712-loader-cinematic-v1', 'dist/config.js');
    assertContains(distConfig, 'spotifyClientId', 'dist/config.js');
    assertContains(distConfig, 'test-client-id', 'dist/config.js');
    assertNotContains(distConfig, 'turntable-live-controls.js', 'dist/config.js');
}

checkSourceFiles();
runBuild();
checkDistFiles();

console.log('Cinematic Deck smoke check passed.');
