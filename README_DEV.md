// download-font-plugin

このディレクトリは、DownloadFontPluginを独立したnpmライブラリとして公開するためのものです。

- `src/` : プラグイン本体
- `dist/` : バンドル済み配布ファイル
- `test/` : 動作確認用テスト
- `index.js` : エントリポイント

## 公開手順
1. `package.json` の内容を確認
2. `dist/` にESM/UMD形式でビルド
3. `npm publish` で公開

## テスト
```
node ./test/download-font-plugin.test.js
```
