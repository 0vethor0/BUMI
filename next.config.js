/** @type {import('next').NextConfig} */
const nextConfig = {
  
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  },
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

