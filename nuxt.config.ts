// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY,
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
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY
  }
})
