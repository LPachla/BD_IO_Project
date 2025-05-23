import '@mantine/core/styles.css';
import { createTheme, MantineProvider} from '@mantine/core';

import MapPage from './pages/MapPage';

function App() {
  return (
    <MantineProvider>
    <MapPage />
    </MantineProvider>
  );
}

export default App;