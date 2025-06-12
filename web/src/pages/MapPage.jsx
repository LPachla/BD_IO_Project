import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine'; 
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/mapPage.css';
import { Input, Button, Flex, Image } from '@mantine/core';
import { Link } from 'react-router-dom';
import { getAtrakcje, getZdjecia } from '../fetchAPI';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const iconZabytek = new L.Icon({
  iconUrl: '../icons/zabytek.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const iconPark = new L.Icon({
  iconUrl: '../icons/park.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const iconPomnik = new L.Icon({
  iconUrl: '../icons/pomnik.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const iconMuzeum = new L.Icon({
  iconUrl: '../icons/muzeum.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function SetMapToUserLocation({ setUserPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolokalizacja nie jest wspierana");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]);

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup("Twoja lokalizacja")
          .openPopup();
      },
      (error) => {
        console.warn("Błąd geolokalizacji:", error.message);
      }
    );
  }, [map,setUserPosition]);

  return null;
}
function NavigationController({ userPosition, destination, onStepChange }) {
  const map = useMap();
  const [routingControl, setRoutingControl] = useState(null);

  useEffect(() => {
    if (!userPosition || !destination) return;

    // Usuwamy poprzednią trasę
    if (map._routingControl) {
      map.removeControl(map._routingControl);
    }

    map._routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false, // <-- ukrywa itinerary
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: '#195b35', opacity: 0.7, weight: 5 }]
      },
      language: 'pl'
    }).addTo(map);

      map._routingControl.on('routesfound', function(e) {
      const route = e.routes[0];
      if (route && route.instructions && route.instructions.length > 0) {
        // Wyciągnij pierwszy krok
        onStepChange(route.instructions[0]);
      }
    });
    setRoutingControl(map._routingControl);

    return () => {
      if (map._routingControl) {
        map.removeControl(map._routingControl);
        map._routingControl = null;
      }
      onStepChange(null);
    };
  }, [map, userPosition, destination]);

  return null;
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
}


export default function MapPage() {
  const [destination, setDestination] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [nextStep, setNextStep] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const data = await getAtrakcje();
        const imagesData = await getZdjecia();
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.nazwa,
          description: item.opis,
          type: item.typ,
          lat: item.lokalizacjay,
          lng: item.lokalizacjax,
          image: `/images/${imagesData.find(img => img.atrakcja == item.id).zdjecia}.jpg`
        }));

        setAttractions(formattedData);
      } catch (err) {
        console.error('Błąd pobierania danych:', err);
        setError('Nie udało się załadować atrakcji');
      }
    };

    fetchAttractions();
  }, []);

  const filteredAttractions = attractions.filter(a => {
    const phrase = searchTerm.trim().toLowerCase();
    return a.name.toLowerCase().includes(phrase);
  });

  return (
    <Flex
      mih={50}
      bg="green.0"
      gap="md"
      justify="center"
      align="center"
      direction="column"
      wrap="nowrap"
      className="page-container"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '20px',
        marginBottom: '10px'
      }}>
        <img src="/logo.png" alt="Logo" style={{ width: '100px', height: '100px' }} />
        <h1 style={{
          fontSize: '42px',
          fontFamily: 'Georgia, serif',
          margin: 0,
          color: '#195b35'
        }}>MapCarpatia</h1>
      </div>

      <Input
        size="md"
        radius="xl"
        placeholder="Wyszukaj miejsce..."
        style={{ width: '700px' }}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
      />
      {nextStep && (
        <div style={{
          backgroundColor: '#195b35',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '1.2rem',
          marginBottom: '-20px',
          fontFamily: 'Georgia, serif',
          maxWidth: '700px',
          textAlign: 'left',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <span >{nextStep.text}</span>
          <span style={{
            fontSize: '1.2rem',
            color: '#fff',
            fontWeight: 'normal'
          }}>
            {formatDistance(nextStep.distance)}
          </span>
        </div>
      )}

      <div className="map-wrapper">

        <MapContainer center={[49.9, 22.0]} zoom={9} className="map">

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />

          <SetMapToUserLocation setUserPosition={setUserPosition}/>
          {filteredAttractions.map((a, idx) => {
            let icon;
            switch (a.type) {
              case "park": icon = iconPark; break;
              case "pomnik": icon = iconPomnik; break;
              case "muzeum": icon = iconMuzeum; break;
              case "zabytek":
              default: icon = iconZabytek; break;
            }
            return (
              
              <Marker
                key={idx}
                position={[a.lat, a.lng]}
                icon={icon}
              >
                <Popup maxWidth={250}>
                  <div style={{ fontFamily: 'Georgia, serif', textAlign: 'center'}}>
                    <h3 style={{ fontSize: '10px', marginBottom: '4px' }}>{a.name}</h3>
                    <img
                      src={a.image}
                      alt={a.name}
                      style={{ width: '100%', borderRadius: '4px', marginBottom: '4px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button 
                        size="xs" 
                        color="#195b35" 
                        radius="xl" 
                        style={{ flex: 1 }} 
                        onClick={() => setDestination([a.lat, a.lng])}
                      >
                        Nawiguj
                      </Button>
                      <Link to={`/details/${a.id}`} style={{ flex: 1 }}>
                        <Button size="xs" color="#195b35" radius="xl" style={{ width: '100%' }}>
                          Zobacz szczegóły
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {userPosition && destination && (
            <NavigationController
              userPosition={userPosition}
              destination={destination}
              onStepChange={setNextStep}
            />
          )}
        </MapContainer>

          {destination && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                mt="md"
                color="#195b35"
                radius="xl"
                size="md"
                onClick={() => setDestination(null)}
              >
                Wyczyść trasę
              </Button>
            </div>
          )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '32px'
      }}>
        <div style={{
          display: 'flex',
          borderRadius: '9999px',
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid #c4e6c6',
          minWidth: 360
        }}>
          <Link to="/" style={{ textDecoration: 'none', flex: 1 }}>
            <button style={{
              width: 180,
              padding: '10px 0',
              border: 'none',
              background: '#eaf7ea',
              color: '#1d6f3e',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              outline: 'none'
            }}>
              Mapa
            </button>
          </Link>
          <Link to="/popular" style={{ textDecoration: 'none', flex: 1 }}>
            <button style={{
              width: 180,
              padding: '10px 0',
              border: 'none',
              background: '#fff',
              color: '#222',
              fontWeight: 500,
              fontSize: '1rem',
              cursor: 'pointer',
              outline: 'none'
            }}>
              Popularne
            </button>
          </Link>
        </div>
      </div>

    </Flex>
  );
}
