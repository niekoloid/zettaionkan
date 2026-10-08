# いろおと — Next.js 版 (段階移行中)

Nuxt (`../app`) から Next.js (App Router) + React + TypeScript + Tailwind へ段階的に移行しています。
Nuxt 側は動作確認が済むまで残します。Cookie 名・環境変数名は Nuxt 版と共通です。

```bash
cd next
npm install
cp .env.example .env     # Supabase の値を設定
npm run dev              # http://localhost:3000
npm run typecheck
```

`public/` は `../public` へのシンボリックリンクです(音声・画像は Nuxt と共有)。

## 移行状況

| 区分 | Nuxt | Next.js |
| --- | --- | --- |
| 定数・型 (`constants/`, `types/`) | `app/constants`, `app/types` | `src/constants`, `src/types` (コピー) |
| 設定 / 和音カスタマイズ / 機能ゲート / Pro 判定 / 認証 | `app/composables/*` | `src/lib/app-context.tsx` |
| 音声エンジン (Tone.js) | `useAudio.ts` | `src/lib/audio.tsx` (カスタム音声は未移行) |
| 連続日数 | `useStreak.ts` | `src/lib/streak.ts` |
| ヘッダー / 楽譜 / PROモーダル / 読み込み表示 | `components/*` | `src/components/*` |
| **トップ `/`** | `pages/index.vue` | ✅ `src/app/page.tsx` |
| `/autoplay` + 8 表示モード | `pages/autoplay.vue`, `*GameMode.vue` | ⏳ |
| `/chordquizz`, `useChordFrequency` | | ⏳ |
| `/settings`, `/voice-settings`, `useVoiceSettings`, `VoiceRecorder` | | ⏳ |
| `/history`, `/account`, `/auth`, `/subscription/*` | | ⏳ |
| 静的ページ (about, method, faq, contact, legal, privacy, terms, company), `/lp` | | ⏳ |
| `/admin/*`, `server/api/admin/*` | | ⏳ |
| 機能ゲートのルートガード (`feature-gate.global.ts`) | | ⏳ (`middleware.ts` or layout) |
| sitemap / PWA / canonical | `@nuxtjs/sitemap` | ⏳ |
| Supabase Edge Functions (Stripe) | `supabase/functions` | 変更不要 (フロントのフレームワーク非依存) |
