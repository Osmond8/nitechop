import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket";
export async function POST(req: Request) {
  const { orderId, riderId } = await req.json();
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: "PREPARING", riderId: null },
    data: { status: "ASSIGNED", riderId } });
  if (claimed.count === 0) return NextResponse.json({ error: "Job taken" }, { status: 409 });
  getIO().to("customers").emit("rider_location", { orderId });
  return NextResponse.json({ ok: true });
}
