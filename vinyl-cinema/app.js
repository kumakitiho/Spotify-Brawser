const tracks = [
  {
    tone: 'now',
    category: 'NOW',
    title: 'Afterimage',
    description: '最近、急に近くなった音',
    cover: './covers/now.svg'
  },
  {
    tone: 'core',
    category: 'CORE',
    title: 'Deep Current',
    description: '長く残り続けている音',
    cover: './covers/core.svg'
  },
  {
    tone: 'rediscover',
    category: 'REDISCOVER',
    title: 'Forgotten Light',
    description: '忘れていた場所へ戻る音',
    cover: './covers/rediscover.svg'
  }
];

const cinema = document.getElementById('cinema');
const carousel = document.getElementById('carousel');
const cards = Array.from(document.querySelectorAll('.sleeve-card'));
const dots = Array.from(document.querySelectorAll('.position-dot'));
const ambientCover = document.getElementById('ambient-cover');
const selectionScene = document.getElementById('selection-scene');
const deckScene = document.getElementById('deck-scene');
const extractButton = document.getElementById('extract-button');
const blindButton = document.getElementById('blind-button');
const backButton = document.getElementById('back-button');
const vinylControl = document.getElementById('vinyl-control');
const needleControl = document.getElementById('needle-control');
const vinylLabel = document.getElementById('vinyl-label');
const deckCategory = document.getElementById('deck-category');
const deckTitle = document.getElementById('deck-title');
const deckArtist = document.getElementById('deck-artist');
const playingTitle = document.getElementById('playing-title');
const playingDescription = document.getElementById('playing-description');
const instructionText = document.getElementById('deck-instruction-text');
const toast = document.getElementById('toast');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const state = {
  selected: 0,
  scene: 'select',
  blind: false,
  revealed: true,
  playing: false,
  extracting: false,
  dropping: false,
  scrollFrame: 0,
  cardGesture: null,
  deckGesture: null,
  suppressCardClick: false,
  revealTimer: 0,
  toastTimer: 0,
  audioContext: null
};

function duration(normal) {
  return reducedMotion.matches ? 20 : normal;
}

function selectedTrack() {
  return tracks[state.selected];
}

function setToast(message) {
  window.clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function getAudioContext() {
  if (state.audioContext) return state.audioContext;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  state.audioContext = new Context();
  return state.audioContext;
}

function playMechanicalClick(strength = 1) {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') context.resume().catch(() => {});

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(210, now);
  oscillator.frequency.exponentialRampToValueAtTime(62, now + .085);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.13 * strength, now + .006);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .11);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + .12);

  const length = Math.floor(context.sampleRate * .075);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 3);
  }
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  noise.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = 1500;
  filter.Q.value = .8;
  noiseGain.gain.value = .055 * strength;
  noise.connect(filter).connect(noiseGain).connect(context.destination);
  noise.start(now);
}

function playNeedleCrackle() {
  const context = getAudioContext();
  if (!context) return;
  const seconds = 1.35;
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    const t = index / context.sampleRate;
    const envelope = Math.max(0, 1 - t / seconds);
    const dust = Math.random() > .986 ? (Math.random() * 2 - 1) * .9 : 0;
    channel[index] = ((Math.random() * 2 - 1) * .035 + dust) * envelope;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.value = 4200;
  gain.gain.value = .26;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
}

function playRevealTone() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  [330, 495, 660].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, now + index * .055);
    gain.gain.exponentialRampToValueAtTime(.035, now + index * .055 + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .5 + index * .055);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * .055);
    oscillator.stop(now + .58 + index * .055);
  });
}

function centerCard(index, behavior = 'smooth') {
  const card = cards[index];
  if (!card) return;
  const left = card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2;
  carousel.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : behavior });
}

