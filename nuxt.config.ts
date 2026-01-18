// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY,
    redirect: false
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Zettaionkan',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  srcDir: '.',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }
})
