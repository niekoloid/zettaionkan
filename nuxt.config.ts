// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxtjs/sitemap'
  ],
  site: {
    url: 'https://zettaionkan.jp',
    name: 'いろおと - 絶対音感トレーニング'
  },
  sitemap: {
    exclude: [
      '/auth/**',
      '/account/**',
      '/subscription/**',
      '/admin/**',
      '/legal',
      '/privacy',
      '/company'
    ],
    defaults: {
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }
  },
  routeRules: {
    '/': { sitemap: { priority: 1.0, changefreq: 'weekly' }, prerender: true },
    '/lp': { sitemap: { priority: 0.9, changefreq: 'weekly' }, prerender: true },
    '/auth/**': { ssr: false, sitemap: false },
    '/account/**': { ssr: false, sitemap: false },
    '/subscription/**': { ssr: false, sitemap: false }
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
  // Move tailwind to components/pages to avoid entry.css
  // css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'いろおと - 絶対音感トレーニング',
      htmlAttrs: {
        lang: 'ja'
      },
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
  features: {
    inlineStyles: true
  },
  experimental: {},
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      formspreeEndpoint: process.env.NUXT_PUBLIC_FORMSPREE_ENDPOINT,
      stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY
    }
  }
})
