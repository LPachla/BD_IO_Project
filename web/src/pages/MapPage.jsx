import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../styles/mapPage.css';
import { Input, Button, Flex, Select } from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  getAtrakcje,
  getZdjecia,
  getUser,
  isAdmin,
  getPowiaty,
  getPowiatIDFromName,
  insertAtrakcje
} from '../fetchAPI';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const icons = {
  zabytek: new L.Icon({ iconUrl: '../icons/zabytek.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  park: new L.Icon({ iconUrl: '../icons/park.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  pomnik: new L.Icon({ iconUrl: '../icons/pomnik.png', iconSize: [40, 40], iconAnchor: [20, 40] }),
  muzeum: new L.Icon({ iconUrl: '../icons/muzeum.png', iconSize: [40, 40], iconAnchor: [20, 40] })
};

export default function MapPage() {
  const [selectedType, setSelectedType] = useState('');
  const [attractions, setAttractions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [powiaty, setPowiaty] = useState([]);
  
  const [form, setForm] = useState({
    nazwa: '',
    powiat: '',
    lokalizacjax: '',
    lokalizacjay: '',
    typ: '',
    opis: '',
    ocena: '',
    // zdjecie: null
  });

  const handleAddAttraction = async () => {
  
    
    const attractionData = {
      nazwa: form.nazwa,
      powiat:await getPowiatIDFromName(form.powiat), 
      lokalizacjax:form.lokalizacjax,
      lokalizacjay:form.lokalizacjay,
      typ: form.typ,
      opis: form.opis,
      ocena: parseFloat(form.ocena)
      // zdjecie: form.zdjecie?.name || ''
    };

    console.log(attractionData);
    const res = await insertAtrakcje(attractionData);

    if (res?.error) {
      alert('Błąd: ' + res.error);
    } else {
      alert('Dodano atrakcję!');
      setForm({ nazwa: '', powiat: '', lokalizacjax: '', lokalizacjay: '', typ: '', opis: '', ocena: '', zdjecie: null });
    }
  };


  useEffect(() => {
    const fetchPowiaty = async () => {
      const data = await getPowiaty();
      const mapped = data.map(p => ({ value: p.powiat, label: p.powiat.charAt(0).toUpperCase() + p.powiat.slice(1) }));
      setPowiaty(mapped);
    };
    fetchPowiaty();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      const adminCheck = await isAdmin(user);
      setIsAdminUser(adminCheck);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const data = await getAtrakcje();
        const imagesData = await getZdjecia();
        const formatted = data.map(item => ({
          id: item.id,
          name: item.nazwa,
          description: item.opis,
          type: item.typ,
          lat: item.lokalizacjay,
          lng: item.lokalizacjax,
          image: `/images/${imagesData.find(img => img.atrakcja == item.id)?.zdjecia}.jpg`
        }));
        setAttractions(formatted);
      } catch (err) {
        console.error('Błąd pobierania danych:', err);
      }
    };
    fetchAttractions();
  }, []);

  const filteredAttractions = attractions.filter(a => {
    const phrase = searchTerm.trim().toLowerCase();
    return a.name.toLowerCase().includes(phrase) && (!selectedType || a.type === selectedType);
  });

  return (
    <Flex direction="column" align="center" className="page-container">
      <div className="header">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1 className="title">MapCarpatia</h1>
      </div>

      <div className="filters">
        <Input
          size="md"
          radius="xl"
          placeholder="Wyszukaj miejsce..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
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
          clearable
        />
      </div>

      <div className="main-content">
        <div className="map-wrapper">
          <MapContainer center={[50.0413, 21.999]} zoom={13} className="map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredAttractions.map((a) => (
              <Marker key={a.id} position={[a.lat, a.lng]} icon={icons[a.type] || icons.zabytek}>
                <Popup>
                  <div className="popup-content">
                    <h3>{a.name}</h3>
                    <img src={a.image} alt={a.name} className="popup-image" />
                    <Link to={`/details/${a.id}`}>
                      <Button size="xs" color="#195b35" radius="xl">Zobacz szczegóły</Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {isAdminUser && (
          <div className="admin-form">
            <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '16px' }}>Dodaj atrakcję</h2>

            <Input placeholder="Nazwa atrakcji" value={form.nazwa} onChange={(e) => setForm({ ...form, nazwa: e.target.value })} style={{ marginBottom: '10px' }} />
            <Select placeholder="Wybierz powiat" data={powiaty} searchable value={form.powiat} onChange={(val) => setForm({ ...form, powiat: val })} nooptionsmessage="Brak wyników" style={{ marginBottom: '10px' }} />
            <Input placeholder="Lokalizacja X" type="number" value={form.lokalizacjax} onChange={(e) => setForm({ ...form, lokalizacjax: e.target.value })} style={{ marginBottom: '10px' }} />
            <Input placeholder="Lokalizacja Y" type="number" value={form.lokalizacjay} onChange={(e) => setForm({ ...form, lokalizacjay: e.target.value })} style={{ marginBottom: '10px' }} />
            <Select placeholder="Typ atrakcji" data={[{ value: 'zabytek', label: 'Zabytek' }, { value: 'park', label: 'Park' }, { value: 'pomnik', label: 'Pomnik' }, { value: 'muzeum', label: 'Muzeum' }]} value={form.typ} onChange={(val) => setForm({ ...form, typ: val })} style={{ marginBottom: '10px' }} />
            <textarea placeholder="Opis" rows={4} value={form.opis} onChange={(e) => setForm({ ...form, opis: e.target.value })} style={{ width: '100%', padding: '8px', fontFamily: 'Georgia, serif', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '8px', marginBottom: '10px', resize: 'vertical' }} />
            <Input placeholder="Ocena (1–5)" type="number" min={1} max={5} step="0.1" value={form.ocena} onChange={(e) => setForm({ ...form, ocena: e.target.value })} style={{ marginBottom: '10px' }} />
            {/* <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, zdjecie: e.target.files[0] })} style={{ marginBottom: '16px' }} /> */}
            <Button fullWidth color="#195b35" radius="xl" onClick={handleAddAttraction}>Dodaj atrakcję</Button>
          </div>
        )}
      </div>

      <div className="bottom-tabs-row">
        <div className="bottom-tabs">
          <button className="selected">Mapa</button>
          <Link to="/popular"><button>Popularne</button></Link>
        </div>
      </div>
    </Flex>
  );
}
