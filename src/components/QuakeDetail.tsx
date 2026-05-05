import { ExternalLink } from "lucide-react";
import type { Quake } from "@/lib/usgs";
import { magColor, magLabel } from "@/lib/usgs";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-secondary/50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function QuakeDetail({ quake }: { quake: Quake | null }) {
  if (!quake) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Select an event from the list or map to see details.
      </div>
    );
  }
  const p = quake.properties;
  const [lng, lat, depth] = quake.geometry.coordinates;
  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-background"
          style={{ backgroundColor: magColor(p.mag), boxShadow: `0 0 24px ${magColor(p.mag)}66` }}
        >
          {p.mag?.toFixed(1) ?? "—"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{magLabel(p.mag)} · {p.type}</div>
          <h2 className="mt-1 text-lg font-semibold leading-tight text-foreground">{p.place}</h2>
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on USGS <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Time" value={new Date(p.time).toLocaleString()} />
        <Stat label="Depth" value={`${depth.toFixed(2)} km`} />
        <Stat label="Latitude" value={lat.toFixed(4)} />
        <Stat label="Longitude" value={lng.toFixed(4)} />
        <Stat label="Mag Type" value={(p.magType ?? "—").toUpperCase()} />
        <Stat label="Significance" value={p.sig} />
        <Stat label="Felt reports" value={p.felt ?? "—"} />
        <Stat label="CDI / MMI" value={`${p.cdi ?? "—"} / ${p.mmi ?? "—"}`} />
        <Stat label="Alert" value={p.alert ? p.alert.toUpperCase() : "None"} />
        <Stat label="Tsunami" value={p.tsunami ? "Yes" : "No"} />
        <Stat label="Status" value={p.status} />
        <Stat label="Network" value={p.net.toUpperCase()} />
      </div>
    </div>
  );
}
