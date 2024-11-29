const fetch = require("node-fetch");

// Función para esperar un tiempo específico (en milisegundos)
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Función para obtener nodos de Overpass API
async function findNodes(calle, targetLat, targetLon, radius = 500) {
  const overpassUrl = "https://overpass-api.de/api/interpreter";

  const query = `
    [out:json];
    area["name"="Uruguay"]->.searchArea;   // Define el área del país
    way["name"="${calle}"](area.searchArea)->.mainStreet; // Filtra por el país y la calle
    node(w.mainStreet)(around:${radius}, ${targetLat}, ${targetLon}); // Dinámico al punto de referencia
    out geom;
  `;

  console.log("Consulta Overpass generada:\n", query);

  try {
    const response = await fetch(overpassUrl, {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });

    if (!response.ok) {
      console.error("Error en la solicitud a Overpass API:", response.statusText);
      throw new Error(`Overpass API Error: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("Respuesta completa de Overpass:");
    console.log(JSON.stringify(data, null, 2)); // Mostrar toda la respuesta en formato legible

    // Filtrar nodos relevantes
    const nodes = data.elements.filter((el) => el.type === "node");
    console.log(`Nodos encontrados: ${nodes.length}`);
    return nodes.map((node) => ({
      lat: node.lat,
      lon: node.lon,
      tags: node.tags,
    }));
  } catch (error) {
    console.error("Error al procesar la consulta de Overpass API:", error.message);
    return [];
  }
}

// Función para realizar geocodificación inversa (usando Nominatim)
async function reverseGeocode(lat, lon) {
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  try {
    const response = await fetch(nominatimUrl);
    if (!response.ok) {
      console.error(`Error en la geocodificación inversa: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return {
      address: data.display_name,
      details: data.address,
    };
  } catch (error) {
    console.error(`Error al realizar geocodificación inversa para (${lat}, ${lon}):`, error.message);
    return null;
  }
}

// Función para determinar si el nodo es una esquina
function isIntersection(details, callePrincipal) {
  if (!details || !details.road) return false;

  // Si hay múltiples nombres de calles en los detalles, es probable que sea una esquina
  const roads = details.road.split(", ");
  return roads.some((road) => road !== callePrincipal);
}

// Función para calcular la distancia entre dos puntos geográficos
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Devuelve la distancia en metros
}

// Función principal
(async function main() {
  const calle = "Avenida Jacobo Varela"; // Nombre de la calle principal
  const targetLat = -34.8602677; // Latitud del punto de referencia
  const targetLon = -56.1518006; // Longitud del punto de referencia
  const dynamicRadius = 150; // Define el radio dinámico

  console.log(`Buscando nodos para la calle: ${calle} dentro de un radio de ${dynamicRadius} metros.`);

  const nodes = await findNodes(calle, targetLat, targetLon, dynamicRadius);

  const intersections = [];

  if (nodes.length > 0) {
    console.log(`Se encontraron ${nodes.length} nodo(s):`);

    for (const [index, node] of nodes.entries()) {
      console.log(`\nNodo ${index + 1}:`);
      console.log(`- Coordenadas: (${node.lat}, ${node.lon})`);

      // Esperar 1 segundo antes de realizar la geocodificación inversa
      await wait(1000);

      // Realizar geocodificación inversa para cada nodo
      const geocodeData = await reverseGeocode(node.lat, node.lon);
      if (geocodeData) {
        console.log(`- Dirección: ${geocodeData.address}`);
        console.log(`- Detalles: ${JSON.stringify(geocodeData.details)}`);

        // Verificar si el nodo es una esquina
        const isCorner = isIntersection(geocodeData.details, calle);
        if (isCorner) {
          console.log("- Este nodo pertenece a una esquina.");
          console.log(`- Esquina con: ${geocodeData.details.road}`);
          const distance = calculateDistance(targetLat, targetLon, node.lat, node.lon);
          intersections.push({
            lat: node.lat,
            lon: node.lon,
            distance,
            details: geocodeData.details,
          });
        } else {
          console.log("- Este nodo no es una esquina.");
        }
      } else {
        console.log("- No se pudo obtener información de geocodificación inversa.");
      }
    }

    // Ordenar las intersecciones por distancia al punto objetivo
    intersections.sort((a, b) => a.distance - b.distance);

    console.log("\nLas dos esquinas más cercanas son:");
    intersections.slice(0, 2).forEach((intersection, index) => {
      console.log(`\nEsquina ${index + 1}:`);
      console.log(`- Coordenadas: (${intersection.lat}, ${intersection.lon})`);
      console.log(`- Distancia: ${intersection.distance.toFixed(2)} metros`);
      console.log(`- Detalles: ${JSON.stringify(intersection.details)}`);
    });
  } else {
    console.log("No se encontraron nodos.");
  }
})();
