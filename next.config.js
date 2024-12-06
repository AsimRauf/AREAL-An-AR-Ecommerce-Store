/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      's3.amazonaws.com',
      `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
      'fakestoreapi.com',
      'images.unsplash.com',
      'd3s4gao37ngkzb.cloudfront.net'
    ]
  },
  output: 'standalone'
}

module.exports = nextConfig