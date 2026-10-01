import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MONEY } from "@/lib/config";
import { haversineKm } from "@/lib/geo";
export async function POST(req: Request) {
  const { customerId, storeId, kind, items, dropoffAddress, dropoffLat, dropoffLng } = await req.json();
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const subtotal = items.reduce((s: number, i: any) => s + i.priceKobo * i.qty, 0);
  const km = haversineKm(store, { lat: dropoffLat, lng: dropoffLng });
  const hour = new Date().getHours();
  const isNight = hour >= MONEY.NIGHT_START || hour < MONEY.NIGHT_END;
  let fee = subtotal >= MONEY.FREE_DELIVERY_ABOVE_KOBO ? 0
    : Math.round(MONEY.BASE_DELIVERY_KOBO + km * MONEY.PER_KM_KOBO);
  if (isNight) fee = Math.round(fee * (1 + MONEY.NIGHT_SURGE_PCT / 100));
  const order = await prisma.order.create({ data: {
    kind, customerId, storeId, status: "PENDING", items,
    subtotalKobo: subtotal, deliveryFeeKobo: fee,
    commissionKobo: Math.round(subtotal * MONEY.COMMISSION_PCT / 100),
    riderPayoutKobo: Math.round(fee * (1 - MONEY.RIDER_COMM_PCT / 100)),
    nightBonusKobo: isNight ? MONEY.NIGHT_BONUS_KOBO : 0,
    totalKobo: subtotal + fee,
    dropoffAddress, dropoffLat, dropoffLng,
    paystackRef: `NC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` } });
  return NextResponse.json({ orderId: order.id, totalKobo: order.totalKobo, ref: order.paystackRef });
}
