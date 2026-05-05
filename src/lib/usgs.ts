export interface Quake {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    updated: number;
    url: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    type: string;
    title: string;
    magType: string | null;
  };
  geometry: { type: string; coordinates: [number, number, number] };
}

export interface USGSResponse {
  type: string;
  metadata: { generated: number; title: string; count: number; status: number };
  features: Quake[];
  bbox: number[];
}

export async function fetchQuakes(limit: number): Promise<USGSResponse> {
  const res = await fetch(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&limit=${limit}`,
  );
  if (!res.ok) throw new Error("Failed to fetch USGS data");
  return res.json();
}

export function magColor(mag: number | null): string {
  if (mag == null) return "oklch(0.55 0.02 250)";
  if (mag >= 6) return "oklch(0.6 0.26 25)";
  if (mag >= 5) return "oklch(0.68 0.22 35)";
  if (mag >= 4) return "oklch(0.78 0.17 75)";
  if (mag >= 3) return "oklch(0.78 0.16 100)";
  if (mag >= 2) return "oklch(0.75 0.16 145)";
  return "oklch(0.7 0.12 200)";
}

export function magLabel(mag: number | null): string {
  if (mag == null) return "—";
  if (mag >= 6) return "Major";
  if (mag >= 5) return "Strong";
  if (mag >= 4) return "Moderate";
  if (mag >= 3) return "Light";
  if (mag >= 2) return "Minor";
  return "Micro";
}
