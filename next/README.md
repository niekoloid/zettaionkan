# いろおと — Next.js 版

Nuxt (`../app`) から Next.js (App Router) + React + TypeScript + Tailwind へ移行したものです。

```bash
cd next
npm install
cp .env.example .env     # Supabase の値を設定
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

## テスト環境 (Vercel プレビュー)

1. Vercel で `niekoloid/zettaionkan` をインポート
2. **Root Directory** = `next`(「Include source files outside of the Root Directory」は ON のまま。`../public` をコピーするため)
3. Framework Preset = Next.js(自動検出)
4. Environment Variables(Preview)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. ブランチ `claude/optimistic-thompson-qayzyl` をプッシュするとプレビューURLが発行されます
6. Supabase の Authentication > URL Configuration の Redirect URLs に、プレビューURL(`https://<project>-*.vercel.app/**`)を追加

> 既存(本番)の Supabase に接続する場合、プレビューから行った操作(ログイン、学習履歴の保存など)は本番データに書き込まれます。
