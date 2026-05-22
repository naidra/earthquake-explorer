import { formatDistanceToNow } from "date-fns";
import type { ParsedAlert } from "@/lib/noaa";
import { AlertTriangle, Bell, Eye, Info } from "lucide-react";

const sevConfig: Record<ParsedAlert["severity"], { color: string; bg: string; label: string; Icon: typeof Info }> = {
  alert: { color: "oklch(0.6 0.26 25)", bg: "oklch(0.6 0.26 25 / 0.12)", label: "Alert", Icon: AlertTriangle },
  warning: { color: "oklch(0.68 0.22 50)", bg: "oklch(0.68 0.22 50 / 0.12)", label: "Warning", Icon: Bell },
  watch: { color: "oklch(0.75 0.17 95)", bg: "oklch(0.75 0.17 95 / 0.14)", label: "Watch", Icon: Eye },
  info: { color: "oklch(0.65 0.12 220)", bg: "oklch(0.65 0.12 220 / 0.12)", label: "Info", Icon: Info },
};

export function AlertsList({ alerts }: { alerts: ParsedAlert[] }) {
  if (!alerts.length) {
    return <div className="p-4 text-center text-xs text-muted-foreground">No active alerts.</div>;
  }
  return (
    <ul className="divide-y divide-border">
      {alerts.map((a, idx) => {
        const cfg = sevConfig[a.severity];
        const Icon = cfg.Icon;
        const issued = new Date(a.issue_datetime.replace(" ", "T") + "Z");
        return (
          <li key={`${a.product_id}-${a.serial}-${idx}`} className="px-3 py-2.5 hover:bg-accent/50">
            <div className="flex items-start gap-2.5">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-[10px] font-medium tabular-nums text-muted-foreground">{a.code}</span>
                  {a.serial && (
                    <span className="text-[10px] tabular-nums text-muted-foreground">#{a.serial}</span>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-foreground line-clamp-2">{a.headline}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                  {isNaN(issued.getTime()) ? a.issue_datetime : `${formatDistanceToNow(issued)} ago · ${issued.toUTCString().slice(5, 22)} UTC`}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
