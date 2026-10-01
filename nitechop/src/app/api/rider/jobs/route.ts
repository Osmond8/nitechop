import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { haversineKm } from "@/lib/geo";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat")), lng = Number(searchParams.get("lng"));
  const jobs = await prisma.order.findMany({ where: { status: "PREPARING" }, include: { store: true }, take: 20 });
  return NextResponse.json(jobs.map(j => ({ ...j, km: j.store ? haversineKm({ lat, lng }, j.store) : 0 }))
    .sort((a, b) => a.km - b.km));
}
