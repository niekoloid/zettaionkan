# いろおと — Next.js 版

Nuxt (`../app`) から Next.js (App Router) + React + TypeScript + Tailwind へ移行したものです。

```bash
cd next
npm install
cp .env.local.example .env.local     # Supabase の値を設定
npm run dev              # http://localhost:3000
npm run typecheck
```

`dev` / `build` の前に `../public` を `./public` へコピーします(音声・画像は Nuxt と共有。`scripts/sync-public.mjs`)。

## 移行状況

全ページ・全コンポーネントを Next.js (App Router) に移植済みです。Nuxt 側 (`../app`) は本番切り替えまで残します。

| 区分 | Nuxt | Next.js |
| --- | --- | --- |
| 定数・型 | `app/constants`, `app/types` | `src/constants`, `src/types` (コピー) |
| 設定 / 和音カスタマイズ / 機能ゲート / Pro 判定 / 認証 / PROモーダル | `app/composables/*` | `src/lib/app-context.tsx` |
| 音声エンジン (Tone.js) / 声の設定 | `useAudio.ts`, `useVoiceSettings.ts` | `src/lib/audio.tsx`, `src/lib/voice.tsx` |
| 連続日数 / 出題頻度 | `useStreak.ts`, `useChordFrequency.ts` | `src/lib/streak.ts`, `src/lib/chord-frequency.ts` |
| トップ `/` | `pages/index.vue` | `src/app/(app)/page.tsx` |
| `/autoplay` + 8 表示モード | `pages/autoplay.vue`, `*GameMode.vue` | `src/app/(app)/autoplay`, `src/components/game/*` |
| `/chordquizz` | `pages/chordquizz.vue` | `src/app/(app)/chordquizz` |
| `/settings`, `/voice-settings`, `/history`, `/auth`, `/account`, `/subscription(/success)`, `/contact` | `pages/*` | `src/app/(app)/*` |
| 静的ページ (about, method, faq, company, legal, privacy, terms) | `pages/*` | `src/app/(app)/*` |
| `/lp` | `pages/lp/index.vue` | `src/app/lp` + `src/components/lp/*` (アプリのプロバイダー外) |
| `/admin/features`, `/admin/video-gen` + `server/api/admin/*` | `pages/admin`, `server/api` | `src/app/(app)/admin/*`, `src/app/api/admin/*` |
| ルートガード | `middleware/feature-gate.global.ts` | `src/components/RouteGuard.tsx` |
| sitemap | `@nuxtjs/sitemap` | `src/app/sitemap.ts` |
| Supabase Edge Functions (Stripe) | `supabase/functions` | 変更不要 (フロントのフレームワーク非依存) |

### 実装メモ
- 表示モード 8 種などテンプレート量の多い部分は、Vue テンプレート → JSX の変換スクリプトで機械的に移植し、ロジックだけ手で React に書き直しています。
- Vue の `<Transition>` は、入場アニメーションのみ CSS (`src/components/game/game-modes.css`) で再現しています(退場アニメーションは省略)。
- 環境変数は `VITE_*` / `NUXT_PUBLIC_*` / `SUPABASE_*` も読めます(`next.config.mjs`)。
- Cookie 名・形式は Nuxt 版と共通なので、設定は両方で引き継がれます。

### テスト
```bash
npm run typecheck                 # 型チェック
npm run build                     # 本番ビルド
npm run dev                       # 別ターミナルで起動して
BASE_URL=http://localhost:3000 npm run test:smoke   # 全ページ表示 + クイズ + PROモーダル
```
`test:smoke` は Chrome が必要です(`CHROME_PATH` で指定可)。

## 開発環境(zandobank と同じ構成)

Supabase は **dev / prod の 2 プロジェクト** + **ローカル(Docker)** の 3 つを使い分けます。

