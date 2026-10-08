/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: new URL('..', import.meta.url).pathname,
  reactStrictMode: true,
  // Re-use the env var names from the Nuxt app so one .env works for both
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_FORMSPREE_ENDPOINT: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || process.env.NUXT_PUBLIC_FORMSPREE_ENDPOINT || ''
  }
}

export default nextConfig
