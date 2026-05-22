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
