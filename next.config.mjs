/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['d3s4gao37ngkzb.cloudfront.net']
  },
  eslint: {
    ignoreDuringBuilds: true // Temporarily ignore ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true // Temporarily ignore TypeScript errors during build
  }
}

export default nextConfig