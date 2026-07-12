# Record Room

Spotifyのトップトラックから「今夜の12枚」を作り、レコードを選び、針を落として聴くためのモバイルファーストなリスニングルームです。

## 体験

- 最近4週間の「最近の沼」4曲
- 過去6か月の「今の定番」4曲
- 長期トップの「ずっと残る」4曲
- レコード盤タップで再生・停止
- ターンテーブル上を左右スワイプして選曲
- `おまかせで選ぶ` によるランダム再生
- 最近の曲と長期定番を並べる `Then vs now`
- セッション中に再生した盤を残す `Session tape`
- Midnight / Amber / Neon のシーン切り替え

## 技術構成

依存を増やさず、ネイティブES Modulesで構成しています。

```text
index.html
config.js
src/
  auth.js       Spotify OAuth 2.0 PKCE / state / token refresh
  spotify.js    Spotify API / 12枚の棚 / 期間比較
  player.js     Web Playback SDK / preview fallback
  main.js       UI状態と操作
  styles.css    モバイルファーストUI
build.js
scripts/smoke-check.js
```

旧Cinematic Deckと旧Shelf Modeのファイルはリポジトリ内に残っていますが、新しいPagesビルドには含まれません。

## Spotifyアプリ設定

Spotify Developer Dashboardでアプリを作成し、Redirect URIへ次を登録します。

```text
https://kumakitiho.github.io/Spotify-Brawser/
```

GitHubのRepository SecretまたはVariableへ設定します。

```text
SPOTIFY_CLIENT_ID=your_client_id
```

Client Secretは使用しません。

## 開発

```bash
npm ci
npm run dev
```

ローカルやブランチ直配信でClient IDを一時指定する場合は、次のクエリを使用できます。

```text
?spotifyClientId=YOUR_CLIENT_ID
```

削除する場合：

```text
?clearSpotifyClientId=1
```

## テストとビルド

```bash
npm test
npm run build
```

スモークテストでは以下を確認します。

- ES Modulesの構文
- PKCEとOAuth state検証
- refresh token処理
- 12枚の棚と期間比較
- Web Playback SDKとプレビューfallback
- モバイルセーフエリアとレスポンシブUI
- Pages成果物に旧Cinematic Deckが混入しないこと

## 再生について

ブラウザでのフル再生にはSpotify Premiumが必要です。Web Playback SDKが利用できない場合は、Spotifyが`preview_url`を提供している曲に限り30秒プレビューへフォールバックします。
