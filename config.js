// 設定ファイル - 環境変数から設定を読み込み
// 本番環境では適切な環境変数を設定してください

const config = {
    // Spotify API設定 - 本番環境では環境変数から取得
    CLIENT_ID: window.SPOTIFY_CLIENT_ID
        || (typeof process !== 'undefined' && process.env ? process.env.SPOTIFY_CLIENT_ID : undefined)
        || 'YOUR_SPOTIFY_CLIENT_ID_HERE',
    REDIRECT_URI: window.location.origin + '/',
    SCOPES: 'user-top-read user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state',
    
    // Spotify API エンドポイント
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
};

// 設定検証とデバッグ
console.log('🔍 CLIENT_ID確認:', config.CLIENT_ID ? `${config.CLIENT_ID.substring(0, 8)}...` : 'NOT SET');
console.log('🔍 REDIRECT_URI確認:', config.REDIRECT_URI);

if (config.CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID_HERE') {
    console.warn('⚠️ CLIENT_IDが設定されていません。環境変数 SPOTIFY_CLIENT_ID を設定するか、config.js を編集してください。');
}

window.appConfig = config;
