# いろおと (zettaionkan)

幼児向け絶対音感トレーニングアプリ (Nuxt 4 + Supabase + Stripe + Tone.js)。

## ローカル開発

1. Node.js 20 以上を用意し、依存関係をインストール
   ```bash
   npm install
   ```
2. 環境変数を設定
   ```bash
   cp .env.example .env
   # SUPABASE_URL / SUPABASE_KEY を開発用プロジェクトの値に書き換える
   ```
3. 開発サーバー起動 → http://localhost:3000
   ```bash
   npm run dev
   ```

### デバッグ
- **ブラウザ側**: Chrome DevTools の Sources / Vue DevTools。Nuxt DevTools は画面下部のアイコンから(`devtools: { enabled: true }`)。
- **VS Code**: `.vscode/launch.json` の「Nuxt: フルスタック」で、サーバー側(Node)とクライアント側(Chrome)を同時にデバッグできます。
- **サーバーAPI (`server/api`)**: `npm run dev:inspect` で Node Inspector (`--inspect`) 付きで起動し、Chrome の `chrome://inspect` から接続。

### ローカルでの注意点
- Supabase は必須です(未設定だと起動時にエラー)。`profiles` / `training_sessions` / `inquiries` テーブルが必要なので、**本番ではなく開発用プロジェクト**を使ってください。
- 機能の出し分けは `profiles.subscription_tier`(`free/entry/standard/premium`)で決まります。有料機能の確認は、開発用DBでこの値を直接書き換えるのが簡単です。`/admin/features` で機能ごとのティアも確認できます。
- 音声は初回のユーザー操作後に再生されます(ブラウザの自動再生制限)。音が出ない場合はまずクリックしてください。
- Stripe は **テストキー** を使用。Edge Functions のデプロイ/ローカル実行には Supabase CLI が必要です。

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
