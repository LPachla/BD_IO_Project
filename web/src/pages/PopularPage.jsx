import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import '../styles/popularPage.css'; 

// 6 przykładowych, różnych atrakcji
const staticAttractions = [
  {
    id: 1,
    name: "Zamek Lubomirskich",
    description: "Zabytkowy zamek z XVII wieku, będący wizytówką Rzeszowa.",
    image: "/images/zamek.jpg"
  },
  {
    id: 2,
    name: "Park Jedności",
    description: "Rozległy park miejski, idealny na spacery i rekreację.",
    image: "/images/park.jpg"
  },
  {
    id: 3,
    name: "Pomnik Tadeusza Kościuszki",
    description: "Pomnik upamiętniający bohatera narodowego Polski.",
    image: "/images/pomnik.jpg"
  },
  {
    id: 4,
    name: "Muzeum Dobranocek",
    description: "Unikalne muzeum z eksponatami z polskich bajek.",
    image: "/images/muzeum.jpg"
  },
  {
    id: 5,
    name: "Bulwary nad Wisłokiem",
    description: "Miejsce aktywnego wypoczynku nad rzeką z widokiem na panoramę miasta.",
    image: "/images/bulwary.jpg"
  },
  {
    id: 6,
    name: "Fontanna Multimedialna",
    description: "Kolorowa fontanna z pokazami świetlno-muzycznymi w centrum miasta.",
    image: "/images/fontanna.jpg"
  }
];

export default function PopularPage() {
  return (
    <div className="popular-page-container">
      <div className="popular-grid">
        {staticAttractions.map(attraction => (
          <div key={attraction.id} className="popular-card">
            <img
              src={attraction.image}
              alt={attraction.name}
              className="popular-card-img"
            />
            <div className="popular-card-content">
              <h3 className="popular-card-title">{attraction.name}</h3>
              <p className="popular-card-desc">{attraction.description}</p>
            </div>
            <div className="popular-card-btn-row">
              <Button
                fullWidth
                radius="xl"
                color="green"
                component={Link}
                to={`/details/${attraction.id}`}
              >
                Szczegóły
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bottom-tabs-row">
        <div className="bottom-tabs">
          <Link to="/"><button>Mapa</button></Link>
          <Link to="/popular"><button className="selected">Popularne</button></Link>
        </div>
      </div>
    </div>
  );
}