import { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import '../styles/popularPage.css';
import { getAtrakcje, getZdjecia } from '../fetchAPI';

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export default function PopularPage() {
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAtrakcje();
        const imageData = await getZdjecia();
        console.log(imageData);
        const mapped = data
          .sort((a, b) => b.ocena - a.ocena)
          .slice(0, 6)
          .map(item => ({
            id: item.id,
            name: item.nazwa,
            description: item.opis,
            image: `/images/${imageData.find(img => img.atrakcja == item.id).zdjecia}`
          }));

        setAttractions(mapped);
      } catch (err) {
        console.error('Błąd pobierania danych:', err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="popular-page-container">
      <h2 className="popular-title">Popularne atrakcje</h2>
      <div className="popular-grid">
        {attractions.map(attraction => (
          <div key={attraction.id} className="popular-card">
            <img
              src={attraction.image}
              alt={attraction.name}
              className="popular-card-img"
            />
            <div className="popular-card-content">
              <h3 className="popular-card-title">{attraction.name}</h3>
              <p className="popular-card-desc">{truncate(attraction.description, 100)}</p>
            </div>
            <div className="popular-card-btn-row">
              <Button
                fullWidth
                radius="xl"
                color='#195b35'
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
          <Link to="/map"><button>Mapa</button></Link>
          <button className="selected">Popularne</button>
        </div>
      </div>
    </div>
  );
}
