import DownloadFontPlugin from '../src/download-font-plugin.js';
import path from 'path';

// テスト用のwebpackモック
class MockCompiler {
  constructor() {
    this.hooks = {
      beforeRun: {
        tapAsync: (name, fn) => {
          this._fn = fn;
        }
      }
    };
  }
  run() {
    return new Promise((resolve, reject) => {
      this._fn({}, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

(async () => {
  const plugin = new DownloadFontPlugin({
    icons: ['home', 'search'],
    outputDir: path.resolve('./test/fonts')
  });
  const compiler = new MockCompiler();
  plugin.apply(compiler);
  try {
    await compiler.run();
    console.log('フォントダウンロードテスト成功');
  } catch (e) {
    console.error('フォントダウンロードテスト失敗:', e);
  }
})();
