import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Remove output: "export" for Vercel - it handles Next.js natively
  // For self-hosting static build, use: output: "export"
  turbopack: {},
};

export default withPWA(nextConfig);
