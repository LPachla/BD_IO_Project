import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/mapPage.css';

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

  useEffect(() => {
    fetch('/attractions.json')
      .then(res => res.json())
      .then(data => setAttractions(data));
  }, []);

  return (
    <div className="page-container">
      <h1 className="title">TOURRENT</h1>
      <input type="text" placeholder="🔍 Szukaj" className="search-bar" />
      <div className="map-wrapper">
        <MapContainer center={[50.0413, 21.999]} zoom={13} className="map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          {attractions.map((a, idx) => {
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
          <Marker key={idx} position={[a.lat, a.lng]} icon={icon}>
            <Popup>
              <b>{a.name}</b><br />{a.description}
            </Popup>
          </Marker>
          );
          })}
        </MapContainer>
      </div>
      <div className="tab-switch">
        <button className="tab active">Mapa</button>
        <button className="tab">Popularne</button>
      </div>
    </div>
);
}