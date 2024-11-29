// src/app/zones/page.tsx
"use client";

import { useState, useEffect } from "react";
import ZonesMap from "@/components/ZonesMap";
import { zonesData } from "@/data/zonesData";

interface Zone {
  nombre: string;
  coord: number[][];
  color: string;
  movilesActivos: number;
  pedidosPendientes: number;
}

const ZonesPage = () => {
  const [zones, setZones] = useState<Zone[]>([]); // Aplicar el tipo Zone[]

  useEffect(() => {
    // Cargar los datos mockeados (simulación de llamada a un servicio)
    setZones(zonesData);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h2>Mapa de Zonas</h2>
      <ZonesMap zones={zones} />
    </div>
  );
};

export default ZonesPage;
