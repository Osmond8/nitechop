import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paystack } from "@/lib/paystack";
export async function POST(req: Request) {
  const { orderId, email } = await req.json();
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const { data } = await paystack.initialize(email, order.totalKobo, order.paystackRef!, { orderId });
  return NextResponse.json({ authorizationUrl: data.authorization_url });
}
