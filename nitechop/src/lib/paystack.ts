const SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE = "https://api.paystack.co";
async function call(path: string, body?: object) {
  const res = await fetch(BASE + path, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`Paystack ${path}: ${await res.text()}`);
  return res.json();
}
export const paystack = {
  initialize: (email: string, amountKobo: number, ref: string, metadata: object) =>
    call("/transaction/initialize", { email, amount: amountKobo, reference: ref,
      callback_url: `${process.env.APP_URL}/track/${(metadata as any).orderId}`, metadata }),
  verify: (ref: string) => call(`/transaction/verify/${ref}`),
  createRecipient: (name: string, acct: string, bank: string) =>
    call("/transferrecipient", { type: "nuban", name, account_number: acct, bank_code: bank, currency: "NGN" }),
  transfer: (amountKobo: number, recipient: string, reason: string) =>
    call("/transfer", { source: "balance", amount: amountKobo, recipient, reason }),
};
import crypto from "crypto";
export function validPaystackSignature(raw: string, sig: string | null) {
  return crypto.createHmac("sha512", SECRET).update(raw).digest("hex") === sig;
}
