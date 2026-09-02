const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export default async function handler(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let payload;
  try { payload = await request.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }

  const action = payload?.action || "initiate";
  const baseUrl = Netlify.env.get("MOOLRE_ENVIRONMENT") === "live" ? "https://api.moolre.com" : "https://sandbox.moolre.com";
  const username = Netlify.env.get("MOOLRE_API_USER");
  const publicKey = Netlify.env.get("MOOLRE_API_PUBKEY");
  const accountNumber = Netlify.env.get("MOOLRE_ACCOUNT_NUMBER");
  if (!username || !publicKey || !accountNumber) return json({ error: "Moolre payment service is not configured." }, 500);

  const body = action === "status"
    ? { type: 1, idtype: 1, id: payload.externalref, accountnumber: accountNumber }
    : {
        type: 1,
        channel: payload.channel,
        currency: "GHS",
        payer: payload.payer,
        amount: String(payload.amount),
        externalref: payload.externalref,
        ...(payload.otpcode ? { otpcode: String(payload.otpcode).trim() } : {}),
        ...(payload.sessionid ? { sessionid: payload.sessionid } : {}),
        reference: payload.reference || "DealSafe escrow payment",
        accountnumber: accountNumber,
      };
  const endpoint = action === "status" ? "/open/transact/status" : "/open/transact/payment";
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, { method: "POST", headers: { "X-API-USER": username, "X-API-PUBKEY": publicKey, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    return json(result, response.status);
  } catch (error) {
    console.error("Moolre request failed.", error);
    return json({ error: "Moolre payment service is unavailable." }, 502);
  }
}
