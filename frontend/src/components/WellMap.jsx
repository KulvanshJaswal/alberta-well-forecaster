import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { statusColorHex } from '../utils/status';

// Fix broken default marker icons from webpack asset processing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function makeIcon(status) {
  const color = statusColorHex(status);
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #0a0a0a;box-shadow:0 0 3px rgba(0,0,0,.5)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export default function WellMap({ wells }) {
  const navigate = useNavigate();
  const mapped = (wells || []).filter((w) => w.latitude != null && w.longitude != null);

  return (
    <MapContainer
      center={[54.5, -115]}
      zoom={5}
      style={{ height: '380px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {mapped.map((w) => (
        <Marker
          key={w.uwi}
          position={[w.latitude, w.longitude]}
          icon={makeIcon(w.status)}
          eventHandlers={{ click: () => navigate(`/wells/${encodeURIComponent(w.uwi)}`) }}
        >
          <Popup>
            <div style={{ color: '#0a0a0a', fontSize: '13px' }}>
              <strong>{w.uwi}</strong><br />
              {w.licensee}<br />
              {w.status}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
