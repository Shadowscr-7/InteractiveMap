"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MapCompleto from "../../components/mapCompleto";
import StreetRenderer from "../../components/streetRenderer";

const Page = () => {
  const searchParams = useSearchParams();

  // Estados para manejar los parámetros
  const [pais, setPais] = useState(searchParams.get("pais") || "");
  const [departamento, setDepartamento] = useState(
    searchParams.get("departamento") || "",
  );
  const [ciudad, setCiudad] = useState(searchParams.get("ciudad") || "");
  const [calle, setCalle] = useState(searchParams.get("calle") || "");
  const [numero, setNumero] = useState(searchParams.get("numero") || "");
  const [esquina, setEsquina] = useState(searchParams.get("esquina") || "");

  useEffect(() => {
    // Sobrescribir el manejo global de errores
    const handleError = (event) => {
      const errorMessage =
        event?.message || (event.reason?.message ?? event.reason) || "";
      if (errorMessage.includes("map is null")) {
        console.debug("Silenced global error: map is null");
        event.preventDefault(); // Evitar que se registre en la consola
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  // Función para manejar actualizaciones de parámetros desde MapCompleto
  const handleParamsUpdate = (updatedParams) => {
    setPais(updatedParams.pais);
    setDepartamento(updatedParams.departamento);
    setCiudad(updatedParams.ciudad);
    setCalle(updatedParams.calle);
    setNumero(updatedParams.numero);
    setEsquina(updatedParams.esquina);
    console.log("Updated parameters from MapCompleto:", updatedParams);
  };

  return (
    <MapCompleto
      pais={pais}
      departamento={departamento}
      calle={calle}
      ciudad={ciudad}
      numero={numero}
      esquina={esquina}
      onParamsUpdate={handleParamsUpdate} // Pasar el callback
    >
      <StreetRenderer
        params={{ pais, departamento, ciudad, calle, numero, esquina }}
      />
    </MapCompleto>
  );
};

export default Page;
