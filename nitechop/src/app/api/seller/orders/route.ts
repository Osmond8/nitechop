import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(req: Request) {
  const { orderId, status } = await req.json();
  if (!["PREPARING","READY_FOR_PICKUP"].includes(status))
    return NextResponse.json({ error: "Bad status" }, { status: 400 });
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  return NextResponse.json({ ok: true });
}
