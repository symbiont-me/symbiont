/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SUPERTOKENS_WEBSITE_DOMAIN: process.env.NEXT_PUBLIC_SUPERTOKENS_WEBSITE_DOMAIN,
  },
  output: "standalone",
};

module.exports = nextConfig;
