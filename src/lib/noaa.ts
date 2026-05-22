export interface MagnetometerSample {
  time_tag: string;
  satellite: number;
  He: number;
  Hp: number;
  Hn: number;
  total: number;
  arcjet_flag: boolean;
}

export async function fetchMagnetometers(): Promise<MagnetometerSample[]> {
  const res = await fetch(
    "https://services.swpc.noaa.gov/json/goes/primary/magnetometers-1-day.json",
  );
  if (!res.ok) throw new Error("Failed to fetch NOAA magnetometer data");
  return res.json();
}

export interface SwpcAlert {
  product_id: string;
  issue_datetime: string;
  message: string;
}

export interface ParsedAlert extends SwpcAlert {
  code: string;
  serial: string;
  headline: string;
  severity: "info" | "watch" | "warning" | "alert";
}

function parseAlert(a: SwpcAlert): ParsedAlert {
  const msg = a.message || "";
  const code = (msg.match(/Space Weather Message Code:\s*([A-Z0-9]+)/) || [])[1] ?? a.product_id;
  const serial = (msg.match(/Serial Number:\s*(\d+)/) || [])[1] ?? "";
  const lines = msg.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const headline =
    lines.find((l) =>
      /^(ALERT|WARNING|WATCH|SUMMARY|EXTENDED WARNING|CONTINUED ALERT|CANCEL WARNING):/i.test(l),
    ) ?? lines.find((l) => !/^(Space Weather|Serial|Issue|Continuation|Begin|Yesterday|Continued)/i.test(l)) ?? a.product_id;

  let severity: ParsedAlert["severity"] = "info";
  if (/^ALERT|^CONTINUED ALERT/i.test(headline) || code.startsWith("ALT")) severity = "alert";
  else if (/^WARNING|^EXTENDED WARNING/i.test(headline) || code.startsWith("WAR")) severity = "warning";
  else if (/^WATCH/i.test(headline) || code.startsWith("WAT")) severity = "watch";

  return { ...a, code, serial, headline, severity };
}

export async function fetchAlerts(): Promise<ParsedAlert[]> {
  const res = await fetch("https://services.swpc.noaa.gov/products/alerts.json");
  if (!res.ok) throw new Error("Failed to fetch NOAA alerts");
  const data: SwpcAlert[] = await res.json();
  return data.map(parseAlert);
}

export interface PlasmaSample {
  time_tag: string;
  density: number | null;
  speed: number | null;
  temperature: number | null;
}

export async function fetchPlasma(): Promise<PlasmaSample[]> {
  const res = await fetch(
    "https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json",
  );
  if (!res.ok) throw new Error("Failed to fetch NOAA solar wind data");
  const raw: string[][] = await res.json();
  const [, ...rows] = raw;
  return rows.map((r) => ({
    time_tag: r[0],
    density: r[1] === null || r[1] === "" ? null : Number(r[1]),
    speed: r[2] === null || r[2] === "" ? null : Number(r[2]),
    temperature: r[3] === null || r[3] === "" ? null : Number(r[3]),
  }));
}
