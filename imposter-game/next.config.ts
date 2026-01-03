import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Enable Turbopack with empty config to silence the warning
  // next-pwa uses webpack, so we need to use webpack for build
  turbopack: {},
};

export default withPWA(nextConfig);
