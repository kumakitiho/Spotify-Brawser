// ビルド時にCLIENT_IDを環境変数から注入するスクリプト
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

if (!CLIENT_ID) {
    console.error('❌ SPOTIFY_CLIENT_ID 環境変数が設定されていません');
    process.exit(1);
}

// config.jsを動的に生成
const configContent = `// 本番用設定ファイル（自動生成）
const config = {
    CLIENT_ID: '${CLIENT_ID}',
    REDIRECT_URI: window.location.origin + '/',
    SCOPES: 'user-top-read user-read-private',
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
};

window.appConfig = config;
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
console.log('✅ config.js が環境変数から生成されました');