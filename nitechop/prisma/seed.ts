import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.platformConfig.createMany({ data: [
    { key: "commission_pct", value: 15 }, { key: "rider_commission_pct", value: 15 },
    { key: "base_delivery_kobo", value: 80000 }, { key: "per_km_kobo", value: 25000 },
    { key: "night_start_hour", value: 22 }, { key: "night_end_hour", value: 6 },
    { key: "night_surge_pct", value: 25 }, { key: "night_bonus_kobo", value: 150000 } ] });
  const seller = await prisma.user.create({ data: { phone: "+2348010000001", name: "Mama Put", role: "SELLER" } });
  const store = await prisma.store.create({ data: { sellerId: seller.id, name: "Mama Put 24hrs",
    kind: "FOOD", address: "14 Admiralty Way, Lekki Phase 1", lat: 6.4478, lng: 3.4723, isOpen24h: true } });
  await prisma.item.createMany({ data: [
    { storeId: store.id, name: "Jollof Rice + Chicken", priceKobo: 350000 },
    { storeId: store.id, name: "Peppered Snail", priceKobo: 250000 },
    { storeId: store.id, name: "Chapman", priceKobo: 150000 } ] });
  const ruser = await prisma.user.create({ data: { phone: "+2348010000002", name: "Emeka Rider", role: "RIDER" } });
  await prisma.rider.create({ data: { userId: ruser.id, isOnline: true, lat: 6.4281, lng: 3.4219, isNightVerified: true } });
  console.log("Seeded ✔");
}
main().finally(() => prisma.$disconnect());
