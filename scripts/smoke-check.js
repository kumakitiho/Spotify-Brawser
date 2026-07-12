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
function contains(text, needle, label) {
  assert(text.includes(needle), `${label} should contain ${needle}`);
}
function excludes(text, needle, label) {
  assert(!text.includes(needle), `${label} should not contain ${needle}`);
}
function exists(file) {
  assert(fs.existsSync(path.join(root, file)), `${file} should exist`);
}

function checkModuleSyntax(file) {
  childProcess.execFileSync(process.execPath, ['--input-type=module', '--check'], {
    cwd: root,
    input: read(file),
    stdio: ['pipe', 'inherit', 'inherit']
  });
}

function checkRecordRoom() {
  const modules = ['src/auth.js', 'src/spotify.js', 'src/player.js', 'src/main.js'];
  const required = ['index.html', 'config.js', 'build.js', 'src/styles.css', ...modules];
  required.forEach(exists);
  modules.forEach(checkModuleSyntax);

  const index = read('index.html');
  const config = read('config.js');
  const build = read('build.js');
  const auth = read('src/auth.js');
  const spotify = read('src/spotify.js');
  const player = read('src/player.js');
  const main = read('src/main.js');
  const styles = read('src/styles.css');

  contains(index, 'src/main.js?v=20260712-record-room-v1', 'index.html');
  contains(index, 'src/styles.css?v=20260712-record-room-v1', 'index.html');
  contains(index, '今夜の12枚', 'index.html');
  excludes(index, 'cdn.tailwindcss.com', 'index.html');
  excludes(index, 'record-shelf-section', 'index.html');

  contains(config, 'window.appConfig', 'config.js');
  contains(config, 'spotifyClientId', 'config.js');
  excludes(config, 'shelf-mode-loader', 'config.js');

  contains(auth, 'recordRoomOAuthState', 'src/auth.js');
  contains(auth, "grant_type: 'refresh_token'", 'src/auth.js');
  contains(auth, 'sessionStorage', 'src/auth.js');
  contains(auth, 'returnedState !== expectedState', 'src/auth.js');

  contains(spotify, 'buildCrate', 'src/spotify.js');
  contains(spotify, 'Retry-After', 'src/spotify.js');
  contains(spotify, '最近の沼', 'src/spotify.js');

  contains(player, 'playViaSdk', 'src/player.js');
  contains(player, 'playPreview', 'src/player.js');
  contains(player, 'spotify-player.js', 'src/player.js');
  excludes(player, 'MutationObserver', 'src/player.js');

  contains(main, 'surpriseMe', 'src/main.js');
  contains(main, 'renderComparison', 'src/main.js');
  contains(main, 'pushSession', 'src/main.js');
  contains(main, 'suppressVinylClick', 'src/main.js');
  excludes(main, 'innerHTML', 'src/main.js');
  excludes(main, 'MutationObserver', 'src/main.js');

  contains(styles, 'min-height: 100svh', 'src/styles.css');
  contains(styles, 'env(safe-area-inset-bottom)', 'src/styles.css');
  contains(styles, '@media (min-width: 760px)', 'src/styles.css');
  contains(styles, 'prefers-reduced-motion', 'src/styles.css');

  contains(build, "copyDirectory(path.join(ROOT, 'src')", 'build.js');
  excludes(build, 'cinematic-deck', 'build.js');
  excludes(build, 'shelf-mode-loader', 'build.js');
}

function checkVinylCinema() {
  const required = [
    'vinyl-cinema/index.html',
    'vinyl-cinema/styles.css',
    'vinyl-cinema/app.js',
    'vinyl-cinema/covers/now.svg',
    'vinyl-cinema/covers/core.svg',
    'vinyl-cinema/covers/rediscover.svg'
  ];
  required.forEach(exists);
  checkModuleSyntax('vinyl-cinema/app.js');

  const index = read('vinyl-cinema/index.html');
  const styles = read('vinyl-cinema/styles.css');
  const app = read('vinyl-cinema/app.js');
  const build = read('build.js');

  contains(index, 'VINYL CINEMA', 'vinyl-cinema/index.html');
  contains(index, 'BLIND DROP', 'vinyl-cinema/index.html');
  contains(index, 'この盤を取り出す', 'vinyl-cinema/index.html');
  contains(index, 'tonearm', 'vinyl-cinema/index.html');
  contains(index, 'app.js?v=20260712-vinyl-cinema-v1', 'vinyl-cinema/index.html');

  contains(styles, '.cinema.is-extracting', 'vinyl-cinema/styles.css');
  contains(styles, '.cinema.is-playing .vinyl', 'vinyl-cinema/styles.css');
  contains(styles, '.cinema.is-blind:not(.is-revealed)', 'vinyl-cinema/styles.css');
  contains(styles, 'env(safe-area-inset-bottom)', 'vinyl-cinema/styles.css');
  contains(styles, 'prefers-reduced-motion', 'vinyl-cinema/styles.css');

  contains(app, 'beginExtraction', 'vinyl-cinema/app.js');
  contains(app, 'dropNeedle', 'vinyl-cinema/app.js');
  contains(app, 'playNeedleCrackle', 'vinyl-cinema/app.js');
  contains(app, 'revealBlindDrop', 'vinyl-cinema/app.js');
  contains(app, 'requestAnimationFrame', 'vinyl-cinema/app.js');
  excludes(app, 'MutationObserver', 'vinyl-cinema/app.js');
  excludes(app, 'setInterval', 'vinyl-cinema/app.js');

  contains(build, "copyDirectory(path.join(ROOT, 'vinyl-cinema')", 'build.js');
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

function checkDist() {
  [
    'index.html', 'config.js', '.nojekyll',
    'src/styles.css', 'src/auth.js', 'src/spotify.js', 'src/player.js', 'src/main.js',
    'vinyl-cinema/index.html', 'vinyl-cinema/styles.css', 'vinyl-cinema/app.js',
    'vinyl-cinema/covers/now.svg', 'vinyl-cinema/covers/core.svg', 'vinyl-cinema/covers/rediscover.svg'
  ].forEach((file) => assert(fs.existsSync(path.join(dist, file)), `dist/${file} should exist`));

  const distConfig = fs.readFileSync(path.join(dist, 'config.js'), 'utf8');
  const distIndex = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const cinemaIndex = fs.readFileSync(path.join(dist, 'vinyl-cinema/index.html'), 'utf8');
  contains(distConfig, 'test-client-id', 'dist/config.js');
  contains(distConfig, 'https://kumakitiho.github.io/Spotify-Brawser/', 'dist/config.js');
  excludes(distIndex, 'cdn.tailwindcss.com', 'dist/index.html');
  contains(cinemaIndex, 'VINYL CINEMA', 'dist/vinyl-cinema/index.html');
  assert(!fs.existsSync(path.join(dist, 'cinematic-deck.js')), 'legacy cinematic assets should not be deployed');
}

checkRecordRoom();
checkVinylCinema();
runBuild();
checkDist();
console.log('Record Room and Vinyl Cinema smoke checks passed.');
