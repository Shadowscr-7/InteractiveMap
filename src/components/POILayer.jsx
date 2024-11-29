import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

const POILayer = ({ map }) => {
  const loadPOIs = async () => {
    const apiUrl = "/api/pois"; // Cambia por tu servicio local

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const features = data.map((poi) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([poi.lon, poi.lat])),
        });

        feature.setStyle(
          new Style({
            image: new Icon({
              src: "/path/to/icon.png",
              scale: 0.7,
            }),
          }),
        );

        return feature;
      });

      const poiSource = new VectorSource({ features });
      const poiLayer = new VectorLayer({ source: poiSource });
      map.addLayer(poiLayer);
    } catch (error) {
      console.error("Error loading POIs:", error);
    }
  };

  return <button onClick={loadPOIs}>Cargar POIs</button>;
};

export default POILayer;
