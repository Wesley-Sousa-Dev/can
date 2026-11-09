import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // As capas e capturas de tela vêm da Steam, pela Can Games API.
    remotePatterns: [
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "steamcdn-a.akamaihd.net" },
    ],
  },
};

export default nextConfig;
