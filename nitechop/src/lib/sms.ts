export async function sendOTP(phone: string, code: string) {
  await fetch("https://api.ng.termii.com/api/sms/send", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: phone, from: "NiteChop",
      sms: `Your NiteChop code is ${code}. Valid 10 mins.`,
      type: "plain", api_key: process.env.TERMII_API_KEY!, channel: "dnd" }) });
}
