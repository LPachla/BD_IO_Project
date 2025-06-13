import '@mantine/core/styles.css';
import { createTheme, MantineProvider} from '@mantine/core';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import PopularPage from './pages/PopularPage';
import DetailsPage from './pages/DetailsPage';
import RegisterPage from './pages/RegisterPage';


const theme = createTheme({
  green: [
    '#f1faed',
    '#d6e8ce',
    '#c8dfbd',
    '#a9cd99',
    '#8fbe7a',
    '#7eb466',
    '#75b05b',
    '#639a4b',
    '#578940',
    '#487733'
  ],
  headings: {
    fontFamily: 'Georgia, serif',
    fontWeight: 100
  }
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/popular" element={<PopularPage />} />
          <Route path="/details/:id" element={<DetailsPage />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;