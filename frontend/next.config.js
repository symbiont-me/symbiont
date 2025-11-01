/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SUPERTOKENS_API_ENDPOINT:
      process.env.NEXT_PUBLIC_SUPERTOKENS_API_ENDPOINT,
  },
  output: "standalone",
};

module.exports = nextConfig;
