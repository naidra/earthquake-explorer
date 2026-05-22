import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlasmaSample } from "@/lib/noaa";

function useThemeColors() {
  const [colors, setColors] = useState({
    grid: "#e5e7eb",
    axis: "#6b7280",
    bg: "#ffffff",
    border: "#e5e7eb",
    fg: "#111827",
  });
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

export function SolarWindChart({ samples }: { samples: PlasmaSample[] }) {
  const c = useThemeColors();
  const step = Math.max(1, Math.floor(samples.length / 200));
  const data = samples
    .filter((_, i) => i % step === 0)
    .map((s) => ({
      t: new Date(s.time_tag).getTime(),
      speed: s.speed,
      density: s.density,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 40, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="t"
          stroke={c.axis}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString([], { month: "short", day: "numeric" })
          }
          minTickGap={50}
        />
        <YAxis yAxisId="speed" stroke={c.axis} fontSize={10} tickLine={false} axisLine={false} unit=" km/s" width={70} />
        <YAxis yAxisId="density" orientation="right" stroke={c.axis} fontSize={10} tickLine={false} axisLine={false} unit=" p/cc" width={60} />
        <Tooltip
          cursor={{ stroke: c.grid }}
          contentStyle={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            color: c.fg,
            fontSize: 12,
          }}
          labelFormatter={(v) => new Date(v as number).toLocaleString()}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="line" />
        <Line yAxisId="speed" type="monotone" dataKey="speed" stroke="oklch(0.65 0.22 35)" dot={false} strokeWidth={1.5} name="Speed (km/s)" connectNulls />
        <Line yAxisId="density" type="monotone" dataKey="density" stroke="oklch(0.7 0.18 200)" dot={false} strokeWidth={1.5} name="Density (p/cc)" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
