import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/mapPage.css';
import { Input, Button, Flex, Image } from '@mantine/core';
import { Link } from 'react-router-dom';
import { getAtrakcje, getZdjecia } from '../fetchAPI';
import { Select } from '@mantine/core';


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

export default function MapPage() {
  const [selectedType, setSelectedType] = useState('');
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
    const matchesSearch = a.name.toLowerCase().includes(phrase);
    const matchesType = selectedType ? a.type === selectedType : true;
    return matchesSearch && matchesType;
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

      <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
        <Input
          size="md"
          radius="xl"
          placeholder="Wyszukaj miejsce..."
          style={{ width: '500px' }}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
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
          style={{ width: '200px', zIndex: 1000 }}  
          allowDeselect
          clearable
        />

      </div>

          
      <div className="map-wrapper">
        <MapContainer center={[50.0413, 21.999]} zoom={13} className="map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
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
                  <div style={{ fontFamily: 'Georgia, serif', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '10px', marginBottom: '4px' }}>{a.name}</h3>
                    <img
                      src={a.image}
                      alt={a.name}
                      style={{ width: '100%', borderRadius: '4px', marginBottom: '4px' }}
                    />
                    <Link to={`/details/${a.id}`}>
                      <Button size="xs"  color='#195b35' radius="xl">
                        Zobacz szczegóły
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
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
