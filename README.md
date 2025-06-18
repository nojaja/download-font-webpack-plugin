# download-font-webpack-plugin
Webpack plugin to download and bundle Material Symbols font.
Webpack用のフォントダウンロードプラグインです。

## インストール
```
npm install download-font-plugin
```

## 使い方
webpack.config.js でプラグインを読み込んで利用します。

```js
import DownloadFontPlugin from 'download-font-plugin';

export default {
  // ...
  plugins: [
    new DownloadFontPlugin({
      // オプション例
      fontUrl: 'https://example.com/font.woff2',
      outputPath: 'fonts/'
    })
  ]
};
```

## オプション
- `fontUrl` (string): ダウンロードするフォントファイルのURL
- `outputPath` (string): 出力先ディレクトリ

## ライセンス
MIT

