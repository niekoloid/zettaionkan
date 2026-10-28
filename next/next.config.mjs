/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Accept the env var names the earlier Nuxt app used, so the Vercel settings keep working
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_FORMSPREE_ENDPOINT:
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || process.env.NUXT_PUBLIC_FORMSPREE_ENDPOINT || ''
  },
  async headers() {
    return [
      {
        // Piano samples and narration never change in place
        source: '/(samples|narration|audio)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      }
    ]
  },
  async redirects() {
    // Old routes from the previous app
    return [
      { source: '/autoplay', destination: '/listen', permanent: false },
      { source: '/chordquizz', destination: '/today', permanent: false },
      { source: '/history', destination: '/record', permanent: false },
      { source: '/subscription', destination: '/plans', permanent: false },
      { source: '/auth', destination: '/login', permanent: false },
      { source: '/lp', destination: '/', permanent: true },
      { source: '/flags', destination: '/mat', permanent: true }
    ]
  }
}

export default nextConfig
