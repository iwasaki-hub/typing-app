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
### デザインの切り替え

ナビゲーション内のパレットアイコン横の選択欄で「シンプル」「リラックス」を切り替えられます。
スマートフォンなどではハンバーガーメニュー内に表示します。
シンプルは従来の UI、リラックスは [Headspace](https://www.headspace.com/) を参考にしたクリーム・オレンジ・ラベンダーの配色と丸いカードです。
独自のテーマとして実装し、参照サイトのロゴや画像は使用していません。
選択は `typing-app:theme:v1` でブラウザに保存し、リロード・ページ移動後も維持します。
テーマを変えても入力内容・練習結果・ログイン状態は初期化しません。
`ThemeProvider`／`useTheme()` で状態を共有し、`src/styles/themes.css` と各ページ／コンポーネント CSS の `data-theme=calm` セレクターで装飾を管理します。

### 画面とルーティング

React Router の `BrowserRouter` を使用します。

- `/`: ホーム (`HomePage.tsx` / `HomePage.css`)
- `/practice`: タイピング練習 (`TypingPage.tsx` / `TypingPage.css`)
- `/ranking`: 全ユーザーランキング (`RankingPage.tsx` / `RankingPage.css`)
- `/login`: メールログイン (`LoginPage.tsx` / `LoginPage.css`)
- `/dashboard`: ログイン後のダッシュボード (`DashboardPage.tsx` / `DashboardPage.css`)
- `/profile`: 表示名編集・ログアウト (`LoginPage.tsx` のプロフィール表示)
- `/reset-password`: パスワード設定 (`LoginPage.tsx` のパスワード設定表示)
- その他: 404 案内 (`NotFoundPage.tsx` / `NotFoundPage.css`)

ルート定義は `src/App.tsx` に集約しています。共通ナビゲーションは `Link` / `NavLink` を使い、
「このアプリについて」「使い方」はホーム内の該当箇所へ移動します。
`vercel.json` の SPA リライトで、`/practice` の直接アクセスや再読み込みにも対応します。
ページを離れると進行中の練習はリセットされます。


- `src/api/client.ts`: Axios の共通設定（15秒のタイムアウト）とエラーメッセージ変換。
- `src/api/supabase.ts`: Supabase の接続確認。接続設定は初回リクエスト時に検証します。
- `src/features/typing/samples.ts`: 韓国語の例文15文と、API 取得失敗時に使う英語の例文15文（各言語とも短め10文・長め5文）を管理します。
- `src/api/quotes.ts`: DummyJSON から練習用英文を取得します。先頭の英字のみ大文字にし、20〜180文字の入力可能な文章を選びます。
- `src/components/Navigation.tsx`: PC・スマホ共通のナビゲーション。Escape キーでも閉じられます。
- `src/pages/HomePage.css`: ホーム専用のスタイル。共通コンポーネントは各 CSS を持ちます。

API を追加するときは `src/api/` にサービス別ファイルを作り、`createApiClient` を利用してください。
UI にはリクエスト処理を書かず、API 関数を呼び出します。Supabase の公開用キーは
Supabase 専用インスタンスだけに設定し、他の API と共有しません。
Font Awesome の使用アイコンは `src/lib/icons.ts` に集約しています。
画面側では `import { keyboardIcon, trophyIcon } from '../lib/icons'` のように参照します。
アイコンを追加・変更するときはこの共通ファイルで定義し、色やサイズは各ページ／コンポーネントの CSS で管理します。
使用するアイコンだけを名前付きでエクスポートし、未使用のものをビルドから除外できる形にしています。

英語は初回表示と「次の問題」で DummyJSON API から取得します。取得中は入力を停止し、失敗時はアプリ内の英文で練習を続けられます。
韓国語は通信せずにアプリ内の15文（短め10文・長め5文）からランダムに出題します。初回もランダムで、「次の問題」では直前と同じ文章を除いて選びます。
練習の見出し・結果モーダル・履歴・カレンダーには `LanguageBadge` で国旗と言語名を表示します。英語は米国旗、韓国語は韓国旗を使用します。
国旗 SVG は [FlagCDN](https://flagcdn.com/) から取得し、`public/flags` に保存しています。表示時の外部通信は不要です。
言語切り替え・ページ移動時には進行中の英語リクエストを中断し、古い応答が別の言語に反映されないようにしています。

## タイピング練習

### UI のモーション

Motion の `LazyMotion` と `m` コンポーネントを利用します。ページ表示・ホームの段階表示・カードのホバー・履歴切り替え・練習結果に短いアニメーションを付けています。
`MotionConfig reducedMotion="user"` により、OS の「視差効果を減らす」設定を尊重します。タイピング中の本文は動かしません。
共通のアニメーション付きリンクは `src/components/MotionLink.tsx`、装飾 CSS は各ページ／コンポーネント内で管理します。

- 英語は API、韓国語は15文のローカル例文で練習できます。言語切り替え時は進行状態を初期化します。練習中の切り替えはできません。
- 最初の入力で計測開始（韓国語は IME 変換開始時）。30・60・120秒から制限時間を選択できます。
- 1文を正しく入力するか、制限時間になると結果を表示します。手動終了も可能です。
- 終了結果はモーダルに表示し、「次の問題」「同じ文でやり直す」を選べます。Esc・閉じるボタン・背景クリックで閉じ、「結果を表示する」で再表示できます。
- モーダルは Headless UI の `Dialog`・`DialogPanel`・`DialogBackdrop` を使い、Portal・フォーカス制御・背景操作／スクロールの抑止をライブラリで管理します。Motion の表示演出も維持しています。次の問題の読み込み後は入力欄にフォーカスを戻します。
- 英語の WPM は正しい文字数 ÷ 5 ÷ 経過分数。韓国語の CPM は正しい確定文字数 ÷ 経過分数です。ハングル1音節を1文字として数え、空白・句読点も含みます。
- 韓国語は OS の韓国語キーボード／IME を利用します。変換中の下書きは採点せず、確定した文字を NFC に正規化して判定します。IME 変換中も制限時間は進みます。
- Backspace で修正しても、それ以前のミスは正確率に残ります。正確率は英語では入力文字、韓国語では確定文字を単位に計算します。貼り付けは両言語で無効です。
- 打鍵音は初期状態でオフ。オン／オフ・音量を調整でき、通常入力・ミス・クリアで音が変わります。
- 音の種類は「クラシック」「ソフト」「メカニカル風」「レトロ」の4種類。「試聴」は打鍵音オフでも選択中の音を確認できます（音量0では無音）。Web Audio で合成し、外部の音声ファイルは取得しません。
- UI テーマ（シンプル／リラックス）・練習言語・制限時間・打鍵音のオン／オフ・音の種類・音量は localStorage に保存し、リロードやページ移動後も復元します。同じ端末・ブラウザ・サイト内で保持し、別の端末には同期しません。保存できない環境でも、その画面内の設定変更は利用できます。練習の進行状態は復元しません。
- 終了した結果（クリア・時間切れ・手動終了）は localStorage に最新100件を自動保存し、練習ページ下部に履歴を表示します。
- ログイン中は Supabase の非公開 `practice_results` テーブルに自動保存し、同じアカウントの別端末でも最新100件を取得します。ログイン時・練習結果保存時・通信復帰時・画面再表示時・表示中の60秒ごとに同期します。「今すぐ同期」からも更新できます。
- アカウント別に端末のキャッシュを分離します。ログイン前の履歴は自動送信せず、「この端末のログイン前の記録を取り込む」からコピーできます。元の端末内履歴は残ります。ログイン後の履歴はログアウトすると画面から切り離されます。
- 通信エラー時は端末内の記録を保持して再試行します。端末側の保存上限は100件のため、同期せずに上限を超えて練習すると古い未送信記録は残りません。クラウドは記録を保持しますが、画面・集計・カレンダーの対象は最新100件です。設定は引き続き端末ごとに保持します。
- テーブル定義と RLS は `supabase/schema/practice-history.sql` に保存しています。本人のみ読み取り・追加を許可し、更新・削除・未ログインでのアクセスは許可しません。同じ記録IDはアカウント内で重複保存しません。ランキングへの公開は従来どおり別操作です。
- 練習ページとダッシュボードの履歴は「一覧」「カレンダー」で切り替えられます。カレンダーは月移動・今日への移動・日付別の詳細表示に対応します。
- 日付はブラウザのローカル時刻で集計します。カレンダーも保存済みの最新100件が対象で、削除された古い履歴は表示されません。
- 保存禁止や容量不足の際は案内を表示し、練習は続行できます。ランキングへの公開は別途、本人が操作します。

履歴とカレンダーには言語・速度単位を表示します。過去の言語情報がない履歴は英語として扱います。
ランキングは英語のみを対象とし、ダッシュボードの最高 WPM も英語のみで集計します。

構成: `QuotePractice.tsx`（言語・例文選択）、`TypingPractice.tsx` と専用 CSS（練習画面）、
`src/features/typing/session.ts`（計測・判定）、`useTypingSound.ts`（Web Audio による効果音）。

計測ロジックのテスト: `npm run test:typing`（TypeScript を直接実行できる Node.js 22.18 以降を使用）。

## 全ユーザーランキング

- `/ranking` で30・60・120秒別に、各ユーザーのベスト記録を上位100人まで表示します。
- WPM 降順、正確率降順、登録日時昇順で並びます。同じ条件の最良記録を1人1件に絞ります。
- メールアドレス＋パスワードで認証し、同じブラウザに保存された履歴と公開表示名を選んで投稿します。投稿は自動ではありません。
- メールアドレスはスコアテーブルに保存しません。公開されるのはユーザーID・表示名・成績・登録日時です。
- 計測5秒以上、1〜300 WPM、入力完了または時間切れの結果のみ対象です。旧履歴は打鍵数がないため対象外です。
- WPM と正確率は DB の生成列で算出します。RLS で本人の投稿のみ許可し、更新・削除はクライアントに許可しません。
- 計測値の入力自体はブラウザから送信されます。改ざんや自動入力を完全には防げず、練習文の難易度も異なるため、カジュアルな比較用です。
- `src/api/ranking.ts` に Axios 通信を集約。認証セッション管理のみ Supabase SDK を使います。
- `supabase/schema/typing-ranking.sql` は適用済みのスキーマ定義です。別プロジェクトでは SQL Editor から一度適用してください。
- `scripts/check-ranking.sql` は検証用ユーザー・記録をトランザクション内で作り、権限・集計をテスト後すべてロールバックします。

### メールアドレス＋パスワード認証

通常のログインは Supabase Auth の `signInWithPassword` を使い、メールは送信しません。
`/login` の「新規登録」では表示名・メールアドレス・パスワードを入力します。
メール確認が有効な場合、確認メールから登録を完了してからログインしてください。
確認設定を無効にする変更は行っていません。

既存のメールリンク利用者は次の方法で移行できます。

- ログイン済み：`/profile` の「パスワードを設定・変更」で保存します。
- ログアウト済み：`/login` の「パスワードを忘れた方・初めて設定する方」から設定メールを受け取ります。
- メールのリンクを開くと `/reset-password` に移動し、新しいパスワードを保存できます。
- 新しいパスワードは8〜128文字、確認入力との一致を検証します。パスワードの保存・検証は Supabase Auth が行います。アプリ独自のテーブル・ブラウザ保存領域には保管しません。

通常のログイン後は `/dashboard` に移動します。表示名は `/profile` から変更できます。
未ログインで `/dashboard` や `/profile` を開くとログインページへ移動します。
名前は表示専用の `user_metadata.display_name` に保存し、権限判定には使用しません。

状態は `AuthProvider` が購読し、`useAuth()` から `session`・`user`・`isAuthenticated`・`ready`・`error`・`displayName` を参照します。
操作は `logout()`・`saveDisplayName(name)`・`savePassword(password)` を利用します。
`PASSWORD_RECOVERY` の際は `isPasswordRecovery` でパスワード設定画面へ誘導し、保存完了で解除します。
再読み込み時は Supabase SDK が保存済みセッションを復元します。認証トークンを独自に保存する処理はありません。

### Supabase のメール・URL設定

[URL Configuration](https://supabase.com/dashboard/project/tfhrkovrmxxeoaueqxin/auth/url-configuration)：

- Site URL：`https://typing-app-orpin.vercel.app`
- Redirect URLs：`https://typing-app-orpin.vercel.app/ranking` と `http://localhost:5173/ranking`（実際の開発URLに合わせる）

登録確認・パスワード再設定のメールは既存の許可済み `/ranking` で受け取ります。
`type=recovery` の場合は `/reset-password`、それ以外は `/dashboard` へアプリ内で移動します。
Supabase 標準の確認・パスワード再設定メールテンプレートを利用してください。
`/dashboard` や `/reset-password` のリダイレクトURL追加は不要です。

### メール送信上限について

パスワードによる通常ログインでは送信枠を消費しません。新規登録の確認メールとパスワード再設定メールには引き続き上限があります。
SMTP 未設定で制限中の場合、パスワード未設定の既存ユーザーは制限解除または SMTP 設定後に設定メールを受信する必要があります。
通常ログインはメール再送の60秒待機に影響されません。

メール送信操作は成功・HTTP 429 時に60秒の待機を設け、同じオリジンの保存領域に期限のみ保持します。
メールアドレス・パスワード・トークンは待機データに含みません。待機終了はサーバー制限解除を保証しません。
ローカルと公開サイトが同じプロジェクトを使う場合、サーバーの送信枠も共有します。

一般公開時は [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) を設定してください。

1. メール配信サービスで送信元を認証し、SMTP 接続情報を取得します。
2. [SMTP Settings](https://supabase.com/dashboard/project/tfhrkovrmxxeoaueqxin/auth/smtp) に設定します。SMTP パスワードは Vite の環境変数やリポジトリに追加しません。
3. [Rate Limits](https://supabase.com/dashboard/project/tfhrkovrmxxeoaueqxin/auth/rate-limits) と配信サービス側の送信枠を確認します。

認証テスト：`npm run test:auth`（SDK をスタブ化して実メールを送信せず、ログイン・再ログイン・登録・再設定・再送制限を検証）。
実アカウントではパスワードを本人が設定して、ログイン→ログアウト→再ログインを確認してください。

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
