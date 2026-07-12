// Record Room runtime configuration.
(function () {
  function normalizeBaseUrl(url) {
    return url.endsWith('/') ? url : `${url}/`;
  }

  function runtimeBaseUrl() {
    const configured = window.PUBLIC_BASE_URL || window.SPOTIFY_PUBLIC_BASE_URL;
    if (configured) return normalizeBaseUrl(configured);
    const path = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : window.location.pathname.replace(/\/[^/]*$/, '/');
    return `${window.location.origin}${path}`;
  }

  function runtimeClientId() {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('spotifyClientId');
    if (preview) localStorage.setItem('spotifyClientIdOverride', preview);
    if (params.get('clearSpotifyClientId') === '1') localStorage.removeItem('spotifyClientIdOverride');
    return window.SPOTIFY_CLIENT_ID
      || (typeof process !== 'undefined' && process.env ? process.env.SPOTIFY_CLIENT_ID : undefined)
      || localStorage.getItem('spotifyClientIdOverride')
      || 'YOUR_SPOTIFY_CLIENT_ID_HERE';
  }

  window.appConfig = {
    CLIENT_ID: runtimeClientId(),
    REDIRECT_URI: runtimeBaseUrl(),
    SCOPES: 'user-top-read user-read-private streaming user-modify-playback-state user-read-playback-state',
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
  };
})();
