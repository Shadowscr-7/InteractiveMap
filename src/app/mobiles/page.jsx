"use client";

import { useState, useEffect } from "react";
import MobilesMap from "@/components/MobilesMap";
import { getMoviles } from "../../services/services";

const MobilesPage = () => {
  const [mobiles, setMobiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMoviles(); // Llama al servicio modificado
        setMobiles(data);
      } catch (error) {
        console.error("Error al cargar móviles:", error);
      }
    };

    fetchData();

    //const intervalId = setInterval(fetchData, 20000); // Actualizar cada 20 segundos

    return //() => clearInterval(intervalId); // Limpiar intervalo al desmontar
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h2>Mapa de Móviles</h2>
      {/*<MobilesMap mobiles={mobiles} />*/}
    </div>
  );
};

export default MobilesPage;
