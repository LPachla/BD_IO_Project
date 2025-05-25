import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import '../styles/detailsPage.css';

// Ustawienie domyślnych ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Własne ikony atrakcji
const iconZabytek = new L.Icon({
  iconUrl: '/icons/zabytek.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
const iconPark = new L.Icon({
  iconUrl: '/icons/park.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
const iconPomnik = new L.Icon({
  iconUrl: '/icons/pomnik.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
const iconMuzeum = new L.Icon({
  iconUrl: '/icons/muzeum.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Dane przykładowych atrakcji
const attractions = [
  {
    id: 1,
    name: "Zamek Lubomirskich",
    description: "Zabytkowy zamek z XVII wieku, będący wizytówką Rzeszowa.",
    details: "Zamek Lubomirskich, przebudowany w stylu neogotyckim, to jedna z najważniejszych atrakcji miasta. Obecnie mieści się tu sąd okręgowy, ale możliwe jest zwiedzanie dziedzińca oraz murów obronnych.",
    type: "zabytek",
    lat: 50.0413,
    lng: 21.999,
    image: "/images/zamek.jpg"
  },
  {
    id: 2,
    name: "Park Jedności",
    description: "Rozległy park miejski, idealny na spacery i rekreację.",
    details: "Park Jedności to miejsce pełne zieleni, z licznymi alejkami spacerowymi, placem zabaw oraz siłownią plenerową. Popularny wśród mieszkańców i turystów.",
    type: "park",
    lat: 50.0450,
    lng: 21.997,
    image: "/images/park.jpg"
  },
  {
    id: 3,
    name: "Pomnik Tadeusza Kościuszki",
    description: "Pomnik upamiętniający bohatera narodowego Polski.",
    details: "Pomnik znajduje się na centralnym placu miasta. Został wzniesiony w 1968 roku i stanowi ważny punkt spotkań oraz miejsce uroczystości patriotycznych.",
    type: "pomnik",
    lat: 50.0420,
    lng: 21.995,
    image: "/images/pomnik.jpg"
  },
  {
    id: 4,
    name: "Muzeum Dobranocek",
    description: "Unikalne muzeum z eksponatami z polskich bajek.",
    details: "Muzeum prezentuje oryginalne lalki, dekoracje i pamiątki z najpopularniejszych wieczorynek. To miejsce nostalgii dla dorosłych i świetna atrakcja dla dzieci.",
    type: "muzeum",
    lat: 50.0435,
    lng: 21.996,
    image: "/images/muzeum.jpg"
  },
  {
    id: 5,
    name: "Bulwary nad Wisłokiem",
    description: "Miejsce aktywnego wypoczynku nad rzeką.",
    details: "Bulwary oferują ścieżki rowerowe, miejsca do grillowania, boiska oraz liczne punkty widokowe na rzekę Wisłok. To idealna trasa na spacer lub jogging.",
    type: "park",
    lat: 50.0470,
    lng: 21.993,
    image: "/images/bulwary.jpg"
  },
  {
    id: 6,
    name: "Fontanna Multimedialna",
    description: "Kolorowa fontanna z pokazami świetlno-muzycznymi.",
    details: "Fontanna Multimedialna to nowoczesna atrakcja w centrum miasta. Pokazy odbywają się w weekendy i przyciągają tłumy zarówno mieszkańców, jak i turystów.",
    type: "pomnik",
    lat: 50.0400,
    lng: 21.994,
    image: "/images/fontanna.jpg"
  }
];

export default function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const attractionId = Number(id);
  const index = attractions.findIndex(a => a.id === attractionId);
  const attraction = attractions[index];

  let icon;
  if (attraction) {
    switch (attraction.type) {
      case "park": icon = iconPark; break;
      case "pomnik": icon = iconPomnik; break;
      case "muzeum": icon = iconMuzeum; break;
      case "zabytek":
      default: icon = iconZabytek; break;
    }
  }

  const prevAttraction = attractions[index - 1];
  const nextAttraction = attractions[index + 1];

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
          title={`Poprzednia: ${prevAttraction.name}`}
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
          title={`Następna: ${nextAttraction.name}`}
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
            <p className="details-desc">{attraction.description}</p>
          </div>
        </div>

        <hr className="details-divider" />

        <div className="details-bottom-row">
          <div className="details-map">
            <MapContainer
              center={[attraction.lat, attraction.lng]}
              zoom={15}
              style={{ width: '100%', height: '100%', borderRadius: '10px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <Marker position={[attraction.lat, attraction.lng]} icon={icon}>
                <Popup>
                  <b>{attraction.name}</b><br />{attraction.description}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="details-long-desc">
            <p>{attraction.details}</p>
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