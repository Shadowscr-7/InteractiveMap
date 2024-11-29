const MapInteraction = ({ map }) => {
  const handleMapClick = (event) => {
    const coordinate = map.getEventCoordinate(event);
    console.log("Coordenadas:", coordinate);
    // Puedes enviar estas coordenadas a un servicio o actualizar el estado
  };

  if (map) {
    map.on("click", handleMapClick);
  }

  return null;
};

export default MapInteraction;
