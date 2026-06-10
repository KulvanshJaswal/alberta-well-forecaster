import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WellList from './pages/WellList';
import WellDetail from './pages/WellDetail';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<WellList />} />
        <Route path="/wells/:uwi" element={<WellDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
