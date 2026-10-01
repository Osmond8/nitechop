import { NextResponse } from "next/server";
const WMO: Record<number, string> = { 0:"Clear", 1:"Mostly clear", 2:"Partly cloudy", 3:"Overcast",
  45:"Fog", 51:"Drizzle", 61:"Rain", 71:"Snow", 80:"Showers", 95:"Thunderstorm" };
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") ?? "6.5244", lng = searchParams.get("lng") ?? "3.3792";
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,relative_humidity_2m&timezone=Africa/Lagos`, { next: { revalidate: 600 } });
  const d = await res.json();
  return NextResponse.json({ temp: Math.round(d.current.temperature_2m),
    label: WMO[d.current.weather_code] ?? "—", humidity: d.current.relative_humidity_2m });
}
