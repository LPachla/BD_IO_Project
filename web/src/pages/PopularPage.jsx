import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';

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
    <div style={{
      background: '#f1faee',
      minHeight: '100vh',
      padding: '40px 0'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
        maxWidth: '1200px',
        margin: '0 auto 40px auto'
      }}>
        {staticAttractions.map(attraction => (
          <div key={attraction.id}
               style={{
                 background: '#eaf7ea',
                 borderRadius: '16px',
                 overflow: 'hidden',
                 boxShadow: '0 2px 12px 0 #0001',
                 display: 'flex',
                 flexDirection: 'column',
                 height: '100%'
               }}>
            <img
              src={attraction.image}
              alt={attraction.name}
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover'
              }}
            />
            <div style={{padding: '18px'}}>
              <h3 style={{
                fontSize: '1.2rem',
                margin: '0 0 10px 0',
                fontWeight: 500
              }}>{attraction.name}</h3>
              <p style={{
                fontSize: '1rem',
                margin: 0,
                color: '#333'
              }}>{attraction.description}</p>
            </div>
            <div style={{padding: '0 18px 18px 18px', marginTop: 'auto'}}>
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
      {/* Symetryczny dolny pasek */}
      <div style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          borderRadius: '9999px',
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid #c4e6c6',
          minWidth: 360 // stała szerokość dla dwóch przycisków
        }}>
          <Link to="/" style={{textDecoration: 'none', flex: 1}}>
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
              Mapa
            </button>
          </Link>
          <Link to="/popular" style={{textDecoration: 'none', flex: 1}}>
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
              Popularne
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
