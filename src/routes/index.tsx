import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Globe2, Magnet, RefreshCw, Waves, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { fetchQuakes, type Quake, type USGSResponse } from "@/lib/usgs";
import { fetchMagnetometers, type MagnetometerSample } from "@/lib/noaa";
import { QuakeList } from "@/components/QuakeList";
import { QuakeDetail } from "@/components/QuakeDetail";
import { MagnitudeHistogram, DepthDistribution } from "@/components/QuakeCharts";
import { QuakeMap } from "@/components/QuakeMap";
import { MagnetometerChart } from "@/components/MagnetometerChart";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seismic — Live Earthquake Dashboard" },
      { name: "description", content: "Real-time global earthquake monitoring powered by USGS data." },
    ],
  }),
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Activity; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5" style={{ color: accent ?? "var(--primary)" }} />
      </div>
      <div className="mt-1 text-xl font-semibold text-foreground tabular-nums">{value}</div>
    </div>
  );
}

function Dashboard() {
  const [limit, setLimit] = useState(40);
  const [pendingLimit, setPendingLimit] = useState(40);
  const [data, setData] = useState<USGSResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mag, setMag] = useState<MagnetometerSample[]>([]);
  const [magLoading, setMagLoading] = useState(true);
  const [magError, setMagError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);
    fetchQuakes(limit)
      .then((d) => {
        if (cancel) return;
        setData(d);
        setSelectedId((prev) => prev ?? d.features[0]?.id ?? null);
      })
      .catch((e) => !cancel && setError(e.message))
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [limit, refreshKey]);

  useEffect(() => {
    let cancel = false;
    setMagLoading(true);
    setMagError(null);
    fetchMagnetometers()
      .then((d) => !cancel && setMag(d))
      .catch((e) => !cancel && setMagError(e.message))
      .finally(() => !cancel && setMagLoading(false));
    return () => {
      cancel = true;
    };
  }, [refreshKey]);

  const magStats = useMemo(() => {
    if (!mag.length) return { latest: null as MagnetometerSample | null, min: 0, max: 0, satellite: 0 };
    const latest = mag[mag.length - 1];
    const totals = mag.map((m) => m.total);
    return {
      latest,
      min: Math.min(...totals),
      max: Math.max(...totals),
      satellite: latest.satellite,
    };
  }, [mag]);

  const quakes: Quake[] = data?.features ?? [];
  const selected = quakes.find((q) => q.id === selectedId) ?? null;

  const stats = useMemo(() => {
    if (!quakes.length) return { max: 0, avg: 0, tsunami: 0, sig: 0 };
    const mags = quakes.map((q) => q.properties.mag ?? 0);
    return {
      max: Math.max(...mags),
      avg: mags.reduce((a, b) => a + b, 0) / mags.length,
      tsunami: quakes.filter((q) => q.properties.tsunami === 1).length,
      sig: quakes.filter((q) => q.properties.sig >= 600).length,
    };
  }, [quakes]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Seismic</h1>
              <p className="text-[11px] text-muted-foreground">Live earthquake feed · USGS</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Limit</span>
              <Slider
                value={[pendingLimit]}
                min={10}
                max={500}
                step={10}
                onValueChange={(v) => setPendingLimit(v[0])}
                className="w-32"
              />
              <Input
                type="number"
                value={pendingLimit}
                onChange={(e) => setPendingLimit(Math.max(1, Math.min(20000, Number(e.target.value) || 0)))}
                className="h-7 w-16 text-xs"
              />
              <Button size="sm" className="h-7 text-xs" onClick={() => setLimit(pendingLimit)} disabled={loading}>
                Apply
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-4 px-5 py-4">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Globe2} label="Events" value={String(quakes.length)} />
          <StatCard icon={Zap} label="Max Magnitude" value={stats.max.toFixed(1)} accent="oklch(0.6 0.22 25)" />
          <StatCard icon={Activity} label="Avg Magnitude" value={stats.avg.toFixed(2)} accent="oklch(0.7 0.17 75)" />
          <StatCard icon={Waves} label="Tsunami Alerts" value={String(stats.tsunami)} accent="oklch(0.6 0.15 220)" />
        </section>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="relative z-0 isolate h-[440px] overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
              {mounted ? (
                <QuakeMap quakes={quakes} selectedId={selectedId} onSelect={setSelectedId} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading map…</div>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-card)]">
                <h3 className="mb-1.5 text-xs font-semibold text-foreground">Magnitude distribution</h3>
                <MagnitudeHistogram quakes={quakes} />
              </div>
              <div className="rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-card)]">
                <h3 className="mb-1.5 text-xs font-semibold text-foreground">Depth distribution (km)</h3>
                <DepthDistribution quakes={quakes} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div>
                  <h3 className="text-xs font-semibold">Recent events</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{data?.metadata.title ?? "Loading…"}</p>
                </div>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">{quakes.length}</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {loading && !quakes.length ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>
                ) : (
                  <QuakeList quakes={quakes} selectedId={selectedId} onSelect={setSelectedId} />
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="border-b border-border px-3 py-2">
                <h3 className="text-xs font-semibold">Event details</h3>
              </div>
              <QuakeDetail quake={selected} />
            </div>
          </div>
        </section>

        <footer className="pt-2 text-center text-[11px] text-muted-foreground">
          Data: U.S. Geological Survey · {data && new Date(data.metadata.generated).toLocaleString()}
        </footer>
      </main>
    </div>
  );
}
