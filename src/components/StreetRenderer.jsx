import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { useEffect, useRef } from "react";

const StreetRenderer = ({ map, params, isMapReady, setLastCoordinates }) => {
  const { departamento, calle, pais, numero, esquina, ciudad } = params;
  const streetSource = useRef(new VectorSource()); // Persistencia de la fuente para los datos de la calle
  const markerSource = useRef(new VectorSource()); // Fuente para los marcadores

  useEffect(() => {
    if (!map || !isMapReady) {
      console.debug("Map or isMapReady is not ready yet. Skipping rendering.");
      return; // Detener ejecución si el mapa no está listo
    }

    // Limpieza inicial de ambas capas antes de cualquier acción
    console.log("Limpiando capas de calle y marcadores...");
    streetSource.current.clear(); // Limpia la fuente de calles
    markerSource.current.clear(); // Limpia la fuente de marcadores

    // Función para obtener datos de una calle completa (sin número ni esquina)
    const fetchStreetData = async () => {
      if (!departamento || !calle || !pais || numero || esquina) {
        console.debug("Skipping street rendering as markers take precedence.");
        return; // Evitar pintar la calle si se pasa número o esquina
      }

      console.log("Fetching street data for:", {
        departamento,
        calle,
        pais,
        ciudad,
      });

      // Consulta Overpass para obtener los tramos de una calle específica
      const overpassQuery = `
        [out:json];
        area["name"="${pais}"]["admin_level"="2"]->.countryArea;
        area["name"="${departamento}"]["admin_level"="4"](area.countryArea)->.searchArea;
        way["name"~"^${calle}$"](area.searchArea);
        out geom;
      `;
      console.log("Overpass query for street:", overpassQuery);

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

      try {
        const response = await fetch(overpassUrl);
        if (!response.ok)
          throw new Error(
            `Overpass API error: ${response.status} ${response.statusText}`,
          );

        const data = await response.json();
        console.log("Overpass street data:", data);

        if (data.elements && data.elements.length > 0) {
          const features = data.elements
            .filter((element) => element.type === "way" && element.geometry)
            .map((way) => {
              const coordinates = way.geometry.map(({ lon, lat }) =>
                fromLonLat([lon, lat]),
              );
              const feature = new Feature({
                geometry: new LineString(coordinates),
              });

              feature.setStyle(
                new Style({
                  stroke: new Stroke({
                    color: "blue", // Color de la calle
                    width: 4, // Ancho de la línea
                  }),
                }),
              );

              return feature;
            });

          console.log("Features created:", features);
          streetSource.current.addFeatures(features);

          // Ajustar la vista del mapa al contenido
          const extent = streetSource.current.getExtent();
          if (extent && extent.every((value) => value !== Infinity)) {
            map
              .getView()
              .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
          } else {
            console.warn("No valid extent found for the street features.");
          }
        } else {
          console.warn("No street segments found in Overpass API.");
        }
      } catch (error) {
        console.error("Error fetching street data:", error.message);
      }
    };

    // Función para obtener y marcar un punto en el mapa
    const fetchMarkerData = async () => {
      if (!calle || (!numero && !esquina)) {
        console.debug(
          "Skipping marker rendering: Calle, Numero or Esquina not provided.",
        );
        return;
      }

      console.log("Fetching marker data for:", { calle, numero, esquina });

      try {
        let lon, lat;

        if (numero && !esquina) {
          // Caso: Calle + Número (sin Esquina)
          console.log("Caso: Calle + Número (sin Esquina)");
          const locationQuery = `${calle} ${numero ? `#${numero}` : ""}, ${ciudad || ""}, ${departamento}, ${pais}`;
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&addressdetails=1`;
          console.log("Nominatim URL:", nominatimUrl);

          const response = await fetch(nominatimUrl);
          if (!response.ok)
            throw new Error(
              `Nominatim API error: ${response.status} ${response.statusText}`,
            );

          const data = await response.json();
          console.log("Nominatim data:", data);

          const validResult = data.find((result) =>
            ["node", "place", "house"].includes(result.osm_type),
          );

          if (validResult) {
            lon = parseFloat(validResult.lon);
            lat = parseFloat(validResult.lat);
            console.log(
              "Marker data from Nominatim:",
              validResult.display_name,
            );
          } else {
            console.warn(
              "No valid address found with Nominatim for Calle + Número.",
            );
            return;
          }
        } else {
          // Caso: Calle + Esquina
      console.log("Caso: Calle + Esquina");
      const overpassQuery = `
        [out:json];
        way["name"="${calle}"]->.street1;  // Primera calle
        way["name"="${esquina}"]->.street2;  // Segunda calle
        node(w.street1)(w.street2);  // Nodo en la intersección
        out geom;
      `;
      console.log("Overpass query for intersection:", overpassQuery);

      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: overpassQuery,
          headers: { "Content-Type": "text/plain" },
        },
      );

      if (!response.ok) throw new Error("Overpass API error");
      const overpassData = await response.json();
      console.log("Overpass data for intersection:", overpassData);

      // Filtrar nodos relevantes para intersección
      const intersectionNode = overpassData.elements.find(
        (el) => el.type === "node",
      );
      if (intersectionNode) {
        lon = intersectionNode.lon;
        lat = intersectionNode.lat;
        console.log(
          "Marker data from Overpass (intersection):",
          intersectionNode,
        );
      } else {
        console.warn("No intersection found for Calle + Esquina.");
        return;
      }
    }

    if (lon !== undefined && lat !== undefined) {
      // Crear y agregar marcador
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src:
              "data:image/svg+xml;charset=utf-8," +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            `),
            scale: 1,
          }),
        }),
      );

      markerSource.current.addFeature(marker);
      map.getView().setCenter(fromLonLat([lon, lat]));
      map.getView().setZoom(17);

      console.log("Marker rendered at:", { lon, lat });

      if (esquina) {
        onParamsUpdate && onParamsUpdate({ esquina });
        console.log("Updated esquina parameter:", esquina);
      }
    }
  } catch (error) {
    console.error("Error fetching marker data:", error.message);
  }
};
    

    if (numero || esquina) {
      fetchMarkerData();
    } else {
      fetchStreetData();
    }
  }, [map, isMapReady, departamento, calle, pais, numero, esquina, ciudad]);

  useEffect(() => {
    console.log("Adding street and marker layers...");
    const streetLayer = new VectorLayer({
      source: streetSource.current,
    });
    const markerLayer = new VectorLayer({
      source: markerSource.current,
    });

    map.addLayer(streetLayer);
    map.addLayer(markerLayer);

    return () => {
      console.log("Removing street and marker layers...");
      map.removeLayer(streetLayer);
      map.removeLayer(markerLayer);
    };
  }, [map]);

  return null;
};

export default StreetRenderer;
