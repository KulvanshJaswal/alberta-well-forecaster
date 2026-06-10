import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
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
  const mapRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapped = (wells || []).filter((w) => w.latitude != null && w.longitude != null);

  useEffect(() => {
    const timer = setTimeout(() => mapRef.current?.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  return (
    <div className={`map-container-wrap${isFullscreen ? ' map-fullscreen' : ''}`}>
      <button
        className="map-fullscreen-toggle"
        onClick={() => setIsFullscreen((f) => !f)}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand map'}
        title={isFullscreen ? 'Exit fullscreen' : 'Expand map'}
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        )}
      </button>
      <MapContainer
        ref={mapRef}
        center={[54.5, -115]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MarkerClusterGroup>
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
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