| 用途 | 接続先 | 設定ファイル |
| --- | --- | --- |
| 日常の開発 | ローカル Supabase(推奨) | `.env.development.local`(`npm run db:env` が生成) |
| ホスト版 dev で確認 | `zettaionkan-dev` | `.env.local` |
| 本番 | `zettaionkan-prod` | Vercel の環境変数 / `.env.production` |

Next.js の読み込み順は `.env.development.local` > `.env.local` > `.env.development` > `.env` なので、
**ローカル用ファイルを消せば自動的にホスト版 dev に戻ります**。

### 1. ホスト版 dev プロジェクトに向ける
```bash
cd next && npm install
cp .env.local.example .env.local      # zettaionkan-dev の URL / anon key を記入
npm run dev                           # http://localhost:3000
npm run check-db                      # 接続先の中身を確認(読み取りのみ)
```
環境の切り替え: `cp .env.production .env.local`(本番を見たいとき限定。破壊的な操作はしない)。

### 2. ローカル Supabase に向ける(Docker Desktop を起動して)
```bash
npm run setup:local      # supabase start(初回 + migrations + seed.sql)+ .env.development.local を生成
npm run dev
```

| 用途 | コマンド / URL |
| --- | --- |
| DB を初期状態に戻す | `npm run db:reset` |
| 停止 / 状態・キー確認 | `npm run db:stop` / `npm run db:status` |
| Studio / 受信メール(Mailpit) | http://127.0.0.1:54323 / http://127.0.0.1:54324 |
| ローカルを使うのをやめる | `.env.development.local` を削除 |

seed のテストユーザー(パスワードはすべて `password123`):

| メール | プラン |
| --- | --- |
| `test@example.com` | premium(`/auth` の「DEBUG TEST LOGIN」もこれ)+ 学習履歴サンプル |
| `standard@example.com` | standard |
| `entry@example.com` | entry |
| `free@example.com` | free(ログイン中は entry 扱い) |

### 3. Supabase プロジェクトへのリンク
```bash
SUPABASE_DEV_REF=<dev の project ref> npm run supabase:link:dev
npm run supabase:link:prod            # 本番(マイグレーションを流す前に必ず確認)
```
注意: `supabase/` は現在 **本番にリンク済み**(`supabase/.temp/project-ref`)です。`supabase start` には影響しませんが、
`supabase db push` は dev にリンクし直してから、内容を確認して実行してください。

### 4. テスト
```bash
npm test                  # Jest(単体: lib のロジック・プラン判定など)
npm run test:coverage
npm run typecheck
npm run build
BASE_URL=http://localhost:3000 npm run test:e2e   # 全ページ表示 + クイズ + PROモーダル(Chrome が必要)
```

### 5. デバッグ(VS Code)
「実行とデバッグ」から `Next.js: debug full stack`(サーバー + ブラウザ両方にブレークポイント)、
または `Next.js: フルスタック(Chrome併用)`。

### 6. デプロイ(Vercel)
`next/vercel.json`(リージョン `hnd1`、API の最大実行時間 30 秒、セキュリティヘッダー)を同梱しています。
Vercel の環境変数に **prod** の値を設定します(`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` ほか)。
Preview 環境には dev プロジェクトの値を入れると、ブランチごとのプレビューが dev DB に繋がります。

## 共有用テスト環境 (Vercel プレビュー + テスト用 Supabase)

1. Vercel で `niekoloid/zettaionkan` をインポート
2. **Root Directory** = `next`(「Include source files outside of the Root Directory」は ON のまま。`../public` をコピーするため)
3. Framework Preset = Next.js(自動検出)
4. Environment Variables(Preview)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. ブランチ `claude/optimistic-thompson-qayzyl` をプッシュするとプレビューURLが発行されます
6. Supabase の Authentication > URL Configuration の Redirect URLs に、プレビューURL(`https://<project>-*.vercel.app/**`)を追加

> 既存(本番)の Supabase に接続する場合、プレビューから行った操作(ログイン、学習履歴の保存など)は本番データに書き込まれます。
