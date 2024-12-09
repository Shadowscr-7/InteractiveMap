import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  poweredByHeader: false, // Desactiva el branding de Vercel

  async rewrites() {
    return [
      {
        source: "/api/:path*", // Ruta en tu frontend
        destination: "https://www.riogas.uy/puestos2/rest/ImportarOSM/:path*", // Ruta base del backend
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Ignorar las rutas UNC en Watchpack para evitar errores de watch y escaneo
    config.watchOptions = {
      ignored: [
        path.resolve("\\\\perfilesterminalserveralias.glp.riogas.com.uy"),
      ],
    };

    // Desactivar la caché de Webpack si es necesario
    config.cache = false;

    // Configuración opcional para resolver problemas de módulos en rutas UNC
    config.resolve = {
      ...config.resolve,
      symlinks: false, // Evita problemas al seguir enlaces simbólicos
      fallback: {
        ...config.resolve?.fallback,
        fs: false, // Evita el uso de módulos del sistema de archivos en el cliente
      },
    };

    return config;
  },
};

export default nextConfig;
