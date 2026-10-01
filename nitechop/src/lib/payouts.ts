import { prisma } from "./prisma";
import { paystack } from "./paystack";

export async function settleOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId },
    include: { store: { include: { seller: true } }, rider: { include: { user: true } } } });
  const sellerPayout = order.subtotalKobo - order.commissionKobo;
  const riderPayout = order.riderPayoutKobo + order.nightBonusKobo;

  await prisma.$transaction([
    prisma.ledgerEntry.create({ data: { orderId, party: "PLATFORM", amountKobo: order.commissionKobo, note: "commission" } }),
    ...(order.deliveryFeeKobo > order.riderPayoutKobo ? [prisma.ledgerEntry.create({ data: { orderId, party: "PLATFORM", amountKobo: order.deliveryFeeKobo - order.riderPayoutKobo, note: "delivery fee share" } })] : []),
    prisma.ledgerEntry.create({ data: { orderId, party: "SELLER", amountKobo: sellerPayout, note: "order payout" } }),
    prisma.ledgerEntry.create({ data: { orderId, party: "RIDER", amountKobo: riderPayout, note: `delivery${order.nightBonusKobo ? " + Nite Bonus" : ""}` } }),
    prisma.rider.update({ where: { id: order.riderId! }, data: { walletKobo: { increment: riderPayout }, nightTrips: { increment: order.nightBonusKobo ? 1 : 0 } } }),
  ]);

  for (const [user, amount, reason] of [
    [order.store?.seller, sellerPayout, `NiteChop order ${order.id}`],
    [order.rider?.user, riderPayout, `NiteChop delivery ${order.id}`],
  ] as const) {
    if (!user || amount <= 0) continue;
    try {
      let recipient = user.paystackRecipient;
      if (!recipient && user.accountNumber && user.bankCode) {
        const r = await paystack.createRecipient(user.name, user.accountNumber, user.bankCode);
        recipient = r.data.recipient_code;
        await prisma.user.update({ where: { id: user.id }, data: { paystackRecipient: recipient } });
      }
      if (recipient) await paystack.transfer(amount, recipient, reason);
    } catch (e) { console.error(`PAYOUT FAILED ${order.id} ${user.id}`, e); }
  }
}
