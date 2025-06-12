import { useEffect, useState } from 'react';
import { Button,Select } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/popularPage.css';
import { getAtrakcje, getZdjecia, getPowiaty, getUser, logout, getPowiatIDFromName } from '../fetchAPI';

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export default function PopularPage() {
  const [attractions, setAttractions] = useState([]);
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [powiaty, setPowiaty] = useState([]);
  const [selectedPowiat, setSelectedPowiat] = useState('');
  const [user, setUser] = useState(null);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAtrakcje();
        const imageData = await getZdjecia();
        const powiatData = await getPowiaty();

        setPowiaty(powiatData);

        const mapped = data
          .map(item => ({
            id: item.id,
            name: item.nazwa,
            description: item.opis,
            ocena: item.ocena,
            powiat: item.powiat,
            image: `/images/${imageData.find(img => img.atrakcja == item.id)?.zdjecia || 'default'}.jpg`
          }));
        setAttractions(mapped);
        setFilteredAttractions(mapped.sort((a, b) => b.ocena - a.ocena).slice(0, 6));
      } catch (err) {
        console.error('Błąd pobierania danych:', err);
      }
    }

    async function fetchUserData() {
      const userData = await getUser();
      setUser(userData);
    }

    fetchData();
    fetchUserData();
  }, []);
    useEffect (() =>{
    if (!selectedPowiat) {
      setFilteredAttractions(attractions.sort((a, b) => b.ocena - a.ocena).slice(0, 6));
    } else {
      const filtered = attractions
        .filter(attraction => selectedPowiat == attraction.powiat)
        .sort((a, b) => b.ocena - a.ocena)
        .slice(0, 6);
      setFilteredAttractions(filtered);
    }
  }, [selectedPowiat, attractions]);
  return (
    <div className="popular-page-container" style={{ position: 'relative', paddingTop: '70px' }}>
      {/* Header with logout and user profile */}
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

      <h2 className="popular-title">Popularne atrakcje</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="powiat-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>Wybierz powiat:</label>
        <select
          placeholder="Wybierz powiat"
          searchable
          clearable
          id="powiat-select"
          value={selectedPowiat}
          onChange={(e) => setSelectedPowiat(e.target.value)}
          style={{ padding: '6px 10px', fontSize: '16px' }}
        >
          <option value="">Wszystkie powiaty</option>
          {powiaty.map(powiat => (
            <option key={powiat.powiat} value={powiat.id}>{powiat.powiat}</option>
          ))}
        </select>
      </div>

      <div className="popular-grid">
        {filteredAttractions.length > 0 ? (
          filteredAttractions.map(attraction => (
            <div key={attraction.id} className="popular-card">
              <div className="rating-badge">{attraction.ocena.toFixed(1)} ⭐</div>
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
          ))
        ) : (
          <p>Brak atrakcji w wybranym powiecie.</p>
        )}
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