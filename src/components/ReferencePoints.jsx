import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

const ReferencePoints = ({ map }) => {
  const addReferencePoint = (lon, lat) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
    });

    const source = new VectorSource({ features: [feature] });
    const layer = new VectorLayer({ source });
    map.addLayer(layer);
  };

  return (
    <button
      onClick={() => {
        const lon = prompt('Longitud:');
        const lat = prompt('Latitud:');
        if (lon && lat) addReferencePoint(lon, lat);
      }}
    >
      Agregar Punto de Referencia
    </button>
  );
};

export default ReferencePoints;
