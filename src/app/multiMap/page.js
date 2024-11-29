"use client";

import { useState, useEffect } from "react";
import OpenLayersMap from "@/components/GeolocateUsers";
import { getMovilesData } from "@/services/services"; // Importa la función de servicio
import { useRouter, useSearchParams } from "next/navigation";

// Constantes para la conversión UTM -> Lat/Lon (WGS84)
const SEMI_MAJOR_AXIS = 6378137; // Semieje mayor (a)
const SEMI_MINOR_AXIS = 6356752.314245; // Semieje menor (b)
const FLATTENING = 1 / 298.257223563; // Achatamiento (f)
const SCALE_FACTOR = 0.9996; // Factor de escala (k0)
const FALSE_NORTHING = 10000000; // Falso norte para hemisferio sur
const FALSE_EASTING = 500000; // Falso este

// Función para convertir UTM a Latitud/Longitud
const utmToLatLong = (easting, northing, zone, hemisphere = "S") => {
  const a = SEMI_MAJOR_AXIS;
  const f = FLATTENING;
  const e2 = f * (2 - f); // Excentricidad al cuadrado
  const n = f / (2 - f); // Parámetro derivado del achatamiento
  const k0 = SCALE_FACTOR;

  // Ajustar para hemisferio sur
  const northingAdjusted =
    hemisphere.toUpperCase() === "S" ? northing - FALSE_NORTHING : northing;

  // Calcular el meridiano central
  const lambda0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180); // Radianes

  // Ecuaciones UTM -> Lat/Lon
  const m = northingAdjusted / k0;
  const mu = m / (a * (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256));

  const phi1 =
    mu +
    ((3 * n) / 2 - (27 * n ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * n ** 2) / 16 - (55 * n ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * n ** 3) / 96) * Math.sin(6 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const ePrimeSquared = e2 / (1 - e2);
  const n1 = a / Math.sqrt(1 - e2 * sinPhi1 ** 2);
  const t1 = tanPhi1 ** 2;
  const c1 = ePrimeSquared * cosPhi1 ** 2;
  const r1 = (a * (1 - e2)) / (1 - e2 * sinPhi1 ** 2) ** 1.5;
  const d = (easting - FALSE_EASTING) / (n1 * k0);

  // Calcular latitud
  const latitude =
    phi1 -
    ((n1 * tanPhi1) / r1) *
      (d ** 2 / 2 -
        ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ePrimeSquared) * d ** 4) /
          24 +
        ((61 +
          90 * t1 +
          298 * c1 +
          45 * t1 ** 2 -
          252 * ePrimeSquared -
          3 * c1 ** 2) *
          d ** 6) /
          720);

  // Calcular longitud
  const longitude =
    lambda0 +
    (d -
      ((1 + 2 * t1 + c1) * d ** 3) / 6 +
      ((5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * ePrimeSquared + 24 * t1 ** 2) *
        d ** 5) /
        120) /
      cosPhi1;

  return {
    latitude: latitude * (180 / Math.PI),
    longitude: longitude * (180 / Math.PI),
  }; // Convertir a grados
};

const MultiMapPage = () => {
  const router = useRouter();
  const [personas, setPersonas] = useState([]);
  const searchParams = useSearchParams();

  // Obtener los parámetros de la URL
  const escenarioId = searchParams.get("escenarioId") || "";
  const agenciaId = searchParams.get("agenciaId") || "";

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const data = await getMovilesData(escenarioId, agenciaId);

        // Convertir las coordenadas UTM a latitud/longitud
        const convertedPersonas = data.sdtDataMoviles.map((movil) => {
          const { MovCoordX, MovCoordY, MovId } = movil;

          // Validar rango de coordenadas UTM para Uruguay
          if (
            MovCoordX < 200000 ||
            MovCoordX > 800000 || // Rango de Easting
            MovCoordY < 6000000 ||
            MovCoordY > 7000000 // Rango de Northing
          ) {
            console.warn(
              `Coordenadas fuera de rango UTM para MovId ${MovId}:`,
              {
                MovCoordX,
                MovCoordY,
              },
            );
            return null; // Ignorar este punto
          }

          // Realiza la conversión UTM -> Lat/Lon
          const { latitude, longitude } = utmToLatLong(
            parseFloat(MovCoordX),
            parseFloat(MovCoordY),
            21, // Zona UTM
            "S", // Hemisferio Sur
          );

          return {
            MovId,
            latitude,
            longitude,
          };
        });

        const validPersonas = convertedPersonas.filter((p) => p !== null); // Filtrar datos válidos
        console.log(
          "Personas con coordenadas geográficas válidas:",
          validPersonas,
        );
        setPersonas(validPersonas); // Asigna los datos convertidos al estado
      } catch (error) {
        console.error("Error al obtener datos del servicio:", error);
      }
    };

    fetchPersonas();
  }, [escenarioId, agenciaId]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h2>Mapa de Personas con Dispositivos</h2>
      <OpenLayersMap personas={personas} />
    </div>
  );
};

export default MultiMapPage;
