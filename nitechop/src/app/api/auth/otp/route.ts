import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOTP } from "@/lib/sms";
export async function POST(req: Request) {
  const { phone, code } = await req.json();
  const p = phone.replace(/^0/, "+234");
  if (!code) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.oTP.upsert({ where: { phone: p },
      update: { code: otp, expiresAt: new Date(Date.now() + 600000) },
      create: { phone: p, code: otp, expiresAt: new Date(Date.now() + 600000) } });
    await sendOTP(p, otp);
    return NextResponse.json({ sent: true });
  }
  const rec = await prisma.oTP.findUnique({ where: { phone: p } });
  if (!rec || rec.code !== code || rec.expiresAt < new Date())
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  const user = await prisma.user.upsert({ where: { phone: p }, update: {},
    create: { phone: p, name: "NiteCrawler" } });
  return NextResponse.json({ userId: user.id });
}
