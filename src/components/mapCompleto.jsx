'use client';

import 'ol/ol.css';
import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

const MapCompleto = ({ pais, departamento, calle }) => {
  const mapRef = useRef(null);
  const streetSource = useRef(new VectorSource()); // Fuente para las calles
  const layerRef = useRef(new TileLayer({ source: new OSM() }));

  useEffect(() => {
    const fetchStreetCoordinates = async () => {
      const address = `${calle || ''}, ${departamento || ''}, ${pais || ''}`;
      console.log('Fetching street data for:', address);

      const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json&polygon_geojson=1&addressdetails=1`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'MapCompleto/1.0 (youremail@example.com)',
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response from Nominatim:', data);

        if (data.length > 0) {
          // Procesar cada calle/tramo por separado
          streetSource.current.clear(); // Limpiar datos previos
          data.forEach((item) => {
            if (item.geojson && item.geojson.type === 'LineString') {
              const coordinates = item.geojson.coordinates.map(([lon, lat]) =>
                fromLonLat([lon, lat])
              );

              const streetFeature = new Feature({
                geometry: new LineString(coordinates),
              });

              streetFeature.setStyle(
                new Style({
                  stroke: new Stroke({
                    color: 'blue',
                    width: 4,
                  }),
                })
              );

              streetSource.current.addFeature(streetFeature);
            }
          });

          // Centrar el mapa en el primer tramo encontrado
          if (data[0].geojson && data[0].geojson.coordinates.length > 0) {
            const [lon, lat] = data[0].geojson.coordinates[0];
            if (mapRef.current) {
              mapRef.current.getView().setCenter(fromLonLat([lon, lat]));
              mapRef.current.getView().setZoom(15);
            }
          }
        } else {
          console.warn('No street data found for the given address.');
        }
      } catch (error) {
        console.error('Error fetching street data:', error.message);
      }
    };

    fetchStreetCoordinates();
  }, [pais, departamento, calle]);

  useEffect(() => {
    console.log('Initializing map...');
    if (!mapRef.current) {
      mapRef.current = new Map({
        target: 'map',
        layers: [
          layerRef.current,
          new VectorLayer({
            source: streetSource.current,
          }),
        ],
        view: new View({
          center: fromLonLat([-56.1645, -34.9011]), // Coordenadas iniciales en Montevideo
          zoom: 5,
        }),
      });
    }
  }, []);

  return (
    <div id="map-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div id="map" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapCompleto;
