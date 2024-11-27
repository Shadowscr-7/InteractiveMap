'use client';

import React, { useState, useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { fetchPOIs } from '../services/services';

const MapCompleto = ({ pais, departamento, ciudad, calle, numero, esquina, children, onParamsUpdate  }) => {
  const mapRef = useRef(null);
  const streetSource = useRef(new VectorSource());
  const poiLayers = useRef({}); // Almacena capas para cada tipo de POI
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastCoordinates, setLastCoordinates] = useState([-56.1645, -34.9011]); // Montevideo por defecto
  const [selectedPOIs, setSelectedPOIs] = useState([]);
  const markerSource = useRef(new VectorSource()); // Fuente para los marcadores de clic

  console.log('Parámetros iniciales:', { pais, departamento, ciudad, calle, numero, esquina });

  // Configuración de íconos de POI
  const POI_TYPES = {
    H: { tooltip: 'Hospital', icon: '/icons/hospital.png' },
    E: { tooltip: 'Educación', icon: '/icons/library.png' },
    P: { tooltip: 'Edificio Público', icon: '/icons/public.png' },
    B: { tooltip: 'Banco', icon: '/icons/bank.png' },
    O: { tooltip: 'Otros', icon: '/icons/circle.png' }, // Genérico
    F: { tooltip: 'Farmacia', icon: '/icons/pharmacy.png' },  
  };

  const handleMapClick = async (event) => {
    if (!mapRef.current) return;
  
    const coordinate = toLonLat(event.coordinate);
    console.log('Clicked coordinates:', coordinate);
  
    const [lon, lat] = coordinate;
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  
    try {
      const response = await fetch(nominatimUrl);
      if (!response.ok) throw new Error('Error fetching reverse geocoding data.');
  
      const data = await response.json();
      console.log('Reverse geocoding result:', data);
  
      const { address } = data;
  
      // Actualiza los parámetros con la nueva dirección
      const updatedParams = {
        pais: address?.country || '',
        departamento: address?.state || '',
        ciudad: address?.city || address?.town || address?.village || '',
        calle: address?.road || '',
        numero: address?.house_number || '',
      };
  
      console.log('Updated parameters:', updatedParams);
  
      // Elimina los puntos del mapa que correspondan a la dirección anterior
      markerSource.current.clear(); // Limpia todos los marcadores previos
  
      // Añade marcador en la ubicación clickeada
      const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
      });
      marker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src:
              'data:image/svg+xml;charset=utf-8,' +
              encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            `),
            scale: 1,
          }),
        })
      );
      markerSource.current.addFeature(marker);
  
      // Centrar el mapa en el lugar del clic
      mapRef.current.getView().setCenter(fromLonLat([lon, lat]));
      mapRef.current.getView().setZoom(15);
  
      if (onParamsUpdate) {
        onParamsUpdate(updatedParams); // Llamar al callback con los nuevos parámetros
      }
      
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  };
  

  // Añade marcadores para un tipo de POI
const addPOIMarkers = (pois, poiType) => {
  console.log(`Adding POI markers for type: ${poiType}`, pois);

  if (!poiLayers.current[poiType]) {
    poiLayers.current[poiType] = new VectorLayer({
      source: new VectorSource(),
    });
    mapRef.current.addLayer(poiLayers.current[poiType]);
  }

  const layer = poiLayers.current[poiType];
  const source = layer.getSource();
  source.clear(); // Limpia los marcadores existentes del tipo seleccionado
  console.log(`Cleared existing markers for type: ${poiType}`);

  pois.forEach((poi) => {
    const { PuntosReferenciaLatitud, PuntosReferenciaLongitud } = poi;
    const coordinates = fromLonLat([
      parseFloat(PuntosReferenciaLongitud),
      parseFloat(PuntosReferenciaLatitud),
    ]);

    console.log(`Adding marker at coordinates:`, coordinates);

    const feature = new Feature({
      geometry: new Point(coordinates),
      data: poi,
    });

    feature.setStyle(
      new Style({
        image: new Icon({
          src: POI_TYPES[poiType]?.icon || '/icons/circle.png',
          scale: 0.05,
          anchor: [0.5, 1],
        }),
      })
    );

    source.addFeature(feature);
  });
  console.log(`Markers added for type: ${poiType}`);
};

const handlePOISelection = async (poiKey) => {
  console.log(`Handling POI selection for key: ${poiKey}`);

  const isSelected = selectedPOIs.includes(poiKey);
  console.log(`Is POI already selected? ${isSelected}`);

  const updatedPOIs = isSelected
    ? selectedPOIs.filter((key) => key !== poiKey)
    : [...selectedPOIs, poiKey];

  console.log(`Updated POI selection:`, updatedPOIs);

  setSelectedPOIs(updatedPOIs);

  // Eliminar capa si se deselecciona
  if (!updatedPOIs.includes(poiKey) && poiLayers.current[poiKey]) {
    console.log(`Removing layer for POI type: ${poiKey}`);
    mapRef.current.removeLayer(poiLayers.current[poiKey]);
    delete poiLayers.current[poiKey];
    return;
  }

  try {
    setIsLoading(true);
    console.log(`Fetching POIs for type: ${poiKey}`);

    // Llamada al servicio
    const pois = await fetchPOIs({
      departamento,
      ciudad,
      POIs: [poiKey],
    });

    console.log(`Response Fetched POIs for type: ${poiKey}`, pois);

    addPOIMarkers(pois, poiKey);
  } catch (error) {
    console.error('Error al obtener POIs:', error);
    setErrorMessage('Error al obtener POIs');
  } finally {
    setIsLoading(false);
    console.log(`Finished handling POI selection for key: ${poiKey}`);
  }
};

const showPOIInfo = (mapEvent) => {
  const tooltipElement = document.getElementById('poi-tooltip');
  if (!tooltipElement) {
    console.error('Tooltip element not found in DOM');
    return;
  }

  const feature = mapEvent.map.getFeaturesAtPixel(mapEvent.pixel)[0];

  if (feature) {
    const data = feature.get('data');
    if (data) {
      const mapContainer = document.getElementById('map'); // Contenedor del mapa
      const rect = mapContainer.getBoundingClientRect(); // Obtener las coordenadas del contenedor del mapa

      tooltipElement.style.visibility = 'visible';
      tooltipElement.style.left = `${mapEvent.originalEvent.clientX - rect.left + 15}px`; // Ajustar posición horizontal
      tooltipElement.style.top = `${mapEvent.originalEvent.clientY - rect.top + 15}px`; // Ajustar posición vertical
      tooltipElement.innerHTML = `
        <strong>${data.PuntosReferenciaNombre}</strong><br>
        ${data.PuntosReferenciaCalle || ''} ${
          data.PuntosReferenciaNumero ? `#${data.PuntosReferenciaNumero}` : ''
        }<br>
        ${data.PuntosReferenciaEsquina ? `Esquina: ${data.PuntosReferenciaEsquina}` : ''}
      `;
    }
  } else {
    tooltipElement.style.visibility = 'hidden';
  }
};



  useEffect(() => {
    if (!mapRef.current) {
      const baseLayer = new TileLayer({
        source: new OSM(),
      });

      mapRef.current = new Map({
        target: 'map',
        layers: [
          baseLayer,
          new VectorLayer({
            source: streetSource.current,
          }),
        ],
        view: new View({
          center: fromLonLat(lastCoordinates),
          zoom: 5,
        }),
      });

      mapRef.current.on('pointermove', showPOIInfo);
      mapRef.current.on('click', handleMapClick); // Escucha clics en el mapa
      setIsMapReady(true);
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  const handleCenterMap = () => {
    if (mapRef.current && lastCoordinates) {
      mapRef.current.getView().setCenter(fromLonLat(lastCoordinates));
      mapRef.current.getView().setZoom(15);
    }
  };

  return (
    <div
      id="map-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '700px', // Alto fijo del mapa
      }}
    >
      <div id="map" style={{ width: '100%', height: '100%' }} />
  
      <div
        id="poi-tooltip"
        style={{
          position: 'absolute',
          backgroundColor: '#fff',
          padding: '5px 10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          color: 'black', // Color negro para el texto
          pointerEvents: 'none',
          zIndex: 1000,
          visibility: 'hidden',
        }}
      ></div>
  
      {/* Botón de centrado */}
      {isMapReady && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 1000,
          }}
        >
          <div
            onClick={handleCenterMap}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
            }}
          >
            <img
              src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23007bff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-crosshair'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='22' y1='12' x2='18' y2='12'%3E%3C/line%3E%3Cline x1='6' y1='12' x2='2' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='6' x2='12' y2='2'%3E%3C/line%3E%3Cline x1='12' y1='22' x2='12' y2='18'%3E%3C/line%3E%3C/svg%3E"
              alt="Center Icon"
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
      )}
  
      {/* Controles de selección de POIs */}
      {isMapReady && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 1000,
          }}
        >
          {Object.entries(POI_TYPES).map(([key, { tooltip, icon }]) => (
            <div
              key={key}
              onClick={() => handlePOISelection(key)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: selectedPOIs.includes(key) ? '#aaa' : '#fff', // Fondo gris neutro
                color: '#000', // Color de texto negro
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                position: 'relative',
              }}
              title={tooltip}
            >
              <img src={icon} alt={tooltip} style={{ width: '25px', height: '25px' }} />
            </div>
          ))}
        </div>
      )}
  
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '6px solid #ddd',
              borderTop: '6px solid #007bff',
              borderRadius: '50%',
              animation: 'spinner 1s linear infinite',
            }}
          ></div>
          <p style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>Cargando ubicación...</p>
        </div>
      )}
  
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
          }}
        >
          <p>{errorMessage}</p>
        </div>
      )}
  
      {isMapReady &&
        children &&
        React.Children.map(children, (child) =>
          React.cloneElement(child, {
            map: mapRef.current,
            streetSource: streetSource.current,
            isMapReady,
            setIsLoading,
            setErrorMessage,
            setLastCoordinates,
            params: { pais, departamento, ciudad, calle, numero, esquina },
          })
        )}
    </div>
  );
  };
  
  export default MapCompleto;
  
