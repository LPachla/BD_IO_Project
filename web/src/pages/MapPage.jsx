import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/mapPage.css';
import {Title, Input, Button, Flex, Drawer, ScrollArea, Image, Text} from '@mantine/core';
import {Link} from 'react-router-dom';
import {getAtrakcje, getZdjecia} from '../fetchAPI'

// Ustawienie domyślnych ikon Leaflet
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
  const [attractions, setAttractions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
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

    if (!phrase) return true;

    const inName = a.name.toLowerCase().includes(phrase);
    const inDesc = a.description.toLowerCase().includes(phrase);

    return inName || inDesc;
  });

  const handleMarkerClick = (attraction) => {
    setSelectedAttraction(attraction);
    setDrawerOpened(true);
  };

  const closeDrawer = () => {
    setDrawerOpened(false);
    setSelectedAttraction(null);
  };

  const DRAWER_WIDTH = 500;

  return (
    <Flex
      mih={50}
      bg="green.0"
      gap="md"
      justify="center"
      align="center"
      direction="column"
      wrap="nowrap"
      className = "page-container">

      <Title order={1} size={48}> TOURRENT </Title>
      <Input size="md" radius="xl" placeholder="Wyszukaj" className = "search-bar" 
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}/>

      <div className="map-wrapper" style={{
          transition: 'margin-left 0.3s ease',
          marginLeft: drawerOpened ? `${DRAWER_WIDTH}px` : '0px',
        }}>
        <MapContainer center={[50.0413, 21.999]} zoom={13} className="map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          { filteredAttractions.map((a, idx) => {
            let icon;
            switch (a.type) {
              case "park":
                icon = iconPark;
                break;
              case "pomnik":
                icon = iconPomnik;
                break;
              case "muzeum":
                icon = iconMuzeum;
                break;
              case "zabytek":
              default:
                icon = iconZabytek;
                break;
          }

          return (
            <Marker key={idx} position={[a.lat, a.lng]} icon={icon} eventHandlers={{
                  click: () => handleMarkerClick(a),
                }}>
            </Marker>);
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
          minWidth: 360 // stała szerokość dla dwóch przycisków
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

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        padding="md"
        offset={8} 
        radius="md"
        size={`${DRAWER_WIDTH}px`}
        withOverlay={false}
        styles={{
          drawer: {
            backgroundColor: '#D6E8CE',
          },
          header: {
            backgroundColor: '#D6E8CE',
            borderBottom: '2px solid #2B4B38'
          },
          closeButton: {
            color: '#195b35'
          },
          title: { color: '#195b35', fontFamily: 'Georgia, serif', fontSize: '24px'},
          body: {
            backgroundColor: '#D6E8CE',
            fontFamily: 'Georgia, serif',
            padding: 12,     /* usuwamy wewnętrzny biały padding */
          },
        }}
        title={selectedAttraction?.name}
      >
        {selectedAttraction && (
          <ScrollArea style={{ height: '100%' }} type="never">
            {selectedAttraction.image && (
              <Image
                src={selectedAttraction.image}
                alt={selectedAttraction.name}
                radius="md"
                withPlaceholder
                style={{ marginBottom: 32, marginTop: 16 }}
              />
            )}
            <Text size="md">{selectedAttraction.description}</Text>
          </ScrollArea>
        )}
      </Drawer>

    </Flex>
);
}