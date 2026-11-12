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

### コンポーネントと Provider

```text
src/
  providers/            # AppProviders と Auth / History / Locale / Theme Provider
  components/
    layout/             # Navigation、Footer
    settings/           # 表示言語・テーマの切り替え
    typing/             # 練習画面・結果モーダル・履歴・カレンダー・グラフ・言語バッジ・出典
    reviews/            # ホームのレビュー表示・投稿フォーム
    system/             # 接続確認
    ui/                 # 汎用の MotionLink
  features/             # 状態・Context・フック・採点などのロジック
  pages/
    home/               # HomePage
    auth/               # LoginPage（ログイン・プロフィール・パスワード設定）
    dashboard/          # DashboardPage
    ranking/            # RankingPage
    errors/             # NotFoundPage
    practice/
      PracticeMenuPage  # 練習を選ぶ入口（.tsx / .css）
      sentences/        # SentencePracticePage
      countries/        # CountryPracticePage
      household/        # HouseholdPracticePage
```

CSS は対応するコンポーネントと同じフォルダに配置します。Provider の適用順は `src/providers/AppProviders.tsx` に集約し、`main.tsx` はルーターとアプリの起動を担当します。
ページも用途別フォルダに分類します。新しい学習題材は `pages/practice/<題材>/` にページとCSSを置き、問題データや判定は `features/` に分けます。URLはファイル名から自動生成せず、練習メニューの共通定義で管理します。

### 表示言語の切り替え

ナビゲーションの「表示言語」から日本語／한국어を切り替えられます。モバイルではメニュー内に表示します。選択は `typing-app:ui-locale:v1` に保存し、リロード後も復元します。同じサイトの別タブにも反映します。保存領域を利用できない場合も、その画面内では切り替えられます。
表示言語とタイピングの練習言語は独立しています。切り替えても練習の進行状態・入力中のフォーム・ログイン状態は初期化しません。問題文・投稿レビュー・表示名・作者名などのデータは翻訳せず、元の内容を表示します。デモレビューの本文も元のデモデータを使います。
画面のラベル・案内・アプリ内エラー・アクセシビリティ用ラベル・日付・ページタイトルを切り替えます。ブランド名・速度単位・装飾用の英語コピーは共通です。`src/features/locale/ko.ts` に韓国語訳、`translate.ts` に日本語原文とパラメーターの変換、`useLocale.ts` に共有フックをまとめています。未知のサーバーメッセージは原文で表示します。`npm run test:locale` で翻訳キーの網羅性と保存・復元を検証できます。

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
- `/practice`: 練習を選ぶメニュー (`PracticeMenuPage.tsx` / `PracticeMenuPage.css`)
- `/practice/sentences`: 従来の文章タイピング (`SentencePracticePage.tsx` / `SentencePracticePage.css`)
- `/practice/countries`: 国旗と英語の国名を学ぶ (`CountryPracticePage.tsx` / `CountryPracticePage.css`)
- `/practice/household`: 日用品の英単語をカテゴリー別に学ぶ (`HouseholdPracticePage.tsx` / `HouseholdPracticePage.css`)
- `/learn/countries`: `/practice/countries` にリダイレクト（旧URLの互換用）
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
- `src/features/typing/samples.ts`: 韓国語の例文25文（短め15文・長め10文）と、API 取得失敗時に使う英語の例文15文（短め10文・長め5文）を管理します。
- `src/api/quotes.ts`: DummyJSON から練習用英文を取得します。先頭の英字のみ大文字にし、20〜180文字の入力可能な文章を選びます。
- `src/api/tatoeba.ts`: Tatoeba API から韓国語を一度に20件要求し、入力可能な文字・長さ・作者・ライセンスを検証して採用します。
- `src/features/typing/koreanQueue.ts`: 韓国語の未出題キュー、先読み、重複除外、sessionStorage キャッシュを管理します。
- `src/components/layout/Navigation.tsx`: PC・スマホ共通のナビゲーション。Escape キーでも閉じられます。
- `src/pages/home/HomePage.css`: ホーム専用のスタイル。共通コンポーネントは各 CSS を持ちます。

API を追加するときは `src/api/` にサービス別ファイルを作り、`createApiClient` を利用してください。
UI にはリクエスト処理を書かず、API 関数を呼び出します。Supabase の公開用キーは
Supabase 専用インスタンスだけに設定し、他の API と共有しません。
Font Awesome の使用アイコンは `src/lib/icons.ts` に集約しています。
画面側では `import { keyboardIcon, trophyIcon } from '../lib/icons'` のように参照します。
アイコンを追加・変更するときはこの共通ファイルで定義し、色やサイズは各ページ／コンポーネントの CSS で管理します。
使用するアイコンだけを名前付きでエクスポートし、未使用のものをビルドから除外できる形にしています。

