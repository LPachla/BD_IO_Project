import '@mantine/core/styles.css';
import { createTheme, MantineProvider} from '@mantine/core';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MapPage from './pages/MapPage';
import PopularPage from './pages/PopularPage';
import DetailsPage from './pages/DetailsPage';

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
          <Route path="/">
            <Route index element = {<MapPage/>}/>
            <Route path = "details/:id" element = {<DetailsPage/>}/>
            <Route path = "popular" element = {<PopularPage/>}/>
          </Route>
        </Routes>    
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;