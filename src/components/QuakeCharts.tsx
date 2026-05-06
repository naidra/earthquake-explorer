import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { Quake } from "@/lib/usgs";
import { magColor } from "@/lib/usgs";

function useThemeColors() {
  const [colors, setColors] = useState({ grid: "#e5e7eb", axis: "#6b7280", bg: "#ffffff", border: "#e5e7eb", fg: "#111827" });
  useEffect(() => {
    const compute = () => {
      const s = getComputedStyle(document.documentElement);
      setColors({
        grid: s.getPropertyValue("--border").trim() || "#e5e7eb",
        axis: s.getPropertyValue("--muted-foreground").trim() || "#6b7280",
        bg: s.getPropertyValue("--popover").trim() || "#fff",
        border: s.getPropertyValue("--border").trim() || "#e5e7eb",
        fg: s.getPropertyValue("--foreground").trim() || "#111",
      });
    };
    compute();
    const obs = new MutationObserver(compute);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return colors;
}

export function MagnitudeHistogram({ quakes }: { quakes: Quake[] }) {
  const c = useThemeColors();
  const buckets = [
    { range: "<2", min: -Infinity, max: 2 },
    { range: "2-3", min: 2, max: 3 },
    { range: "3-4", min: 3, max: 4 },
    { range: "4-5", min: 4, max: 5 },
    { range: "5-6", min: 5, max: 6 },
    { range: "6+", min: 6, max: Infinity },
  ];
  const data = buckets.map((b) => ({
    range: b.range,
    count: quakes.filter((q) => q.properties.mag != null && q.properties.mag >= b.min && q.properties.mag < b.max).length,
    color: magColor((b.min === -Infinity ? 1 : b.min) + 0.5),
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis dataKey="range" stroke={c.axis} fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke={c.axis} fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: c.grid, opacity: 0.3 }}
          contentStyle={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6, color: c.fg, fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DepthDistribution({ quakes }: { quakes: Quake[] }) {
  const c = useThemeColors();
  const buckets = [
    { range: "0-10", min: 0, max: 10 },
    { range: "10-30", min: 10, max: 30 },
    { range: "30-70", min: 30, max: 70 },
    { range: "70-150", min: 70, max: 150 },
    { range: "150-300", min: 150, max: 300 },
    { range: "300+", min: 300, max: Infinity },
  ];
  const data = buckets.map((b) => ({
    range: b.range,
    count: quakes.filter((q) => {
      const d = q.geometry.coordinates[2];
      return d >= b.min && d < b.max;
    }).length,
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis dataKey="range" stroke={c.axis} fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke={c.axis} fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: c.grid, opacity: 0.3 }}
          contentStyle={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6, color: c.fg, fontSize: 12 }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
