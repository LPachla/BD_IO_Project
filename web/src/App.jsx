import Favorite from "./pages/Favorite";
import Home from "./pages/Home";
import Details from "./pages/Details";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider} from '@mantine/core'

export default function App() {
  return (
    <MantineProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element = {<Home/>}/>
          <Route path = "details" element = {<Details/>}/>
          <Route path = "favorite" element = {<Favorite/>}/>
        </Route>
      </Routes>    
    </BrowserRouter>
    </MantineProvider>
  );
  
}