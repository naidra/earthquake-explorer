import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Globe2, RefreshCw, Waves, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { fetchQuakes, type Quake, type USGSResponse } from "@/lib/usgs";
import { QuakeList } from "@/components/QuakeList";
import { QuakeDetail } from "@/components/QuakeDetail";
import { MagnitudeHistogram, DepthDistribution } from "@/components/QuakeCharts";
import { QuakeMap } from "@/components/QuakeMap";

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
    <div className="rounded-xl border border-border bg-[var(--gradient-surface)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4" style={{ color: accent ?? "var(--color-primary)" }} />
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
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
  }, [limit]);

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
      <header className="border-b border-border bg-[var(--gradient-surface)]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <Activity className="h-5 w-5 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Seismic</h1>
              <p className="text-xs text-muted-foreground">Live earthquake feed · USGS</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Limit</span>
              <Slider
                value={[pendingLimit]}
                min={10}
                max={500}
                step={10}
                onValueChange={(v) => setPendingLimit(v[0])}
                className="w-40"
              />
              <Input
                type="number"
                value={pendingLimit}
                onChange={(e) => setPendingLimit(Math.max(1, Math.min(20000, Number(e.target.value) || 0)))}
                className="h-8 w-20"
              />
              <Button size="sm" onClick={() => setLimit(pendingLimit)} disabled={loading}>
                Apply
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLimit((l) => l)} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Globe2} label="Events" value={String(quakes.length)} />
          <StatCard icon={Zap} label="Max Magnitude" value={stats.max.toFixed(1)} accent="oklch(0.65 0.25 25)" />
          <StatCard icon={Activity} label="Avg Magnitude" value={stats.avg.toFixed(2)} accent="oklch(0.78 0.17 75)" />
          <StatCard icon={Waves} label="Tsunami Alerts" value={String(stats.tsunami)} accent="oklch(0.7 0.18 200)" />
        </section>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[480px] overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              {mounted ? (
                <QuakeMap quakes={quakes} selectedId={selectedId} onSelect={setSelectedId} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">Loading map…</div>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Magnitude distribution</h3>
                <MagnitudeHistogram quakes={quakes} />
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Depth distribution (km)</h3>
                <DepthDistribution quakes={quakes} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="border-b border-border bg-secondary/40 px-4 py-3">
                <h3 className="text-sm font-semibold">Recent events</h3>
                <p className="text-xs text-muted-foreground">{data?.metadata.title ?? "Loading…"}</p>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {loading && !quakes.length ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
                ) : (
                  <QuakeList quakes={quakes} selectedId={selectedId} onSelect={setSelectedId} />
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="border-b border-border bg-secondary/40 px-4 py-3">
                <h3 className="text-sm font-semibold">Event details</h3>
              </div>
              <QuakeDetail quake={selected} />
            </div>
          </div>
        </section>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Data: U.S. Geological Survey · {data && new Date(data.metadata.generated).toLocaleString()}
        </footer>
      </main>
    </div>
  );
}
