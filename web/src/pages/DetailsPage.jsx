import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import '../styles/detailsPage.css';
import { getAtrakcje, getZdjecia, getUser, logout } from '../fetchAPI';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

function MapFocus({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [lat, lng, map]);

  return null;
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

  // Dodane stany i logika użytkownika
  const [user, setUser] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);

  useEffect(() => {
    async function fetchAttraction() {
      try {
        const attractionsData = await getAtrakcje();
        const imagesData = await getZdjecia();
        setAttractions(attractionsData);

        const found = attractionsData.find(a => a.id == id);
        const foundImage = imagesData.find(img => img.atrakcja == id);
        if (found && foundImage) {
          setAttraction({
            id: found.id,
            name: found.nazwa,
            description: found.opis,
            type: found.typ,
            lat: parseFloat(found.lokalizacjay),
            lng: parseFloat(found.lokalizacjax),
            image: `/images/${foundImage.zdjecia}`,
          });
        }
      } catch (err) {
        console.error('Błąd ładowania danych:', err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserData() {
      const userData = await getUser();
      setUser(userData);
    }

    fetchAttraction();
    fetchUserData();
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
    <div className="details-page-container" style={{ position: 'relative', paddingTop: '70px' }}>
      {/* Nagłówek z wyloguj i profil */}
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 20,
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          zIndex: 10000,
        }}
      >
        <img
          src="/icons/logout-2.svg"
          alt="Logout"
          className="input-icon"
          style={{ width: 50, height: 50, cursor: 'pointer' }}
          onClick={async () => {
            if (window.confirm('Czy na pewno chcesz się wylogować?')) {
              await logout();
              navigate('/');
            }
          }}
        />

        <div style={{ position: 'relative' }}>
          <img
            src="/icons/user.svg"
            alt="User icon"
            className="input-icon"
            style={{ width: 50, height: 50, cursor: 'pointer' }}
            onClick={() => setShowUserPopup(prev => !prev)}
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
                width: '220px',
                fontFamily: 'Georgia, serif',
                zIndex: 10001,
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

      {prevAttraction && (
        <Button
          className="details-arrow-btn left"
          variant="outline"
          color="#195b35"
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
          color="#195b35"
          size="lg"
          radius="xl"
          onClick={() => navigate(`/details/${nextAttraction.id}`)}
          title={`Następna: ${nextAttraction.nazwa}`}
        >
          &#8594;
        </Button>
      )}

      <div className="details-main-section">
        <h2 className="details-title-centered">{attraction.name}</h2>

        <div className="details-top-row">
          <Zoom><img className="details-img" src={attraction.image} alt={attraction.name} /></Zoom>
          <div className="details-map">
            <MapContainer
              center={[attraction.lat, attraction.lng]}
              zoom={8}
              style={{ width: '100%', height: '100%' }}
              dragging={false}
              touchZoom={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              boxZoom={false}
              keyboard={false}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <MapFocus lat={attraction.lat} lng={attraction.lng} />
              <Marker position={[attraction.lat, attraction.lng]} icon={icon} />
            </MapContainer>
          </div>
        </div>

        <hr className="details-divider" />

        <div className="details-long-desc-wide">
          <p>{attraction.description}</p>
        </div>
      </div>

      <div className="details-bottom-bar">
        <div className="details-bottom-tabs">
          <Link to="/map"><button>Mapa</button></Link>
          <Link to="/popular"><button>Popularne</button></Link>
        </div>
      </div>
    </div>
  );
}
