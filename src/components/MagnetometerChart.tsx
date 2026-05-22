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
import type { MagnetometerSample } from "@/lib/noaa";

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

export function MagnetometerChart({ samples }: { samples: MagnetometerSample[] }) {
  const c = useThemeColors();
  // Downsample to ~120 points for performance
  const step = Math.max(1, Math.floor(samples.length / 120));
  const data = samples
    .filter((_, i) => i % step === 0)
    .map((s) => ({
      t: new Date(s.time_tag).getTime(),
      He: s.He,
      Hp: s.Hp,
      Hn: s.Hn,
      total: s.total,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="t"
          stroke={c.axis}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
          minTickGap={40}
        />
        <YAxis stroke={c.axis} fontSize={10} tickLine={false} axisLine={false} unit=" nT" width={60} />
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
          formatter={(value: number, name: string) => [`${value.toFixed(2)} nT`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="line" />
        <Line type="monotone" dataKey="Hp" stroke="oklch(0.65 0.2 280)" dot={false} strokeWidth={1.5} name="Hp (parallel)" />
        <Line type="monotone" dataKey="He" stroke="oklch(0.7 0.18 145)" dot={false} strokeWidth={1.5} name="He (earthward)" />
        <Line type="monotone" dataKey="Hn" stroke="oklch(0.7 0.2 35)" dot={false} strokeWidth={1.5} name="Hn (normal)" />
        <Line type="monotone" dataKey="total" stroke="oklch(0.6 0.05 250)" dot={false} strokeWidth={1.5} strokeDasharray="4 3" name="Total |H|" />
      </LineChart>
    </ResponsiveContainer>
  );
}
