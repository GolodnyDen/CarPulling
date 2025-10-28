import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPickerProps {
  onLocationSelect: (address: string) => void;
  label: string;
}

export default function MapPicker({ onLocationSelect, label }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([55.75, 37.62], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const markerRef = { current: null as L.Marker | null };

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      markerRef.current = L.marker([lat, lng]).addTo(map);
      onLocationSelect(`lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}`);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="mb-4">
      <label className="block text-gray-400 mb-2">{label}</label>
      <div ref={mapRef} className="h-48 rounded-lg border border-gray-700"></div>
    </div>
  );
}