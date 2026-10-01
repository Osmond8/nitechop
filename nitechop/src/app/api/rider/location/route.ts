import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket";
export async function POST(req: Request) {
  const { riderId, lat, lng } = await req.json();
  await prisma.rider.update({ where: { id: riderId }, data: { lat, lng } });
  getIO().to("customers").emit("rider_location", { riderId, lat, lng });
  return NextResponse.json({ ok: true });
}
