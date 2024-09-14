/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: 'http://127.0.0.1:8000'
  },
  output: "standalone",
};

module.exports = nextConfig;
