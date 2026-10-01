import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const parties = await prisma.ledgerEntry.groupBy({ by: ["party"], _sum: { amountKobo: true } });
  const online = await prisma.rider.count({ where: { isOnline: true } });
  const live = await prisma.order.count({ where: { status: { in: ["PAID","PREPARING","ASSIGNED","PICKED_UP"] } } });
  return NextResponse.json({ parties, online, live });
}
