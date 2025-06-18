import https from 'https';
import fs from 'fs';
import path from 'path';

/**
 * Webpack plugin to download and bundle Material Symbols font.
 */
export default class DownloadFontPlugin {
  constructor(options = {}) {
    this.fontSettings = {
      fill: options.fill || 0,
      weight: options.weight || 300,
      grade: options.grade || 0,
      opticalSize: options.opticalSize || 20
    };
    this.icons = options.icons || [];
    this.outputDir = options.outputDir || path.resolve(process.cwd(), 'src/assets/fonts');
    const iconsHash = this.icons.length > 0 ? this.generateIconsHash(this.icons) : 'default';
    this.fontFileName = `material-symbols-f${this.fontSettings.fill}w${this.fontSettings.weight}g${this.fontSettings.grade}o${this.fontSettings.opticalSize}-${iconsHash}.woff2`;
    this.cssFileName = 'material-symbols.css';
    this.cssUrl = 'https://fonts.googleapis.com/css2'
      + '?family=Material+Symbols+Outlined'
      + ':opsz,wght,FILL,GRAD@'
      + `${this.fontSettings.opticalSize},${this.fontSettings.weight},${this.fontSettings.fill},${this.fontSettings.grade}`
      + '&display=swap'
      + (this.icons.length > 0 ? `&text=${this.icons.join('+')}` : '');
  }

  generateIconsHash(icons) {
    const str = icons.sort().join(',');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('DownloadFontPlugin', async (compilation, callback) => {
      const fontDir = this.outputDir;
      if (!fs.existsSync(fontDir)) {
        fs.mkdirSync(fontDir, { recursive: true });
      }
      const fontPath = path.join(fontDir, this.fontFileName);
      const cssPath = path.join(fontDir, this.cssFileName);
      try {
        if (fs.existsSync(fontPath) && fs.existsSync(cssPath)) {
          console.log(`Font files already exist: ${this.fontFileName}`);
          callback();
          return;
        }
        this.cleanupOldFonts(fontDir);
        const cssContent = await this.fetchWithUserAgent(this.cssUrl);
        const woff2Url = this.extractWoff2Url(cssContent);
        if (!woff2Url) {
          throw new Error('Could not find woff2 URL in CSS');
        }
        await this.downloadFont(woff2Url.replace(/['"]/g, ''), fontPath);
        const localCss = this.generateLocalCss();
        fs.writeFileSync(cssPath, localCss);
        console.log(`Generated font files: ${this.fontFileName}`);
        callback();
      } catch (err) {
        console.error('Error in DownloadFontPlugin:', err);
        callback(err);
      }
    });
  }

  async fetchWithUserAgent(url) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          'Accept': 'text/css,*/*;q=0.1',
          'Accept-Encoding': 'gzip, deflate, br',
          'sec-ch-ua': '"Chromium";v="122"',
          'sec-ch-ua-platform': '"Windows"'
        }
      };
      https.get(url, options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch CSS: ${res.statusCode}`));
          return;
        }
        if (res.headers['content-encoding'] === 'gzip' || res.headers['content-encoding'] === 'br') {
          import('zlib').then(zlib => {
            const stream = res.headers['content-encoding'] === 'br' ? zlib.createBrotliDecompress() : zlib.createGunzip();
            res.pipe(stream);
            let data = '';
            stream.on('data', chunk => data += chunk);
            stream.on('end', () => resolve(data));
            stream.on('error', reject);
          });
        } else {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }
      }).on('error', reject);
    });
  }

  cleanupOldFonts(fontDir) {
    const files = fs.readdirSync(fontDir);
    files.forEach(file => {
      if (file.startsWith('material-symbols-') && (file !== this.fontFileName)) {
        fs.unlinkSync(path.join(fontDir, file));
      }
    });
  }

  extractWoff2Url(css) {
    const urlMatch = css.match(/src:\s*url\((.*?)\)\s+format\(['"](?:truetype|ttf|woff2)['"]\)/);
    if (!urlMatch) return null;
    let fontUrl = urlMatch[1].replace(/['"]/g, '');
    return fontUrl.replace(/\.ttf$/, '.woff2');
  }

  generateLocalCss() {
    return `/* Material Symbols Outlined */\n@font-face {\n  font-family: 'Material Symbols Outlined';\n  font-style: normal;\n  font-weight: ${this.fontSettings.weight};\n  font-display: block;\n  src: url('./${this.fontFileName}') format('woff2');\n}\n\n.material-symbols-outlined {\n  font-family: 'Material Symbols Outlined';\n  font-weight: normal;\n  font-style: normal;\n  font-size: 24px;\n  line-height: 1;\n  letter-spacing: normal;\n  text-transform: none;\n  display: inline-block;\n  white-space: nowrap;\n  word-wrap: normal;\n  direction: ltr;\n  font-feature-settings: 'liga';\n  -webkit-font-feature-settings: 'liga';\n  -webkit-font-smoothing: antialiased;\n  font-variation-settings:\n    'FILL' ${this.fontSettings.fill},\n    'wght' ${this.fontSettings.weight},\n    'GRAD' ${this.fontSettings.grade},\n    'opsz' ${this.fontSettings.opticalSize};\n}`;
  }

  downloadFont(url, filePath) {
    return new Promise((resolve, reject) => {
      https.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download font: ${response.statusCode}`));
          return;
        }
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      }).on('error', reject);
    });
  }
}
