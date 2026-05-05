import { formatDistanceToNow } from "date-fns";
import type { Quake } from "@/lib/usgs";
import { magColor, magLabel } from "@/lib/usgs";
import { cn } from "@/lib/utils";

export function QuakeList({
  quakes,
  selectedId,
  onSelect,
}: {
  quakes: Quake[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-border">
      {quakes.map((q) => {
        const mag = q.properties.mag;
        const isSel = q.id === selectedId;
        return (
          <li key={q.id}>
            <button
              onClick={() => onSelect(q.id)}
              className={cn(
                "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                isSel && "bg-secondary",
              )}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-background"
                style={{ backgroundColor: magColor(mag), boxShadow: `0 0 16px ${magColor(mag)}55` }}
              >
                {mag != null ? mag.toFixed(1) : "—"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {q.properties.place ?? "Unknown location"}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{magLabel(mag)}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(q.properties.time, { addSuffix: true })}</span>
                  {q.properties.tsunami === 1 && (
                    <span className="ml-1 rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                      Tsunami
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{q.geometry.coordinates[2].toFixed(1)} km</div>
                <div className="mt-0.5 uppercase">{q.properties.magType ?? ""}</div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
