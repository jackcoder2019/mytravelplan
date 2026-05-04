import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for Amplify to work with Next.js App Router
  transpilePackages: ['@aws-amplify/ui-react'],
}

export default nextConfig
