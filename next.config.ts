import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera em .next/standalone um servidor enxuto, com só o necessário, usado pela imagem Docker.
  output: "standalone",
  images: {
    // As capas e capturas de tela vêm da Steam, pela Can Games API.
    remotePatterns: [
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "steamcdn-a.akamaihd.net" },
    ],
  },
};

export default nextConfig;
