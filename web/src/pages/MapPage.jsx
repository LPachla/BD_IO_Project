import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine'; 
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/mapPage.css';
import { Input, Button, Flex, Select } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAtrakcje,
  getZdjecia,
  getUser,
  isAdmin,
  getPowiaty,
  getPowiatIDFromName,
  insertAtrakcje,
  deleteAtrakcje,
  logout
} from '../fetchAPI';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const icons = {
  zabytek: new L.Icon({ iconUrl: '../icons/zabytek.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  park: new L.Icon({ iconUrl: '../icons/park.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  pomnik: new L.Icon({ iconUrl: '../icons/pomnik.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  muzeum: new L.Icon({ iconUrl: '../icons/muzeum.png', iconSize: [40, 40], iconAnchor: [20, 40] })
};

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
  const [selectedType, setSelectedType] = useState('');
  const [attractions, setAttractions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [powiaty, setPowiaty] = useState([]);
  const [user, setUser] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nazwa: '',
    powiat: '',
    lokalizacjaX: '',
    lokalizacjaY: '',
    typ: '',
    opis: '',
    ocena: '',
    zdjecie: null
  });

  const handleAddAttraction = async () => {
  const { nazwa, ocena, lokalizacjax, lokalizacjay } = form;

  if (!nazwa || nazwa.charAt(0) !== nazwa.charAt(0).toUpperCase()) {
    alert('Nazwa musi zaczynać się wielką literą!');
    return;
  }

  const ocenaFloat = parseFloat(ocena);
  if (isNaN(ocenaFloat) || ocenaFloat < 1 || ocenaFloat > 5) {
    alert('Ocena musi być liczbą od 1 do 5!');
    return;
  }

  const decimalRegex = /^\d+\.\d+$/;
  const x = parseFloat(lokalizacjax);
  const y = parseFloat(lokalizacjay);

  if (!decimalRegex.test(lokalizacjax) || !decimalRegex.test(lokalizacjay)) {
    alert('Lokalizacja X i Y muszą być w formacie dziesiętnym, np. 22.5!');
    return;
  }

  if (y < 21.1420 || y > 23.5478 || x < 49.0022 || x > 50.8203) {
    alert('Lokalizacja musi znajdować się w granicach województwa podkarpackiego!');
    return;
  }

  const attractionData = {
    nazwa: form.nazwa,
    powiat: (await getPowiatIDFromName({ powiat: form.powiat })).id,
    lokalizacjaX: form.lokalizacjay,
    lokalizacjaY: form.lokalizacjax,
    typ: form.typ,
    opis: form.opis,
    ocena: ocenaFloat,
    zdjecie: form.zdjecie
  };

  const res = await insertAtrakcje(attractionData);

  if (res?.error) {
    alert('Błąd: ' + res.error);
  } else {
    alert('Dodano atrakcję!');
    window.location.reload(); 
  }
};

const handleDeleteAttraction = async (id) => {
  if (window.confirm('Czy na pewno chcesz usunąć tę atrakcję?')) {
    const res = await deleteAtrakcje({ id });
    if (res?.error) {
      alert('Błąd: ' + res.error);
    } else {
      alert('Usunięto atrakcję.');
      window.location.reload();
    }
  }
};

  useEffect(() => {
    const fetchPowiaty = async () => {
      const data = await getPowiaty();
      const mapped = data.map(p => ({ value: p.powiat, label: p.powiat}));
      setPowiaty(mapped);
    };
    fetchPowiaty();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      setUser(userData);
      const adminCheck = await isAdmin(userData);
      setIsAdminUser(adminCheck);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const data = await getAtrakcje();
        const imagesData = await getZdjecia();
        const formatted = data.map(item => ({
          id: item.id,
          name: item.nazwa,
          description: item.opis,
          type: item.typ,
          lat: item.lokalizacjay,
          lng: item.lokalizacjax,
          image: `/images/${imagesData.find(img => img.atrakcja == item.id)?.zdjecia}`
        }));
        setAttractions(formatted);
      } catch (err) {
        console.error('Błąd pobierania danych:', err);
      }
    };
    fetchAttractions();
  }, []);

  const filteredAttractions = attractions.filter(a => {
    const phrase = searchTerm.trim().toLowerCase();
    return a.name.toLowerCase().includes(phrase) && (!selectedType || a.type === selectedType);
  });

  function MapClickHandler({ setForm }) {
    useMapEvent('click', (e) => {
      const { lat, lng } = e.latlng;
      setForm((prev) => ({
        ...prev,
        lokalizacjax: lat.toFixed(6),
        lokalizacjay: lng.toFixed(6),
      }));
    });

    return null;
  }

  return (
    <Flex direction="column" align="center" className="page-container">
      <div className="header">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1 className="title">MapCarpatia</h1>
      </div>

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

      <div className="filters">
        <Input
          style={{ width: '450px' }}
          size="md"
          radius="xl"
          placeholder="Wyszukaj miejsce..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          leftSection={<img src="/icons/search.svg" alt="search" className="input-icon" />}
        />
        
        <Select
          placeholder="Typ atrakcji"
          size="md"
          radius="xl"
          data={[
            { value: '', label: 'Wszystkie' },
            { value: 'zabytek', label: 'Zabytek' },
            { value: 'park', label: 'Park' },
            { value: 'pomnik', label: 'Pomnik' },
            { value: 'muzeum', label: 'Muzeum' },
          ]}
          value={selectedType}
          onChange={setSelectedType}
          clearable
        />
      </div>

        <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img
            src="/icons/logout-2.svg"
            alt="Logout"
            className="input-icon"
            style={{ width: 50, height: 50, cursor: 'pointer' }}
            onClick={async () => {
              if (window.confirm('Czy na pewno chcesz się wylogować?')) {  
                navigate('/');
                await logout();
              }
            }}
          />

          <div style={{ position: 'relative' }}>
            <img
              src="/icons/user.svg"
              alt="User icon"
              className="input-icon"
              style={{ width: 50, height: 50, cursor: 'pointer' }}
              onClick={() => setShowUserPopup((prev) => !prev)}
            />
            {showUserPopup && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  padding: '12px 16px',
                  zIndex: 10000,
                  width: '220px',
                  fontFamily: 'Georgia, serif'
                }}
              >
                {user ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <img src="/icons/user_full.svg" alt="User" className="input-icon" />
                      <span>{user.imie} {user.nazwisko}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <img src="/icons/mail.svg" alt="Mail" className="input-icon" />
                      <span>{user.email}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Rola: <strong>{user.role}</strong>
                    </div>
                  </div>
                ) : (
                  <span>Nie zalogowano</span>
                )}
              </div>
            )}
          </div>
        </div>

      <div className="main-content">
        <div className="map-wrapper">
          <MapContainer center={[50.007739, 22.22]} zoom={8} className="map" maxBounds={[[49.0022, 21.1420], [50.8203, 23.5478]]} maxBoundsViscosity={1.0} minZoom={8}>
             <MapClickHandler setForm={setForm} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SetMapToUserLocation setUserPosition={setUserPosition}/>
            {filteredAttractions.map((a, idx) => {
              let icon;
              switch (a.type) {
                case "park": icon = icons.park; break;
                case "pomnik": icon = icons.pomnik; break;
                case "muzeum": icon = icons.muzeum; break;
                case "zabytek":
                default: icon = icons.zabytek; break;
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

        {isAdminUser && (
          <div className="admin-form">
            <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '16px' }}>Dodaj atrakcję</h2>

            <Input placeholder="Nazwa atrakcji" value={form.nazwa} onChange={(e) => setForm({ ...form, nazwa: e.target.value })} style={{ marginBottom: '10px' }} />
            <Select placeholder="Wybierz powiat" data={powiaty} searchable value={form.powiat} onChange={(val) => setForm({ ...form, powiat: val })} nooptionsmessage="Brak wyników" style={{ marginBottom: '10px' }} />
            <Input placeholder="Lokalizacja X" type="number" value={form.lokalizacjax} onChange={(e) => setForm({ ...form, lokalizacjax: e.target.value })} style={{ marginBottom: '10px' }} />
            <Input placeholder="Lokalizacja Y" type="number" value={form.lokalizacjay} onChange={(e) => setForm({ ...form, lokalizacjay: e.target.value })} style={{ marginBottom: '10px' }} />
            <Select placeholder="Typ atrakcji" data={[{ value: 'zabytek', label: 'Zabytek' }, { value: 'park', label: 'Park' }, { value: 'pomnik', label: 'Pomnik' }, { value: 'muzeum', label: 'Muzeum' }]} value={form.typ} onChange={(val) => setForm({ ...form, typ: val })} style={{ marginBottom: '10px' }} />
            <textarea placeholder="Opis" rows={4} value={form.opis} onChange={(e) => setForm({ ...form, opis: e.target.value })} style={{ width: '100%', padding: '8px', fontFamily: 'Georgia, serif', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '8px', marginBottom: '10px', resize: 'vertical' }} />
            <Input placeholder="Ocena (1–5)" type="number" min={1} max={5} step="0.1" value={form.ocena} onChange={(e) => setForm({ ...form, ocena: e.target.value })} style={{ marginBottom: '10px' }} />
            <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, zdjecie: e.target.files[0] })} style={{ marginBottom: '16px' }} />
            <Button fullWidth color="#195b35" radius="xl" onClick={handleAddAttraction}>Dodaj atrakcję</Button>
          </div>
        )}
      </div>

      <div className="bottom-tabs-row">
        <div className="bottom-tabs">
          <button className="selected">Mapa</button>
          <Link to="/popular"><button>Popularne</button></Link>
        </div>
      </div>
    </Flex>
  );
}
