export class PlaybackController {
  constructor({ getToken, audio, onState, onMessage }) {
    this.getToken = getToken;
    this.audio = audio;
    this.onState = onState;
    this.onMessage = onMessage;
    this.sdkPlayer = null;
    this.deviceId = null;
    this.sdkPromise = null;
    this.readyPromise = null;
    this.sdkUnavailable = false;
    this.currentTrack = null;
    this.state = {
      source: null,
      uri: null,
      playing: false,
      position: 0,
      duration: 0,
      updatedAt: Date.now()
    };
    this.bindAudio();
  }

  bindAudio() {
    const update = () => {
      if (this.state.source !== 'preview') return;
      this.state.playing = !this.audio.paused;
      this.state.position = (this.audio.currentTime || 0) * 1000;
      this.state.duration = (this.audio.duration || 0) * 1000;
      this.state.updatedAt = Date.now();
      this.emit();
    };
    ['play', 'pause', 'timeupdate', 'durationchange', 'ended'].forEach((event) => this.audio.addEventListener(event, update));
  }

  emit() {
    this.onState?.(this.getSnapshot());
  }

  getSnapshot() {
    let position = this.state.position;
    if (this.state.playing && this.state.source === 'sdk') {
      position += Date.now() - this.state.updatedAt;
    }
    return {
      ...this.state,
      position: Math.min(position, this.state.duration || position),
      track: this.currentTrack
    };
  }

  async loadSdk() {
    if (window.Spotify) return;
    if (this.sdkPromise) return this.sdkPromise;

    this.sdkPromise = new Promise((resolve, reject) => {
      let settled = false;
      const finish = () => {
        if (settled || !window.Spotify) return;
        settled = true;
        clearTimeout(timeout);
        resolve();
      };
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('Spotifyプレーヤーの読み込みがタイムアウトしました。'));
      }, 10_000);

      const previous = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => {
        previous?.();
        finish();
      };

      let script = document.querySelector('script[data-record-room-sdk]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        script.dataset.recordRoomSdk = 'true';
        script.onerror = () => reject(new Error('Spotifyプレーヤーを読み込めませんでした。'));
        document.body.appendChild(script);
      }
      script.addEventListener('load', finish, { once: true });
      const poll = setInterval(() => {
        if (!settled && window.Spotify) {
          clearInterval(poll);
          finish();
        }
      }, 100);
      setTimeout(() => clearInterval(poll), 10_500);
    });
    return this.sdkPromise;
  }

  async ensureSdk() {
    if (this.sdkUnavailable) throw new Error('ブラウザ再生は利用できません。');
    if (this.sdkPlayer && this.deviceId) return;
    await this.loadSdk();

    if (!this.sdkPlayer) {
      this.readyPromise = new Promise((resolve, reject) => {
        const player = new Spotify.Player({
          name: 'Record Room',
          volume: 0.62,
          getOAuthToken: async (callback) => callback(await this.getToken())
        });
        this.sdkPlayer = player;
        const readyTimeout = setTimeout(() => reject(new Error('再生デバイスの準備に失敗しました。')), 10_000);

        player.addListener('ready', ({ device_id }) => {
          this.deviceId = device_id;
          clearTimeout(readyTimeout);
          resolve();
        });
        player.addListener('not_ready', () => { this.deviceId = null; });
        player.addListener('account_error', ({ message }) => {
          this.sdkUnavailable = true;
          this.onMessage?.('ブラウザでのフル再生にはSpotify Premiumが必要です。');
          reject(new Error(message));
        });
        player.addListener('authentication_error', ({ message }) => reject(new Error(message)));
        player.addListener('initialization_error', ({ message }) => reject(new Error(message)));
        player.addListener('playback_error', ({ message }) => this.onMessage?.(`再生エラー: ${message}`));
        player.addListener('player_state_changed', (state) => this.handleSdkState(state));
        player.connect().then((connected) => {
          if (!connected) reject(new Error('Spotifyプレーヤーに接続できませんでした。'));
        });
      });
    }
    return this.readyPromise;
  }

  handleSdkState(state) {
    if (!state) return;
    const track = state.track_window?.current_track;
    this.state = {
      source: 'sdk',
      uri: track?.uri || this.state.uri,
      playing: !state.paused,
      position: state.position || 0,
      duration: state.duration || 0,
      updatedAt: Date.now()
    };
    this.emit();
  }

  async playViaSdk(track) {
    await this.ensureSdk();
    const token = await this.getToken();
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(this.deviceId)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [track.uri] })
    });
    if (!response.ok) throw new Error(`Spotify再生を開始できませんでした (${response.status})`);
    this.currentTrack = track;
    this.state = { source: 'sdk', uri: track.uri, playing: true, position: 0, duration: track.duration_ms || 0, updatedAt: Date.now() };
    this.emit();
  }

  async playPreview(track) {
    if (!track.preview_url) throw new Error('この曲はブラウザ内プレビューを利用できません。');
    if (this.sdkPlayer && this.state.source === 'sdk' && this.state.playing) {
      try { await this.sdkPlayer.pause(); } catch { /* no-op */ }
    }
    this.currentTrack = track;
    this.audio.src = track.preview_url;
    this.state = { source: 'preview', uri: track.uri, playing: false, position: 0, duration: 30_000, updatedAt: Date.now() };
    await this.audio.play();
    this.onMessage?.('30秒プレビューを再生しています。');
  }

  async play(track) {
    if (!track?.uri) return;
    try {
      await this.playViaSdk(track);
    } catch (sdkError) {
      try {
        await this.playPreview(track);
      } catch (previewError) {
        this.onMessage?.(previewError.message || sdkError.message);
        throw previewError;
      }
    }
  }

  async toggle(track) {
    if (!track) return;
    if (this.state.uri !== track.uri) return this.play(track);

    if (this.state.source === 'preview') {
      if (this.audio.paused) await this.audio.play();
      else this.audio.pause();
      return;
    }

    if (this.sdkPlayer) {
      await this.sdkPlayer.togglePlay();
    } else {
      await this.play(track);
    }
  }

  async seek(fraction) {
    const value = Math.max(0, Math.min(1, fraction));
    if (this.state.source === 'preview' && Number.isFinite(this.audio.duration)) {
      this.audio.currentTime = this.audio.duration * value;
      return;
    }
    if (this.sdkPlayer) {
      const duration = this.getSnapshot().duration;
      if (duration) await this.sdkPlayer.seek(Math.round(duration * value));
    }
  }

  async pause() {
    if (this.state.source === 'preview') this.audio.pause();
    else if (this.sdkPlayer) await this.sdkPlayer.pause();
  }
}
