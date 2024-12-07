/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['d3s4gao37ngkzb.cloudfront.net',
      'main.d1e1nwvnufs9wc.amplifyapp.com'
    ]
  },
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': '.'
      }
    }
    return config
  }
}

module.exports = nextConfig