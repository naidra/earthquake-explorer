import { useEffect, useState } from "react";
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

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const update = () => setDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export function QuakeMap({ quakes, selectedId, onSelect }: { quakes: Quake[]; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const dark = useIsDark();
  const tileUrl = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: dark ? "oklch(0.18 0.018 250)" : "oklch(0.96 0.005 250)" }}
    >
      <TileLayer
        key={dark ? "dark" : "light"}
        attribution='&copy; OSM &copy; CARTO'
        url={tileUrl}
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
            radius={Math.max(3, mag * 2.5) + (isSel ? 3 : 0)}
            pathOptions={{
              color: magColor(mag),
              fillColor: magColor(mag),
              fillOpacity: 0.55,
              weight: isSel ? 2.5 : 1,
            }}
            eventHandlers={{ click: () => onSelect?.(q.id) }}
          >
            <Popup>
              <div className="text-xs">
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
