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

## ソースの構成
### 画面とルーティング

React Router の `BrowserRouter` を使用します。

- `/`: ホーム (`HomePage.tsx` / `HomePage.css`)
- `/practice`: タイピング練習 (`TypingPage.tsx` / `TypingPage.css`)
- その他: 404 案内 (`NotFoundPage.tsx` / `NotFoundPage.css`)

ルート定義は `src/App.tsx` に集約しています。共通ナビゲーションは `Link` / `NavLink` を使い、
「このアプリについて」「使い方」はホーム内の該当箇所へ移動します。
`vercel.json` の SPA リライトで、`/practice` の直接アクセスや再読み込みにも対応します。
ページを離れると進行中の練習はリセットされます。


- `src/api/client.ts`: Axios の共通設定（15秒のタイムアウト）とエラーメッセージ変換。
- `src/api/supabase.ts`: Supabase の接続確認。接続設定は初回リクエスト時に検証します。
- `src/api/quotes.ts`: DummyJSON から練習用英文を取得。20〜180文字の英文を選び、引用符などを入力しやすい半角記号に整えます。
- `src/components/Navigation.tsx`: PC・スマホ共通のナビゲーション。Escape キーでも閉じられます。
- `src/pages/HomePage.css`: ホーム専用のスタイル。共通コンポーネントは各 CSS を持ちます。

API を追加するときは `src/api/` にサービス別ファイルを作り、`createApiClient` を利用してください。
UI にはリクエスト処理を書かず、API 関数を呼び出します。Supabase の公開用キーは
Supabase 専用インスタンスだけに設定し、他の API と共有しません。
Font Awesome は使用する無料アイコンだけをインポートしています。

タイピング問題は初回表示と「次の問題」で取得します。取得中は入力と問題切り替えを停止し、
通信失敗や適切な英文が見つからない場合はローカルの練習文を表示します。
外部 API は Supabase とは別の Axios インスタンスを使い、API キーは送信しません。
取得元: [DummyJSON Quotes](https://dummyjson.com/docs/quotes)。

## Vite テンプレート
## タイピング練習

- 最初の一文字で計測開始。30・60・120秒から制限時間を選択できます。
- 1文を正しく入力するか、制限時間になると結果を表示します。手動終了も可能です。
- WPM は現在正しく入力した文字数 ÷ 5 ÷ 経過分数。正確率は正しい打鍵数 ÷ 全打鍵数です。
- Backspace で修正しても、それ以前のミスは正確率に残ります。貼り付け・日本語の変換入力は対象外です。
- 打鍵音は初期状態でオフ。オン／オフ・音量を調整でき、通常入力・ミス・クリアで音が変わります。
- 終了した結果（クリア・時間切れ・手動終了）は localStorage に最新100件を自動保存し、練習ページ下部に履歴を表示します。
- 履歴は同じブラウザ・同じオリジンに保存されます。ローカル環境と公開サイト、別端末の間では共有されません。
- 保存禁止や容量不足の際は案内を表示し、練習は続行できます。データベースへの保存は行いません。

構成: `QuotePractice.tsx`（英文取得）、`TypingPractice.tsx` と専用 CSS（練習画面）、
`src/features/typing/session.ts`（計測・判定）、`useTypingSound.ts`（Web Audio による効果音）。

計測ロジックのテスト: `npm run test:typing`（TypeScript を直接実行できる Node.js 22.18 以降を使用）。

## Vite の参考情報


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
