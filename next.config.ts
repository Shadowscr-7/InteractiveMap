import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // Desactiva el branding de Vercel

  async rewrites() {
    return [
      {
        source: "/api/:path*", // Ruta en tu frontend para la primera API
        destination: "https://www.riogas.uy/puestos2/rest/ImportarOSM/:path*", // Ruta base del backend para la API principal
      },
      {
        source: "/api2/:path*", // Ruta en tu frontend para la segunda API
        destination: "http://192.168.1.72:8082/ICA_Geos_/Apis/:path*", // Ruta del servicio del curl
      },
    ];
  },
};

export default nextConfig;
