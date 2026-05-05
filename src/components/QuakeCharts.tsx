import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { Quake } from "@/lib/usgs";
import { magColor } from "@/lib/usgs";

export function MagnitudeHistogram({ quakes }: { quakes: Quake[] }) {
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
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 250)" />
        <XAxis dataKey="range" stroke="oklch(0.7 0.03 250)" fontSize={11} />
        <YAxis stroke="oklch(0.7 0.03 250)" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "oklch(0.21 0.025 250)",
            border: "1px solid oklch(0.3 0.03 250)",
            borderRadius: 8,
            color: "oklch(0.96 0.01 240)",
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DepthDistribution({ quakes }: { quakes: Quake[] }) {
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
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.03 250)" />
        <XAxis dataKey="range" stroke="oklch(0.7 0.03 250)" fontSize={11} />
        <YAxis stroke="oklch(0.7 0.03 250)" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "oklch(0.21 0.025 250)",
            border: "1px solid oklch(0.3 0.03 250)",
            borderRadius: 8,
            color: "oklch(0.96 0.01 240)",
          }}
        />
        <Bar dataKey="count" fill="oklch(0.7 0.18 200)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
