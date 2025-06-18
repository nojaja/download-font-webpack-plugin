# download-font-webpack-plugin
Webpack plugin to download and bundle Material Symbols font.
Webpack�p�̃t�H���g�_�E�����[�h�v���O�C���ł��B

## �C���X�g�[��
```
npm install download-font-plugin
```

## �g����
webpack.config.js �Ńv���O�C����ǂݍ���ŗ��p���܂��B

```js
import DownloadFontPlugin from 'download-font-plugin';

export default {
  // ...
  plugins: [
    new DownloadFontPlugin({
      // �I�v�V������
      fontUrl: 'https://example.com/font.woff2',
      outputPath: 'fonts/'
    })
  ]
};
```

## �I�v�V����
- `fontUrl` (string): �_�E�����[�h����t�H���g�t�@�C����URL
- `outputPath` (string): �o�͐�f�B���N�g��

## ���C�Z���X
MIT

