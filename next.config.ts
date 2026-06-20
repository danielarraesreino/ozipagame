import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /meme é uma URL intuitiva pra "manda teu meme" — evita 404
      { source: "/meme", destination: "/enviar-meme", permanent: false },
    ];
  },
};

export default nextConfig;
