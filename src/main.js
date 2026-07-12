import { beginLogin, getAccessToken, initializeAuth, logout } from './auth.js';
import { loadListeningData } from './spotify.js';
import { PlaybackController } from './player.js';

const refs = Object.fromEntries([
  'app','auth-view','room-view','login-button','logout-button','auth-message','theme-select',
  'track-reason','track-title','track-artist','vinyl-button','vinyl-label','deck-stage',
  'seek','current-time','total-time','prev-button','play-button','next-button','surprise-button',
  'compare-button','playback-status','crate','comparison-content','session-tape','toast','preview-audio'
].map((id) => [id.replace(/-([a-z])/g, (_, char) => char.toUpperCase()), document.getElementById(id)]));

const state = {
  data: null,
  crate: [],
  selectedIndex: 0,
  player: null,
  snapshot: null,
  session: [],
  ticker: null,
  toastTimer: null,
  pointerStart: null,
  suppressVinylClick: false
};

function selectedTrack() {
  return state.crate[state.selectedIndex] || null;
}

function formatTime(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0:00';
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function showToast(message) {
  if (!message) return;
  refs.toast.textContent = message;
  refs.toast.classList.add('is-visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => refs.toast.classList.remove('is-visible'), 2600);
}

function setAuthMessage(message) {
  refs.authMessage.textContent = message || '';
}

function setPlaybackMessage(message) {
  refs.playbackStatus.textContent = message || '';
  if (message) showToast(message);
}

function setTheme(theme) {
  const allowed = ['midnight', 'amber', 'neon'];
  const value = allowed.includes(theme) ? theme : 'midnight';
  refs.app.dataset.theme = value;
  refs.themeSelect.value = value;
  localStorage.setItem('recordRoomTheme', value);
}

function renderSelected() {
  const track = selectedTrack();
  if (!track) {
    refs.trackReason.textContent = 'Tonight\'s crate';
    refs.trackTitle.textContent = '棚に曲がありません';
    refs.trackArtist.textContent = 'Spotifyで十分なトップトラックが見つかりませんでした';
    refs.vinylLabel.removeAttribute('src');
    return;
  }

  refs.trackReason.textContent = `${track.category} · ${track.reason}`;
  refs.trackTitle.textContent = track.name || 'Unknown Track';
  refs.trackArtist.textContent = track.artistLabel;
  refs.vinylLabel.src = track.cover;
  refs.vinylLabel.alt = `${track.name} のジャケット`;

  const cards = refs.crate.querySelectorAll('.record-card');
  cards.forEach((card, index) => {
    card.classList.toggle('is-selected', index === state.selectedIndex);
    card.setAttribute('aria-current', index === state.selectedIndex ? 'true' : 'false');
  });
  cards[state.selectedIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function selectTrack(index) {
  if (!state.crate.length) return;
  state.selectedIndex = (index + state.crate.length) % state.crate.length;
  renderSelected();
}

function createRecordCard(track, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'record-card';
  button.setAttribute('role', 'listitem');
  button.setAttribute('aria-label', `${track.name} - ${track.artistLabel} を選ぶ`);

  const image = document.createElement('img');
  image.src = track.cover || 'https://placehold.co/300x300/111111/FFFFFF?text=PLAY';
  image.alt = '';
  image.loading = 'lazy';

  const badge = document.createElement('span');
  badge.className = 'record-badge';
  badge.textContent = track.category;

  const title = document.createElement('span');
  title.textContent = track.name;

  button.append(image, badge, title);
  button.addEventListener('click', () => selectTrack(index));
  button.addEventListener('dblclick', async () => {
    selectTrack(index);
    await togglePlayback();
  });
  return button;
}

function renderCrate() {
  refs.crate.textContent = '';
  state.crate.forEach((track, index) => refs.crate.appendChild(createRecordCard(track, index)));
  renderSelected();
}

function miniTrack(track) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mini-track';
  if (!track) {
    wrapper.className = 'empty-copy';
    wrapper.textContent = '比較できる曲がまだありません。';
    return wrapper;
  }

  const image = document.createElement('img');
  image.src = track.cover || 'https://placehold.co/100x100/111111/FFFFFF?text=PLAY';
  image.alt = '';
  const copy = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = track.name;
  const meta = document.createElement('span');
  meta.textContent = `${track.category} · ${track.artistLabel}`;
  copy.append(title, meta);
  wrapper.append(image, copy);
  return wrapper;
}

function renderComparison() {
  refs.comparisonContent.textContent = '';
  refs.comparisonContent.append(
    miniTrack(state.data?.comparison?.fresh),
    miniTrack(state.data?.comparison?.classic)
  );
}

function pushSession(track) {
  if (!track?.uri || state.session[0]?.uri === track.uri) return;
  state.session = [track, ...state.session.filter((item) => item.uri !== track.uri)].slice(0, 8);
  renderSession();
}

function renderSession() {
  refs.sessionTape.textContent = '';
  if (!state.session.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-copy';
    empty.textContent = '再生した盤がここに残ります。';
    refs.sessionTape.appendChild(empty);
    return;
  }
  state.session.forEach((track) => {
    const image = document.createElement('img');
    image.src = track.cover;
    image.alt = `${track.name} - ${track.artistLabel}`;
    image.title = image.alt;
    refs.sessionTape.appendChild(image);
  });
}

function renderPlayback(snapshot) {
  if (!snapshot) return;
  state.snapshot = snapshot;
  const fraction = snapshot.duration ? Math.max(0, Math.min(1, snapshot.position / snapshot.duration)) : 0;
  refs.app.classList.toggle('is-playing', snapshot.playing);
  refs.playButton.textContent = snapshot.playing ? '停止' : '再生';
  refs.playButton.setAttribute('aria-label', snapshot.playing ? '一時停止' : '再生');
  refs.currentTime.textContent = formatTime(snapshot.position);
  refs.totalTime.textContent = formatTime(snapshot.duration);
  refs.seek.value = String(Math.round(fraction * 1000));
  refs.app.style.setProperty('--tonearm-angle', snapshot.playing ? `${-23 + fraction * 14}deg` : '-34deg');

  const activeTrack = state.crate.find((track) => track.uri === snapshot.uri) || snapshot.track;
  if (snapshot.playing && activeTrack) pushSession(activeTrack);
  if (snapshot.uri) {
    const index = state.crate.findIndex((track) => track.uri === snapshot.uri);
    if (index >= 0 && index !== state.selectedIndex) selectTrack(index);
  }
}

async function togglePlayback() {
  const track = selectedTrack();
  if (!track || !state.player) return;
  refs.playButton.disabled = true;
  try {
    await state.player.toggle(track);
  } catch (error) {
    setPlaybackMessage(error.message || '再生できませんでした。');
  } finally {
    refs.playButton.disabled = false;
  }
}

async function surpriseMe() {
  if (!state.crate.length) return;
  let next = state.selectedIndex;
  while (state.crate.length > 1 && next === state.selectedIndex) next = Math.floor(Math.random() * state.crate.length);
  selectTrack(next);
  showToast('棚から一枚選びました。');
  await togglePlayback();
}

function bindInteractions() {
  refs.loginButton.addEventListener('click', async () => {
    refs.loginButton.disabled = true;
    setAuthMessage('Spotifyへ移動しています…');
    try { await beginLogin(); }
    catch (error) {
      setAuthMessage(error.message);
      refs.loginButton.disabled = false;
    }
  });

  refs.logoutButton.addEventListener('click', async () => {
    try { await state.player?.pause(); } catch { /* no-op */ }
    logout();
    window.location.reload();
  });
  refs.themeSelect.addEventListener('change', (event) => setTheme(event.target.value));
  refs.prevButton.addEventListener('click', () => selectTrack(state.selectedIndex - 1));
  refs.nextButton.addEventListener('click', () => selectTrack(state.selectedIndex + 1));
  refs.playButton.addEventListener('click', togglePlayback);
  refs.vinylButton.addEventListener('click', () => {
    if (state.suppressVinylClick) return;
    togglePlayback();
  });
  refs.surpriseButton.addEventListener('click', surpriseMe);
  refs.compareButton.addEventListener('click', () => document.querySelector('.insight-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  refs.seek.addEventListener('change', () => state.player?.seek(Number(refs.seek.value) / 1000));

  refs.deckStage.addEventListener('pointerdown', (event) => {
    state.pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    refs.deckStage.setPointerCapture?.(event.pointerId);
  });
  refs.deckStage.addEventListener('pointerup', (event) => {
    const start = state.pointerStart;
    state.pointerStart = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      state.suppressVinylClick = true;
      setTimeout(() => { state.suppressVinylClick = false; }, 280);
      selectTrack(state.selectedIndex + (dx < 0 ? 1 : -1));
    }
  });
  refs.deckStage.addEventListener('pointercancel', () => { state.pointerStart = null; });

  window.addEventListener('keydown', (event) => {
    if (refs.roomView.hidden || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft') selectTrack(state.selectedIndex - 1);
    if (event.key === 'ArrowRight') selectTrack(state.selectedIndex + 1);
    if (event.key === ' ') {
      event.preventDefault();
      togglePlayback();
    }
  });
}

function startTicker() {
  if (state.ticker) clearInterval(state.ticker);
  state.ticker = setInterval(() => renderPlayback(state.player?.getSnapshot()), 400);
}

async function openRoom() {
  refs.authView.hidden = true;
  refs.roomView.hidden = false;
  refs.playbackStatus.textContent = 'Spotifyから棚を作っています…';

  state.player = new PlaybackController({
    getToken: getAccessToken,
    audio: refs.previewAudio,
    onState: renderPlayback,
    onMessage: setPlaybackMessage
  });
  startTicker();

  try {
    state.data = await loadListeningData(getAccessToken);
    state.crate = state.data.crate;
    refs.playbackStatus.textContent = `${state.data.profile?.display_name || 'あなた'}のトップ曲から12枚を選びました。`;
    renderCrate();
    renderComparison();
    renderSession();
  } catch (error) {
    refs.playbackStatus.textContent = error.message || 'Spotifyのデータを取得できませんでした。';
    if (error.status === 401) {
      logout();
      setTimeout(() => window.location.reload(), 1200);
    }
  }
}

async function boot() {
  bindInteractions();
  setTheme(localStorage.getItem('recordRoomTheme') || 'midnight');
  try {
    const token = await initializeAuth();
    if (token?.accessToken) await openRoom();
  } catch (error) {
    setAuthMessage(error.message || 'ログインを開始できませんでした。');
  }
}

boot();
