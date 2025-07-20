# Spotify統計ビューアー

ユーザーのSpotify再生履歴とお気に入りの楽曲・アーティストを視覚的に表示するWebアプリケーション

## 🎵 機能

- **楽曲ランキング**: 期間別のトップ楽曲を表示
- **アーティストランキング**: 期間別のトップアーティストを表示
- **期間フィルター**: 6ヶ月、4週間、全期間での統計
- **プレビュー再生**: 楽曲の30秒プレビューを再生
- **安全な認証**: OAuth 2.0 PKCE フローによる安全なログイン

## 🚀 Renderでのデプロイ手順

### 1. 前提条件
- Spotifyアプリの作成（[Spotify Developer Dashboard](https://developer.spotify.com/dashboard)）
- Renderアカウント

### 2. Spotifyアプリ設定
1. Spotify Developer Dashboardでアプリを作成
2. `CLIENT_ID`をメモ
3. Redirect URIsに本番URLを追加（例: `https://your-app.onrender.com/`）

### 3. Renderでのデプロイ
1. GitHubにコードをプッシュ
2. Renderで新しいStatic Siteを作成
3. **重要**: 環境変数を設定:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   ```
4. ビルドコマンド: `npm run build`（自動的にCLIENT_IDが注入されます）

### 4. セキュリティについて
**❌ CLIENT_IDをconfig.jsに直接書かないでください**

- 開発環境: プレースホルダー値をそのまま使用
- 本番環境: ビルド時に環境変数から自動注入
- GitHubには実際のCLIENT_IDはコミットされません

## 🛠️ ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
# または
npm start
```

## 📁 ファイル構成

- `index.html` - メインアプリケーション
- `config.js` - 設定ファイル（CLIENT_ID等）
- `package.json` - プロジェクト設定
- `render.yaml` - Render公開設定
- `.gitignore` - Git除外設定

## 🔐 セキュリティ

- CLIENT_IDは設定ファイルで管理
- PKCE認証フローを使用
- XSS対策実装済み
- CSPヘッダー設定済み

## 📝 注意事項

- Spotify Premium不要（プレビュー再生は30秒まで）
- Spotifyアカウントでのログインが必要
- 年別プレイリスト機能は公式プレイリストに依存
