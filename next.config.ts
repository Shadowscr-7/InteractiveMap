import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Ruta en tu frontend
        destination: 'http://192.168.1.72:8082/ICA_Geos_/rest/:path*', // URL del backend
      },
    ];
  },
};

export default nextConfig;
