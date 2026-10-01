import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settleOrder } from "@/lib/payouts";
import { getIO } from "@/lib/socket";
export async function POST(req: Request) {
  const { orderId, riderId } = await req.json();
  const r = await prisma.order.updateMany({ where: { id: orderId, riderId, status: "PICKED_UP" }, data: { status: "DELIVERED" } });
  if (r.count === 0) return NextResponse.json({ error: "Invalid state" }, { status: 409 });
  await settleOrder(orderId);
  getIO().to("customers").emit("rider_location", { done: true, orderId });
  return NextResponse.json({ ok: true });
}
