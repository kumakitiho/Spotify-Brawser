# Spotify統計ビューアー

ユーザーのSpotify再生履歴とお気に入りの楽曲・アーティストを視覚的に表示するWebアプリケーション

## 🎵 主要機能

### 📊 統計・ランキング機能
- **楽曲ランキング**: 期間別のトップ楽曲を表示
- **アーティストランキング**: 期間別のトップアーティスト表示
- **Wrapped風インサイト**: 今の傾向をひとことで表す診断カードを表示
- **共有用サマリー**: 現在の表示内容をコピーしてSNSやDMに貼れる
- **期間比較**: 最近4週間/過去6ヶ月/全期間の差分から上昇・新規・離脱を表示
- **プレイリスト生成**: 表示中のトップ楽曲から private playlist を作成
- **イメージクラウド**: アーティスト写真を使った視覚的な統計表示
- **ジャンルクラウド**: 音楽ジャンル分析とパーセンテージ表示
- **期間フィルター**: 6ヶ月、4週間、全期間に加えて年別推定表示

### 🎧 再生機能
- **Web Playback SDK**: ブラウザ内での楽曲再生
- **再生コントロール**: 再生/一時停止、シーク、音量調整
- **リアルタイム表示**: 現在再生中の楽曲情報表示
- **プレビュー再生**: 楽曲の30秒プレビュー対応

### 🔐 セキュリティ
- **OAuth 2.0 PKCE**: 安全な認証フロー
- **トークン管理**: アクセストークン期限切れ時は再ログインを案内

## 🚀 GitHub Pagesでのデプロイ手順

### 1. 前提条件
- Spotifyアプリの作成（[Spotify Developer Dashboard](https://developer.spotify.com/dashboard)）
- GitHub Pagesを有効化できるGitHubリポジトリ

### 2. Spotifyアプリ設定
1. Spotify Developer Dashboardでアプリを作成
2. `CLIENT_ID`をメモ
3. Redirect URIsにGitHub PagesのURLを追加
   ```
   https://kumakitiho.github.io/Spotify-Brawser/
   ```

### 3. GitHub Pagesの設定
1. GitHubリポジトリの **Settings > Pages** を開く
2. **Build and deployment > Source** を `GitHub Actions` に変更
3. **Settings > Secrets and variables > Actions** で `SPOTIFY_CLIENT_ID` をRepository SecretまたはVariableとして登録
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   ```
4. `main`ブランチにpushすると `.github/workflows/pages.yml` が自動でビルドと公開を実行
5. 公開URLを確認
   ```
   https://kumakitiho.github.io/Spotify-Brawser/
   ```

### 4. ビルドについて

`npm run build` は `dist/` にGitHub Pages用の静的ファイルを生成します。追跡中の `config.js` は上書きしません。

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id_here PUBLIC_BASE_URL=https://kumakitiho.github.io/Spotify-Brawser/ npm run build
```

### 5. セキュリティについて
**❌ CLIENT_IDをconfig.jsに直接書かないでください**

- 開発環境: プレースホルダー値をそのまま使用
- 本番環境: GitHub Actionsのビルド時に環境変数から `dist/config.js` へ自動注入
- GitHubには実際のCLIENT_IDはコミットされません
- CLIENT_IDはシークレットではありません。公開後はGitHub Pages上の `config.js` から閲覧できます
- GitHub Pagesの通常公開URLでは `REDIRECT_URI` は `https://kumakitiho.github.io/Spotify-Brawser/` になります

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

- `index.html` - メインアプリケーション（全機能統合）
- `config.js` - 設定ファイル（CLIENT_ID等）
- `.github/workflows/pages.yml` - GitHub Pages公開用のワークフロー
- `package.json` - プロジェクト設定
- `dist/` - ビルド成果物（Git管理対象外）
- `.gitignore` - Git除外設定

## 🎨 UI/UX機能

- **レスポンシブ対応**: モバイル・デスクトップ両対応
- **Spotify風デザイン**: 一貫したデザインシステム
- **アニメーション効果**: スムーズなCSSアニメーション
- **ホバーエフェクト**: インタラクティブなUI要素
- **ローディング状態**: 各機能でのローディング表示
- **インサイトパネル**: タイプ診断、年代傾向、ジャンル温度感を表示
- **比較パネル**: 期間ごとの差分をその場で確認

## 🔐 セキュリティ

- CLIENT_IDは設定ファイルで管理
- PKCE認証フローを使用
- XSS対策実装済み
- CSPヘッダー設定済み

## 📝 使用方法

### 基本操作
1. Spotifyアカウントでログイン
2. タブから楽曲・アーティスト統計を選択
3. 期間フィルターで表示データを切り替え
4. アーティスト表示でイメージクラウド・ジャンルクラウドを切り替え

### 表示モード
- **リスト表示**: 従来のランキング形式
- **イメージクラウド**: アーティスト写真による視覚的表示
- **ジャンルクラウド**: 音楽ジャンルの分析チャート

### 新しい楽しみ方
1. ランキング上部のインサイトカードで今の傾向を確認
2. 年別ボタンでその年っぽいトップを推定表示
3. 比較パネルで最近伸びた曲や離れた曲を確認
4. 「結果をコピー」でそのまま共有
5. 気に入った表示状態からそのままプレイリストを作成

## 📝 注意事項

- Spotify Premium不要（Web Playback SDKはPremium必須）
- Spotifyアカウントでのログインが必要
- ブラウザでの楽曲再生にはSpotify Premiumが必要
- ジャンル分析はアーティスト情報に基づく
- プレイリスト生成には再ログイン後の追加権限承認が必要な場合があります
