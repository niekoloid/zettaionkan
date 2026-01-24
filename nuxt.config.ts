// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  routeRules: {
    '/lp': { prerender: true },
    '/': { prerender: true },
    '/auth/**': { ssr: false },
    '/account/**': { ssr: false },
    '/subscription/**': { ssr: false }
  },
  supabase: {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY,
    redirect: false,
    clientOptions: {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true
      }
    }
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'いろおと - 絶対音感トレーニング',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  srcDir: 'app/',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: true,
  nitro: {
    compressPublicAssets: true,
  },
  experimental: {
    // inlineSSRStyles is removed in newer Nuxt 3 versions
  },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      formspreeEndpoint: process.env.NUXT_PUBLIC_FORMSPREE_ENDPOINT,
      stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY
    }
  }
})
