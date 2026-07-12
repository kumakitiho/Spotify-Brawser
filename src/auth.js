const TOKEN_KEY = 'recordRoomToken';
const VERIFIER_KEY = 'recordRoomVerifier';
const STATE_KEY = 'recordRoomOAuthState';

function config() {
  const value = window.appConfig;
  if (!value) throw new Error('アプリ設定を読み込めませんでした。');
  if (!value.CLIENT_ID || value.CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID_HERE') {
    throw new Error('Spotify Client IDが設定されていません。');
  }
  return value;
}

function randomString(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
}

async function challengeFor(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function readToken() {
  try {
    return JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveToken(payload, previous = null) {
  const token = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || previous?.refreshToken || null,
    expiresAt: Date.now() + Math.max(30, Number(payload.expires_in || 3600)) * 1000,
    scope: payload.scope || previous?.scope || ''
  };
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  return token;
}

function cleanCallbackUrl() {
  const url = new URL(window.location.href);
  ['code', 'state', 'error', 'error_description'].forEach((key) => url.searchParams.delete(key));
  history.replaceState({}, document.title, url);
}

async function exchangeCode(code, returnedState) {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const expectedState = sessionStorage.getItem(STATE_KEY);
  if (!verifier || !expectedState || returnedState !== expectedState) {
    throw new Error('Spotify認証の検証に失敗しました。もう一度ログインしてください。');
  }

  const app = config();
  const response = await fetch(app.TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: app.CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: app.REDIRECT_URI,
      code_verifier: verifier
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Spotify認証に失敗しました (${response.status}) ${detail}`);
  }

  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return saveToken(await response.json());
}

async function refreshToken(token) {
  if (!token?.refreshToken) return null;
  const app = config();
  const response = await fetch(app.TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: app.CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken
    })
  });
  if (!response.ok) return null;
  return saveToken(await response.json(), token);
}

export async function beginLogin() {
  const app = config();
  const verifier = randomString(72);
  const state = randomString(36);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: app.CLIENT_ID,
    response_type: 'code',
    redirect_uri: app.REDIRECT_URI,
    scope: app.SCOPES,
    state,
    code_challenge_method: 'S256',
    code_challenge: await challengeFor(verifier)
  });
  window.location.assign(`${app.AUTH_URL}?${params}`);
}

export async function initializeAuth() {
  config();
  const params = new URLSearchParams(window.location.search);
  const authError = params.get('error');
  if (authError) {
    const description = params.get('error_description') || authError;
    cleanCallbackUrl();
    throw new Error(`Spotifyログインが中断されました: ${description}`);
  }

  const code = params.get('code');
  if (code) {
    try {
      return await exchangeCode(code, params.get('state'));
    } finally {
      cleanCallbackUrl();
    }
  }

  return readToken();
}

export async function getAccessToken() {
  const token = readToken();
  if (!token?.accessToken) return null;
  if (token.expiresAt > Date.now() + 60_000) return token.accessToken;
  const refreshed = await refreshToken(token);
  if (!refreshed) {
    logout();
    return null;
  }
  return refreshed.accessToken;
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
}

export function hasSession() {
  return Boolean(readToken()?.accessToken);
}
