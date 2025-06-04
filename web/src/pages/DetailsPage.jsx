import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import '../styles/detailsPage.css';
import { getAtrakcje, getZdjecia } from '../fetchAPI';
import { useMap } from 'react-leaflet';

function MapFocus({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    // Centrowanie na współrzędnych
    map.setView([lat, lng], 15, { animate: true });

    // Po krótkim opóźnieniu wymuszamy przeliczenie rozmiaru mapy
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [lat, lng, map]);

  return null;
}


function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Ustawienie domyślnych ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Ikony wg typu
const icons = {
  zabytek: new L.Icon({ iconUrl: '/icons/zabytek.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  park: new L.Icon({ iconUrl: '/icons/park.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  pomnik: new L.Icon({ iconUrl: '/icons/pomnik.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  muzeum: new L.Icon({ iconUrl: '/icons/muzeum.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
};

export default function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState([]);
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttraction() {
      try {
        const attractionsData = await getAtrakcje();
        const imagesData = await getZdjecia();
        console.log(attractionsData);
        setAttractions(attractionsData);

        const found = attractionsData.find(a => a.id == id);
        const foundImage = imagesData.find(img => img.atrakcja == id);
        if (found && foundImage) {
          console.log(found)
          setAttraction({
            id: found.id,
            name: found.nazwa,
            description: found.opis,
            type: found.typ, // jeśli masz typ w bazie – podmień
            lat: parseFloat(found.lokalizacjay),
            lng: parseFloat(found.lokalizacjax),
            image: `/images/${foundImage.zdjecia}.jpg`,
          });
        }
      } catch (err) {
        console.error('Błąd ładowania danych:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAttraction();
  }, [id]);

  if (loading) {
    return <div style={{ padding: 80, textAlign: "center", fontSize: 24 }}>Ładowanie danych...</div>;
  }

  if (!attraction) {
    return (
      <div style={{ padding: 80, textAlign: "center", fontSize: 24 }}>
        Nie znaleziono atrakcji.
        <div style={{ marginTop: 32 }}>
          <Link to="/popular"><Button color="green">Wróć do popularnych</Button></Link>
        </div>
      </div>
    );
  }

  const icon = icons[attraction.type] || icons.zabytek;

  const currentIndex = attractions.findIndex(a => a.id == id);
  const prevAttraction = attractions[currentIndex - 1];
  const nextAttraction = attractions[currentIndex + 1];

  return (
    <div className="details-page-container">
      {/* Strzałki */}
      {prevAttraction && (
        <Button
          className="details-arrow-btn left"
          variant="outline"
          color="green"
          size="lg"
          radius="xl"
          onClick={() => navigate(`/details/${prevAttraction.id}`)}
          title={`Poprzednia: ${prevAttraction.nazwa}`}
        >
          &#8592;
        </Button>
      )}
      {nextAttraction && (
        <Button
          className="details-arrow-btn right"
          variant="outline"
          color="green"
          size="lg"
          radius="xl"
          onClick={() => navigate(`/details/${nextAttraction.id}`)}
          title={`Następna: ${nextAttraction.nazwa}`}
        >
          &#8594;
        </Button>
      )}

      {/* Główna sekcja */}
      <div className="details-main-section">
        <div className="details-top-row">
          <img
            className="details-img"
            src={attraction.image}
            alt={attraction.name}
          />
          <div style={{ flex: 1 }}>
            <h2 className="details-title">{attraction.name}</h2>
            <p className="details-desc">
              {truncate(attraction.description, 120)}
            </p>
          </div>
        </div>


        <hr className="details-divider" />

        <div className="details-bottom-row">
          <div className="details-map">
            <MapContainer
              center={[attraction.lat, attraction.lng]}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <MapFocus lat={attraction.lat} lng={attraction.lng} />
              <Marker position={[attraction.lat, attraction.lng]} icon={icon} />
            </MapContainer>
          </div>
          <div className="details-long-desc">
        <p>{attraction.description}</p>
  </div>
</div>

      </div>

      {/* Dolny pasek */}
      <div className="details-bottom-bar">
        <div className="details-bottom-tabs">
          <Link to="/"><button>Mapa</button></Link>
          <Link to="/popular"><button>Popularne</button></Link>
        </div>
      </div>
    </div>
  );
}
