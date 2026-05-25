import createNextIntlPlugin from "next-intl/plugin";

// 1. Initialize the plugin with the path to your i18n file
const withNextIntl = createNextIntlPlugin("./i18n.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.eu.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
};

// 2. WRAP and EXPORT the config (This is the missing step)
export default withNextIntl(nextConfig);