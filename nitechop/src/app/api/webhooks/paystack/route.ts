import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validPaystackSignature } from "@/lib/paystack";
import { getIO } from "@/lib/socket";
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validPaystackSignature(raw, req.headers.get("x-paystack-signature")))
    return NextResponse.json({ ok: false }, { status: 401 });
  const event = JSON.parse(raw);
  if (event.event !== "charge.success") return NextResponse.json({ ok: true });
  const upd = await prisma.order.updateMany({
    where: { paystackRef: event.data.reference, status: "PENDING" },
    data: { status: "PREPARING" } });
  if (upd.count === 0) return NextResponse.json({ ok: true });
  const o = await prisma.order.findUniqueOrThrow({ where: { paystackRef: event.data.reference } });
  await prisma.ledgerEntry.create({ data: { orderId: o.id, party: "PLATFORM", amountKobo: o.commissionKobo, note: "commission (locked at payment)" } });
  getIO().to("riders").emit("new_job", { orderId: o.id, kind: o.kind, payoutKobo: o.riderPayoutKobo, nightBonusKobo: o.nightBonusKobo,
    dropoff: { address: o.dropoffAddress, lat: o.dropoffLat, lng: o.dropoffLng } });
  return NextResponse.json({ ok: true });
}
