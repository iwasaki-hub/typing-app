# Typing App

## Supabase 接続

接続先: typing-app（東京リージョン）

- [Supabase Dashboard](https://supabase.com/dashboard/project/tfhrkovrmxxeoaueqxin)
- クライアント: `src/lib/supabase.ts`

ローカルでは `.env.local` に設定済みです。別の環境では `.env.example` を
`.env.local` にコピーし、Project URL と Publishable key を設定してください。
ホスティング先にも同じ環境変数を設定し、変更後は開発サーバーを再起動してください。
フロントエンドには Publishable key を使用し、Secret / service_role key は設定しないでください。

```sh
npm install
npm run check:supabase
npm run dev
```

アプリからは次のようにクライアントを利用できます。

```ts
import { supabase } from './lib/supabase'
```

`check:supabase` は公開用キーで Auth API の設定取得による疎通確認を行います。
テーブルやログイン画面はまだ作成していません。テーブルを追加する場合は
RLS を有効にし、必要なアクセス権とポリシーを設定してください。

接続方法: [Supabase 公式ドキュメント](https://supabase.com/docs/reference/javascript/initializing)

## Vite テンプレート

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
