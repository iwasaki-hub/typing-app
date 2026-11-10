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
import { getSupabase } from './lib/supabase'
const supabase = getSupabase()
```

`check:supabase` は公開用キーで Auth API の設定取得による疎通確認を行います。
ランキング用テーブルとメールログインを実装しています。テーブルを追加する場合も
RLS を有効にし、必要なアクセス権とポリシーを設定してください。

接続方法: [Supabase 公式ドキュメント](https://supabase.com/docs/reference/javascript/initializing)

## ソースの構成
### 画面とルーティング

React Router の `BrowserRouter` を使用します。

- `/`: ホーム (`HomePage.tsx` / `HomePage.css`)
- `/practice`: タイピング練習 (`TypingPage.tsx` / `TypingPage.css`)
- `/ranking`: 全ユーザーランキング (`RankingPage.tsx` / `RankingPage.css`)
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
- 保存禁止や容量不足の際は案内を表示し、練習は続行できます。ランキングへの公開は別途、本人が操作します。

構成: `QuotePractice.tsx`（英文取得）、`TypingPractice.tsx` と専用 CSS（練習画面）、
`src/features/typing/session.ts`（計測・判定）、`useTypingSound.ts`（Web Audio による効果音）。

計測ロジックのテスト: `npm run test:typing`（TypeScript を直接実行できる Node.js 22.18 以降を使用）。

## 全ユーザーランキング

- `/ranking` で30・60・120秒別に、各ユーザーのベスト記録を上位100人まで表示します。
- WPM 降順、正確率降順、登録日時昇順で並びます。同じ条件の最良記録を1人1件に絞ります。
- メールのログインリンクで認証し、同じブラウザに保存された履歴と公開表示名を選んで投稿します。投稿は自動ではありません。
- メールアドレスはスコアテーブルに保存しません。公開されるのはユーザーID・表示名・成績・登録日時です。
- 計測5秒以上、1〜300 WPM、入力完了または時間切れの結果のみ対象です。旧履歴は打鍵数がないため対象外です。
- WPM と正確率は DB の生成列で算出します。RLS で本人の投稿のみ許可し、更新・削除はクライアントに許可しません。
- 計測値の入力自体はブラウザから送信されます。改ざんや自動入力を完全には防げず、練習文の難易度も異なるため、カジュアルな比較用です。
- `src/api/ranking.ts` に Axios 通信を集約。認証セッション管理のみ Supabase SDK を使います。
- `supabase/schema/typing-ranking.sql` は適用済みのスキーマ定義です。別プロジェクトでは SQL Editor から一度適用してください。
- `scripts/check-ranking.sql` は検証用ユーザー・記録をトランザクション内で作り、権限・集計をテスト後すべてロールバックします。

### メールログインの設定

[Supabase URL Configuration](https://supabase.com/dashboard/project/tfhrkovrmxxeoaueqxin/auth/url-configuration) で次を設定します。

- Site URL: `https://typing-app-orpin.vercel.app`
- Redirect URLs: `https://typing-app-orpin.vercel.app/ranking` と、実際に利用するローカル URL（例 `http://localhost:5173/ranking`）

Email プロバイダーを有効にし、Magic Link のメールテンプレートはログインリンクを含む標準形式を使用してください。
未登録のリダイレクト先は Site URL にフォールバックします。Preview URL も利用するなら個別に許可してください。
Supabase の標準メール送信には宛先制限・送信上限があるため、一般公開時は
[Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) を設定してください。
こちらから実メールの送信確認は行っていません。自分のメールでリンク受信→ログイン→投稿を確認してください。

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