function applySelection(index, { center = false } = {}) {
  const next = Math.max(0, Math.min(tracks.length - 1, index));
  state.selected = next;
  const track = selectedTrack();

  cards.forEach((card, cardIndex) => {
    const selected = cardIndex === next;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-current', selected ? 'true' : 'false');
    if (!selected) card.style.removeProperty('--drag-y');
  });
  dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === next));

  cinema.dataset.tone = track.tone;
  ambientCover.src = track.cover;
  ambientCover.alt = '';
  if (center) centerCard(next);
}

function updateDeck() {
  const track = selectedTrack();
  vinylLabel.src = track.cover;
  vinylLabel.alt = state.blind ? '伏せられたレコードラベル' : `${track.title}のジャケット`;
  deckCategory.textContent = track.category;
  deckTitle.textContent = track.title;
  deckArtist.textContent = track.description;
  playingTitle.textContent = track.title;
  playingDescription.textContent = track.description;
}

function resetPull() {
  cinema.style.setProperty('--pull', '0');
  cards[state.selected]?.style.removeProperty('--drag-y');
}

function beginExtraction({ blind = false } = {}) {
  if (state.scene !== 'select' || state.extracting) return;
  state.extracting = true;
  state.blind = blind;
  state.revealed = !blind;
  cinema.classList.toggle('is-blind', blind);
  cinema.classList.toggle('is-revealed', !blind);
  cinema.classList.add('is-extracting');
  cinema.style.setProperty('--pull', '1');
  updateDeck();
  playMechanicalClick(.72);
  navigator.vibrate?.(12);

  window.setTimeout(() => {
    state.scene = 'deck';
    cinema.dataset.scene = 'deck';
    deckScene.setAttribute('aria-hidden', 'false');
    selectionScene.setAttribute('aria-hidden', 'true');
    instructionText.textContent = blind ? '正体を伏せたまま、針を落とす' : '針をタップして、音を始める';

    window.setTimeout(() => {
      cinema.classList.remove('is-extracting');
      state.extracting = false;
      resetPull();
      needleControl.focus({ preventScroll: true });
    }, duration(420));
  }, duration(980));
}

function revealBlindDrop() {
  if (!state.blind || state.revealed) return;
  state.revealed = true;
  cinema.classList.add('is-revealed');
  vinylLabel.alt = `${selectedTrack().title}のジャケット`;
  playRevealTone();
  setToast('ジャケットを公開しました');
}

function dropNeedle() {
  if (state.scene !== 'deck' || state.dropping) return;

  if (state.playing) {
    window.clearTimeout(state.revealTimer);
    state.playing = false;
    cinema.classList.remove('is-playing');
    instructionText.textContent = '針をタップして、もう一度始める';
    playMechanicalClick(.55);
    navigator.vibrate?.(7);
    return;
  }

  state.dropping = true;
  cinema.classList.add('is-dropping');
  instructionText.textContent = '針を落としています…';
  playMechanicalClick(1);
  navigator.vibrate?.([10, 24, 8]);

  window.setTimeout(() => {
    playNeedleCrackle();
    state.playing = true;
    state.dropping = false;
    cinema.classList.remove('is-dropping');
    cinema.classList.add('is-playing');
    instructionText.textContent = '盤をタップして一時停止';

    if (state.blind && !state.revealed) {
      state.revealTimer = window.setTimeout(revealBlindDrop, duration(2200));
    }
  }, duration(520));
}

function returnToShelf() {
  if (state.scene !== 'deck') return;
  window.clearTimeout(state.revealTimer);
  state.playing = false;
  state.dropping = false;
  state.scene = 'select';
  state.blind = false;
  state.revealed = true;
  cinema.classList.remove('is-playing', 'is-dropping', 'is-blind', 'is-revealed');
  cinema.dataset.scene = 'select';
  deckScene.setAttribute('aria-hidden', 'true');
  selectionScene.setAttribute('aria-hidden', 'false');
  instructionText.textContent = '針をタップして、音を始める';
  playMechanicalClick(.45);
  window.setTimeout(() => cards[state.selected]?.focus({ preventScroll: true }), duration(650));
}

