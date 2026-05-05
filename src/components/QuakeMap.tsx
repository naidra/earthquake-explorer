import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Quake } from "@/lib/usgs";
import { magColor } from "@/lib/usgs";

function FitBounds({ quakes }: { quakes: Quake[] }) {
  const map = useMap();
  useEffect(() => {
    if (!quakes.length) return;
    const bounds = quakes.map((q) => [q.geometry.coordinates[1], q.geometry.coordinates[0]] as [number, number]);
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [quakes, map]);
  return null;
}

export function QuakeMap({ quakes, selectedId, onSelect }: { quakes: Quake[]; selectedId?: string | null; onSelect?: (id: string) => void }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom
      className="h-full w-full rounded-lg"
      style={{ background: "oklch(0.18 0.022 250)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds quakes={quakes} />
      {quakes.map((q) => {
        const [lng, lat] = q.geometry.coordinates;
        const mag = q.properties.mag ?? 0;
        const isSel = q.id === selectedId;
        return (
          <CircleMarker
            key={q.id}
            center={[lat, lng]}
            radius={Math.max(4, mag * 3) + (isSel ? 4 : 0)}
            pathOptions={{
              color: magColor(mag),
              fillColor: magColor(mag),
              fillOpacity: 0.55,
              weight: isSel ? 3 : 1,
            }}
            eventHandlers={{ click: () => onSelect?.(q.id) }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{q.properties.title}</div>
                <div>{new Date(q.properties.time).toLocaleString()}</div>
                <div>Depth: {q.geometry.coordinates[2].toFixed(1)} km</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
