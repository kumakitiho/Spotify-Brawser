# Cinematic Deck

Spotifyのトップ楽曲を、フルスクリーンのレコードプレーヤー体験として楽しむためのShelf Mode拡張です。

## 有効化

```text
https://kumakitiho.github.io/Spotify-Brawser/?cinematic=1
```

一度有効化するとブラウザのlocalStorageに保存されます。

無効化:

```text
https://kumakitiho.github.io/Spotify-Brawser/?cinematic=0
```

ブランチを`/root`から直接Pages公開してClient IDが必要な場合:

```text
?spotifyClientId=YOUR_CLIENT_ID&cinematic=1
```

Client Secretは使用しません。

## 体験

- アルバムジャケットを使ったぼかし背景
- 木製プランスと回転するレコード盤
- 再生進行に合わせて内周へ移動するトーンアーム
- 横スクロール・スナップ対応のレコードクレート
- Spotifyの既存再生処理への接続
- Midnight / Amber / Neonのシーン切替
- Surprise Meによるランダム選曲
- Focus Sceneによる再生画面への集中
- Session Tapeによるセッション内履歴
- Web Share APIまたはクリップボード共有

## 操作

| 操作 | 動作 |
|---|---|
| 左右矢印 | レコード選択 |
| Space / Enter | 針を落とす・再生/停止 |
| F | Focus Scene切替 |
| R | Surprise Me |
| Esc | Cinematic Deckを閉じる |
| ジャケットをダブルクリック | 選択して再生 |

## 安定性方針

- `index.html`の再生ロジックを複製しない
- 既存の`.shelf-track`または`.track-row`へクリックを委譲する
- 広範囲の`MutationObserver`を使用しない
- JavaScriptの常時アニメーションループを使用しない
- 開いている間だけ再生状態を軽量同期する
- `prefers-reduced-motion`を尊重する

## ファイル

```text
cinematic-deck.css
cinematic-deck-themes.css
cinematic-deck-fixes.css
cinematic-deck.js
cinematic-deck-guard.js
```

## テスト

```bash
npm test
```

テストでは以下を確認します。

- Cinematic Deckアセットがmanifestに登録されている
- ビルド後の`dist`へ全ファイルがコピーされる
- Client IDの本番・プレビュー分岐が存在する
- 旧フリーズ原因の広範囲DOM監視が含まれない
- GitHub Pages用configが正しく生成される
