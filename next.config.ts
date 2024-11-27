import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Ruta en tu frontend
        destination: 'https://www.riogas.uy/puestos2/rest/ImportarOSM/:path*', // Ruta base del backend
      },
    ];
  },
};

export default nextConfig;
