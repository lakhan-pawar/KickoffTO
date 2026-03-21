import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'media.api-football.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['kickoffto.com', 'localhost:3000'] },
  },
}

export default nextConfig
