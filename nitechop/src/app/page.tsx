"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
const fetcher = (u: string) => fetch(u).then(r => r.json());
export default function Home() {
  const { data: w } = useSWR("/api/weather?lat=6.5244&lng=3.3792", fetcher);
  const { data: stores } = useSWR("/api/stores", fetcher);
  const [riders, setRiders] = useState<any[]>([]);
  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    s.emit("join_customers");
    s.on("rider_location", (r: any) =>
      setRiders(p => [...p.filter(x => x.riderId !== r.riderId), r]));
    return () => { s.disconnect(); };
  }, []);
  const hour = new Date().getHours();
  return (
    <main className="grid md:grid-cols-3 gap-4 p-6 max-w-5xl mx-auto">
      <aside className="rounded-2xl bg-brand-dim border border-brand/40 text-brand-glow p-5 h-36">
        {w ? (<><div className="text-4xl font-bold">{w.temp}°C</div>
          <div className="mt-1">{w.label} · Lagos</div>
          <div className="text-xs opacity-70 mt-2">Humidity {w.humidity}%{hour >= 22 || hour < 6 ? " · night surge active" : ""}</div></>)
          : <div>Loading…</div>}
      </aside>
      <section className="md:col-span-2 card p-5">
        <h2 className="font-semibold mb-3">Riders live now ({riders.length})</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          {riders.map(r => <li key={r.riderId}>Rider {r.riderId?.slice(0,6)} — {r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}</li>)}
          {!riders.length && <li className="text-night-700">Waiting for riders to come online…</li>}
        </ul>
      </section>
      <section className="md:col-span-3">
        <h2 className="font-semibold mb-3">Open near you</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stores?.map((s: any) => (
            <div key={s.id} className="card p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">{s.name}</h3>
                {s.isOpen24h && <span className="badge-mint text-[10px]">24hrs</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">{s.kind} · {(s as any)._dist?.toFixed(1) ?? "?"} km</p>
            </div>))}
        </div>
      </section>
    </main>);
}
