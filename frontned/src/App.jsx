import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import TextToSpeech from "./components/TextToSpeech.jsx";
import Translate from "./components/Translate.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/text-to-speech" element={<TextToSpeech />} />
        <Route path="/translate" element={<Translate />} />
      </Routes>
    </BrowserRouter>
  );
}
