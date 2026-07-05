const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function read(file) {
    return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertContains(text, needle, label) {
    assert(text.includes(needle), `${label} should contain ${needle}`);
}

function assertNotContains(text, needle, label) {
    assert(!text.includes(needle), `${label} should not contain ${needle}`);
}

function checkSourceFiles() {
    const config = read('config.js');
    const loader = read('shelf-mode-loader.js');
    const manifest = read('shelf-mode-assets.js');

    assertContains(config, 'shelf-mode-loader.js?v=20260705-loader-v1', 'config.js');
    assertNotContains(config, 'turntable-live-controls.js', 'config.js');
    assertContains(loader, 'shelf-mode-assets.js?v=20260705-assets-v1', 'shelf-mode-loader.js');
    assertContains(loader, 'window.__shelfModeLoaderState', 'shelf-mode-loader.js');
    assertContains(manifest, 'window.ShelfModeAssets', 'shelf-mode-assets.js');
    assertContains(manifest, 'experimentalScripts', 'shelf-mode-assets.js');
    assertContains(manifest, 'turntable-live-controls.js?v=20260705-live-controls-flagged-v6', 'shelf-mode-assets.js');
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
    const distConfig = fs.readFileSync(path.join(dist, 'config.js'), 'utf8');

    assert(fs.existsSync(path.join(dist, 'index.html')), 'dist/index.html should exist');
    assert(fs.existsSync(path.join(dist, 'shelf-mode-loader.js')), 'dist/shelf-mode-loader.js should exist');
    assert(fs.existsSync(path.join(dist, 'shelf-mode-assets.js')), 'dist/shelf-mode-assets.js should exist');
    assert(fs.existsSync(path.join(dist, 'turntable-live-controls.js')), 'dist/turntable-live-controls.js should be copied for later promotion');

    assertContains(distConfig, 'shelf-mode-loader.js?v=20260705-loader-v1', 'dist/config.js');
    assertNotContains(distConfig, 'turntable-live-controls.js', 'dist/config.js');
    assertContains(distConfig, 'test-client-id', 'dist/config.js');
}

checkSourceFiles();
runBuild();
checkDistFiles();

console.log('Shelf Mode refactor smoke check passed.');
