"use client";

import { useState, useEffect } from "react";
import MobilesMap from "@/components/MobilesMap";

const fetchMobilesData = async () => {
  // Simula una llamada a un servicio que devuelve datos de móviles
  return await fetch("/api/mobiles") // Cambia por tu endpoint real
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching mobiles data:", error);
      return [];
    });
};

const MobilesPage = () => {
  const [mobiles, setMobiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchMobilesData();
      setMobiles(data);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 20000); // Actualizar cada 20 segundos

    return () => clearInterval(intervalId); // Limpiar intervalo al desmontar
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h2>Mapa de Móviles</h2>
      <MobilesMap mobiles={mobiles} />
    </div>
  );
};

export default MobilesPage;