function nearestCardIndex() {
  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - center);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

carousel.addEventListener('scroll', () => {
  if (state.scrollFrame) return;
  state.scrollFrame = window.requestAnimationFrame(() => {
    state.scrollFrame = 0;
    const index = nearestCardIndex();
    if (index !== state.selected) applySelection(index);
  });
}, { passive: true });

cards.forEach((card, index) => {
  card.addEventListener('click', () => {
    if (state.suppressCardClick) return;
    if (index !== state.selected) {
      applySelection(index, { center: true });
      return;
    }
    beginExtraction();
  });

  card.addEventListener('pointerdown', (event) => {
    if (index !== state.selected || state.scene !== 'select') return;
    state.cardGesture = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      vertical: false
    };
  });

  card.addEventListener('pointermove', (event) => {
    const gesture = state.cardGesture;
    if (!gesture || gesture.pointerId !== event.pointerId || index !== state.selected) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;

    if (!gesture.vertical && Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx) * 1.25) {
      gesture.vertical = true;
      card.setPointerCapture?.(event.pointerId);
    }
    if (!gesture.vertical) return;

    event.preventDefault();
    const progress = Math.max(0, Math.min(1, -dy / 145));
    cinema.style.setProperty('--pull', String(progress));
    card.style.setProperty('--drag-y', `${Math.min(0, dy * .11)}px`);
  });

  const finishCardGesture = (event) => {
    const gesture = state.cardGesture;
    if (!gesture || gesture.pointerId !== event.pointerId || index !== state.selected) return;
    const dy = event.clientY - gesture.y;
    state.cardGesture = null;
    card.releasePointerCapture?.(event.pointerId);

    if (gesture.vertical) {
      state.suppressCardClick = true;
      window.setTimeout(() => { state.suppressCardClick = false; }, 320);
    }
    if (gesture.vertical && dy < -72) beginExtraction();
    else resetPull();
  };

  card.addEventListener('pointerup', finishCardGesture);
  card.addEventListener('pointercancel', () => {
    state.cardGesture = null;
    resetPull();
  });
});

dots.forEach((dot) => {
  dot.addEventListener('click', () => applySelection(Number(dot.dataset.index), { center: true }));
});

extractButton.addEventListener('click', () => beginExtraction());
blindButton.addEventListener('click', () => {
  let next = state.selected;
  while (tracks.length > 1 && next === state.selected) next = Math.floor(Math.random() * tracks.length);
  applySelection(next, { center: true });
  setToast('ジャケットを伏せたまま、盤を取り出します');
  window.setTimeout(() => beginExtraction({ blind: true }), duration(420));
});

vinylControl.addEventListener('click', dropNeedle);
needleControl.addEventListener('click', dropNeedle);
backButton.addEventListener('click', returnToShelf);

deckScene.addEventListener('pointerdown', (event) => {
  state.deckGesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
});
deckScene.addEventListener('pointerup', (event) => {
  const gesture = state.deckGesture;
  state.deckGesture = null;
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  if (dy > 86 && Math.abs(dy) > Math.abs(dx) * 1.25) returnToShelf();
});

window.addEventListener('keydown', (event) => {
  if (state.scene === 'select') {
    if (event.key === 'ArrowLeft') applySelection(state.selected - 1, { center: true });
    if (event.key === 'ArrowRight') applySelection(state.selected + 1, { center: true });
    if (event.key === 'ArrowUp' || event.key === 'Enter') beginExtraction();
    return;
  }

  if (event.key === 'Escape' || event.key === 'ArrowDown') returnToShelf();
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    dropNeedle();
  }
});

window.addEventListener('resize', () => centerCard(state.selected, 'auto'), { passive: true });

applySelection(0);
window.requestAnimationFrame(() => centerCard(0, 'auto'));
