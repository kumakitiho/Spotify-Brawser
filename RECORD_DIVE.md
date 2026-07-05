# Record Dive

Spotify APIを使って、ユーザーの再生傾向を“レコード棚を掘る体験”として見せるリッチな実験ページです。

## 追加ページ

```text
record-dive.html
```

GitHub Pages公開後の想定URL:

```text
https://kumakitiho.github.io/Spotify-Brawser/record-dive.html
```

## できること

- Spotify OAuth 2.0 PKCEでログイン
- `/me/top/tracks` からトップ曲を取得
- `/me/top/artists` からジャンル傾向を取得
- トップ曲をレコード棚として3D風に表示
- ジャケットをクリックするとターンテーブル表示に反映
- 人気度・レア度・独自のDIVE SCOREを表示
- preview_urlがある曲は試聴再生
- 音源がない場合も疑似オーディオビジュアライザーを表示
- 4週間 / 6ヶ月 / 全期間の期間切り替え
- 曲名・アーティスト・ジャンルで棚内検索

## Spotify Developer Dashboard設定

`record-dive.html` は専用ページでPKCE認証を完結させるため、Spotifyアプリの Redirect URIs に以下を追加してください。

```text
https://kumakitiho.github.io/Spotify-Brawser/record-dive.html
```

既存のトップページ用URIも使う場合は、両方登録しておくのがおすすめです。

```text
https://kumakitiho.github.io/Spotify-Brawser/
https://kumakitiho.github.io/Spotify-Brawser/record-dive.html
```

## 必要なスコープ

現在の `config.js` に含まれている以下のスコープで動きます。

```text
user-top-read user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state
```

Record Diveの主要機能だけなら、最低限は以下です。

```text
user-top-read user-read-private user-read-email
```

## ファイル構成

```text
record-dive.html  # 体験ページ本体
record-dive.css   # 3D棚、ターンテーブル、背景演出
record-dive.js    # PKCE認証、Spotify API取得、棚生成、音声/Canvas制御
```

## 技術的に見せているポイント

### 1. PKCE OAuth

SPAにClient Secretを置かず、ブラウザだけで認証コードフローを実行します。

### 2. API Composition

Top TracksとTop Artistsを別々に取得して、曲データとアーティストのジャンル傾向を合成します。

### 3. 独自スコアリング

Spotifyの popularity、ランキング順位、ジャンル有無から `DIVE SCORE` と `RARITY` を算出しています。

### 4. CSS 3D / Canvas

WebGLを使わず、CSS 3D・視差・Canvas粒子・疑似音響ビジュアライザーで軽量にリッチさを出しています。

### 5. Progressive fallback

Spotify未接続でもデモデータでUI全体を確認できます。

## 注意

- `preview_url` はSpotify側でnullの曲が多いため、試聴できない曲があります。
- Web Playback SDKそのものではなく、まずはPreview再生とSpotify Deep Linkで軽量に成立させています。
- 本格的な再生制御を入れる場合は、次段階でWeb Playback SDKのデバイス転送とPremium前提の再生操作を入れます。