英語は初回表示と「次の問題」で DummyJSON API から取得します。取得中は入力を停止し、失敗時はアプリ内の英文で練習を続けられます。
韓国語は [Tatoeba API](https://api.tatoeba.org/openapi) の `lang=kor&sort=random&limit=20&is_unapproved=no&is_orphan=no` でまとめて取得し、1文ずつ出題します。10〜180文字のハングル音節＋入力可能な ASCII、作者あり、CC BY 2.0 FR または CC0 1.0 の文章を選ぶため、採用件数は20件未満になることがあります。
未出題文が3件以下になるとバックグラウンドで補充します。未出題キュー（最大40件）と直近200件の出題済み本文を同じタブの sessionStorage に保存し、リロードや言語切り替え後にも再利用します。キャッシュの有効期限は最後の保存から24時間です。出題済み・キュー内の重複を避けます。別タブ・別端末とは共有しません。
未出題文がなく取得もできない場合は、アプリ内の韓国語25文（短め15文・長め10文）から直前と異なる文章をランダム出題します。取得失敗・利用可能な新しい文章がない場合は30秒以上空け、次に補充が必要になった時に再試行します。保存領域を使えない環境でもメモリ上のキューとローカル例文で練習できます。
Tatoeba の例文には作者・元の例文へのリンク・ライセンスを表示し、履歴とともに保存します。履歴一覧・カレンダー・グラフの詳細でも出典を確認できます。[コーパスの利用条件](https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus) に従い、データのHTMLは使用せず本文をテキスト表示します。
練習の見出し・結果モーダル・履歴・カレンダーには `LanguageBadge` で国旗と言語名を表示します。英語は米国旗、韓国語は韓国旗を使用します。
国旗 SVG は [FlagCDN](https://flagcdn.com/) から取得し、`public/flags` に保存しています。表示時の外部通信は不要です。
言語切り替え・ページ移動時には進行中の英語リクエストを中断し、古い応答が別の言語に反映されないようにしています。

## タイピング練習

### 練習メニューの拡張

ナビゲーションは「タイピング」に入口を集約します。`/practice` のカードから各練習を選び、各ページの「練習メニューに戻る」で一覧に戻れます。練習中もナビゲーションの「タイピング」が選択状態になります。
`src/features/practice/activities.ts` をメニューとルートの共通定義にしています。新しい練習を増やすときは、独立したページと専用CSS・採点ロジック／問題データを作り、この定義に `id`・`path`・タイトル・説明・カテゴリ・アイコン・`lazy` のページ読み込みを追加してください。メニューカードとルートは自動で生成されるため、ナビゲーションや `App.tsx` に個別の項目を増やす必要はありません。韓国語の表示文言は `ko.ts` に追加します。
各ページは遅延読み込みします。練習の採点方法や保存項目は題材によって異なるため、ページ・ロジックを分け、国旗表示など必要になった部品を共通化していく構成です。`npm run test:practice-menu` でID／パスの重複と翻訳を検証できます。

### 日用品の英単語で学ぶ

練習メニューの「日用品の英単語」から、キッチン・洗面所／バスルーム・掃除／洗濯・文房具・リビングの5カテゴリーを選べます。各8語、計40語を `src/features/learning/household.ts` に収録し、カテゴリー内で重複なし・ランダム順に出題します。意味は表示言語に合わせて日本語／韓国語で表示し、英語のスペルを入力します。画像の代わりに補助的な絵文字イメージを添えています。
お手本モード・クイズモード・ヒント・答えの確認・結果の振り返りに対応し、間違えた／ヒントを見た／答えを確認した単語だけをクイズで復習できます。一般的な表記を1つずつ採用しているため、別の同義語ではなく、画面のお手本の表記で答えます。通常の文章タイピング履歴には保存せず、ページを離れると進行状態をリセットします。
国名と日用品の判定・復習情報は `features/learning/session.ts` の型付き共通ロジックで管理し、共通の見た目は `src/styles/learning.css`、ページ固有の装飾は各ページのCSSで管理します。`npm run test:learning` で両方の題材を検証できます。
国名・日用品とも、正しい英語表記を入力し終えると Enter 不要で正解になります。約0.25秒の正解表示後に自動で次の問題へ進み、最後の問題なら結果を表示します。「答えを確認して進む」で表示した答えは、確認できるよう手動で次に進みます。カテゴリー／地域／学び方の変更やページ移動時には自動遷移を取り消し、次の入力欄にフォーカスを戻します。

### 国名タイピングで学ぶ

「タイピング」→「国名タイピング」から、国旗・日本語／韓国語の国名・地域を見ながら英語のスペルを学べます。`src/features/learning/countries.ts` に20か国の一般的な英語名と対訳、地域を収録しています。[UN M49](https://unstats.un.org/unsd/methodology/m49/) の地域区分を参考に、北アメリカはメキシコも含む学習用の大陸区分です。国旗は [FlagCDN](https://flagcdn.com/) から取得して `public/flags` に保存しています。プレイ中に外部APIは使いません。
地域ごとに最大10問を重複なしでランダム出題します。「お手本を見て練習」と「思い出して入力」を選べます。後者では英語表記のヒントを表示できます。大文字・小文字や前後／連続した空白は区別しません。略称ではなく表示される英語名で入力します。答えを確認して進むこともでき、終了後に各国を復習できます。
通常の文章タイピング履歴・ランキング・端末間同期とは独立した学習モードです。時間制限はなく、ページを離れると進行状態はリセットされます。`npm run test:learning` で出題・判定・ヒント・復習情報を検証できます。

### アプリのレビュー

ダッシュボード下部から、表示名（1〜20文字）・星評価（1〜5）・見出し（1〜60文字）・コメント（10〜500文字）を投稿できます。公開への同意が必要です。1アカウント1件で、投稿済みの場合は同じフォームから更新できます。メールアドレスは掲載しません。
ホームページには実際のレビューを最新6件表示します。未投稿または取得失敗時は、架空であることを明記したデモレビューを表示します。`src/data/demoReviews.ts` はデモ専用で、サーバーには登録しません。
レビューは Embla Carousel の React 版と Autoplay プラグイン（ともに8.6.0）で、6秒間隔で1枚ずつスライドします。カラフルなビジュアル・角丸・評価バッジのカードを、PCでは最大3枚、タブレットでは2枚、スマートフォンでは1枚表示します。少数のレビューでもループできるよう表示用のコピーを使い、件数や位置表示には実際の件数を使います。前後ボタン・位置ボタン・再生／停止ボタンに加え、ドラッグ／スワイプで操作できます。マウスを重ねた間、画面外、別タブでは自動再生を休止し、手動でレビューを選ぶかドラッグすると停止します。OS の「動きを減らす」設定時はアニメーションと自動再生を停止します。1件のみの場合は切り替え操作を表示しません。スタイルは `src/components/reviews/HomeReviews.css` にまとめています。
`supabase/schema/app-reviews.sql` が保存先と権限の定義です。公開レビューの読み取りと、認証済み本人による投稿・更新を許可します。フォームは `ReviewForm.tsx` / `ReviewForm.css`、取得・保存は `src/api/reviews.ts` にまとめています。検証は `npm run test:reviews` で実行できます。

### UI のモーション

Motion の `LazyMotion` と `m` コンポーネントを利用します。ページ表示・ホームの段階表示・カードのホバー・履歴切り替え・練習結果に短いアニメーションを付けています。
`MotionConfig reducedMotion="user"` により、OS の「視差効果を減らす」設定を尊重します。タイピング中の本文は動かしません。
共通のアニメーション付きリンクは `src/components/ui/MotionLink.tsx`、装飾 CSS は各ページ／コンポーネント内で管理します。

- 英語・韓国語とも API の例文で練習でき、取得失敗時はローカル例文で継続できます。言語切り替え時は進行状態を初期化します。練習中の切り替えはできません。
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
- `supabase/schema/practice-history-deletion.sql` を続けて適用すると、ダッシュボードの「全履歴を削除」から、確認後に本人のクラウド履歴と端末のアカウント別 localStorage を削除できます。削除日時を同期し、別端末の古いキャッシュからの再送を防ぎます。本人の DELETE と削除日時の読み書きだけを追加許可します。通信できない場合は削除エラーを表示し、再試行できます。公開ランキング・設定・ログイン前の履歴・別アカウントの履歴は削除しません。
- 練習ページとダッシュボードの履歴は「一覧」「カレンダー」「グラフ」で切り替えられます。カレンダーは月移動・今日への移動・日付別の詳細表示に対応します。
- グラフは英語（WPM）・韓国語（CPM）を分け、入力速度と正確率の推移を2つの折れ線で表示します。横軸は等間隔の練習順（古い→新しい）で、直近30件／最大100件から選択できます。手動終了を含む各回の点を選ぶと、数値・終了理由・問題文を確認できます。キーボードでは結果の選択欄から操作できます。グラフは SVG と専用の `PracticeChart.css` で実装しています。
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

国名タイピングには Three.js の3D地球を表示します。出題国の代表地点が正面になるよう回転し、マーカーを表示します。PCでは右側、幅900px以下では入力欄の下に配置します。20か国の代表緯度経度は `src/features/learning/locations.ts` に保存し、外部APIやAPIキーは不要です。地図はNatural Earthのパブリックドメインデータ（110m land、https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson）を `public/maps/land.geojson` に同梱しています。国境や正確な国土の中心を表すものではありません。地球は遅延読み込みし、回転が完了したら描画ループを止め、ページを離れる際はGPUリソースを解放します。動きを減らす設定では瞬時に切り替え、WebGL未対応時はメッセージを表示して練習を継続できます。

出題国の国境・海岸線を鮮やかなピンク色の線で表示します。Natural Earthの110m admin 0 countriesから20か国の境界座標のみ抽出して `public/maps/country-borders.json` に同梱しています（https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson）。境界は簡略化された学習用の表示です。問題切替時に前の国の線を解放し、新しい国の線に切り替えます。

国名タイピング・日用品の英単語ページでは、共通のON/OFF設定を使い、出題時にWeb Speech APIで英語の発音を自動再生します。初期設定はONで、ON/OFFは端末のlocalStorageに保存します。「発音を聞く」で繰り返し再生でき、問題・カテゴリー変更、OFF、結果表示、ページ離脱時には前の音声を停止します。ブラウザの制限により最初に操作が必要な場合があり、音声の種類・利用可否は端末の英語音声に依存します。日本語・韓国語のUI切替にかかわらず、発音は英語です。

「お店の英単語」（`/practice/shops`）を練習メニューに追加しました。コーヒーショップ・ハンバーガー・ピザ・フライドチキン・スイーツの5カテゴリー、各4店の全20店をランダム出題します。正確な入力で自動的に次へ進み、復習モードも利用できます。店名のアポストロフィーとハイフンも入力対象です。自動英語発音・ON/OFFは国名・日用品と共通の端末設定を使います。ロゴパネルはPCでは入力欄の右、幅900px以下では下に表示します。各公式サイトのアイコンとWikimedia CommonsのChick-fil-Aロゴを `public/logos/` に同梱し、取得元と公式サイトを `sources.json` に記録しています。ロゴ取得用APIへの実行時アクセスはありません。名称・ロゴは各社に帰属します。

国名・日用品・お店の学習は全問を終えた時点で1回分の記録を保存します。ダッシュボードの「学習記録」で種類別に絞り込み、カテゴリー・学習モード・出題数・正解数・ヒント／ミスなしの正解数・出題内容を確認できます。文章タイピングの速度・正確率・グラフ・ランキングとは分けて表示します。既存のアカウント別localStorageとSupabaseのprivate practice_results同期を共用し、両種の記録を合わせて最新100件保持します。既存JSONにlearningメタデータを追加するためDB変更は不要です。保存用の互換フィールド（WPM・時間）は0で、学習記録の速度測定を意味しません。全履歴削除・ログイン前記録の取り込みにも学習記録を含みます。過去の未保存の学習結果や途中で離脱した回は復元しません。

韓国語の文章練習では、IMEの組み立て途中をハングルの構成パーツに分解して確認できます。お手本と一致するパーツは緑、不一致は赤、未入力はグレーで表示します。複合母音・複合子音も分解し、次の音節への組み替えも連続したパーツとして比較します。途中の表示はプレビュー専用で、ミス・入力回数・CPM・完了判定は従来どおりIME確定後の文字を使います。英語の入力仕様は変更していません。

韓国語IMEの組み立て中は、パーツの追加・変更ごとに打鍵音を再生します。一致する追加パーツは通常音、不一致はエラー音で、ミスの集計は確定後のままです。IME確定時の同じパーツや音節の組み替えでは打鍵音を重複させません。削除時は無音、終了時は従来の完了音です。既存の打鍵音ON/OFF・種類・音量設定が適用されます。

韓国語練習の設定「ハングルのパーツを確認」で補助パネルをON/OFFにできます。初期値はONで、端末に設定を保存します。OFFでも問題文の入力色・打鍵音・採点はそのまま利用できます。

「旅行の英会話」（`/practice/travel`）では、空港・ホテル・レストラン・買い物・交通の5カテゴリー、各6文・全30文のオリジナル短文を練習できます。意味は日本語・韓国語に対応し、場面カードと自動英語発音、ON/OFF、聞き直し、お手本／クイズ、苦手フレーズの復習を利用できます。正確に入力すると自動で次へ進み、全問終了時にダッシュボードの学習記録へ保存します。句読点・アポストロフィー・ハイフンを入力でき、既存の単語練習の入力制限は維持します。発音設定・保存・同期・削除は既存の学習機能を共用します。
