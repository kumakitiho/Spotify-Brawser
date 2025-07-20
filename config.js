// 設定ファイル - 環境変数から設定を読み込み
// 本番環境では適切な環境変数を設定してください

const config = {
    // Spotify API設定 - 本番環境では環境変数から取得
    CLIENT_ID: window.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID_HERE',
    REDIRECT_URI: window.location.origin + '/',
    SCOPES: 'user-top-read user-read-private',
    
    // Spotify API エンドポイント
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
};

// 設定検証
if (config.CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID_HERE') {
    console.warn('⚠️ CLIENT_IDが設定されていません。環境変数 SPOTIFY_CLIENT_ID を設定するか、config.js を編集してください。');
}

window.appConfig = config;