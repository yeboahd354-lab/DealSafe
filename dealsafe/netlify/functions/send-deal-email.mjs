export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const { recipient, recipientName, dealTitle, transactionCode, amount } = await request.json();
  if (!recipient || !dealTitle || !transactionCode) {
    return new Response(JSON.stringify({ error: "Recipient, deal title, and transaction code are required." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (!Netlify.env.get("RESEND_API_KEY")) {
    return new Response(JSON.stringify({ error: "Email service is not configured." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Netlify.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Netlify.env.get("RESEND_FROM_EMAIL") || "DealSafe <onboarding@resend.dev>",
        to: [recipient],
        subject: `DealSafe invitation: ${transactionCode}`,
        html: `<div style="font-family:Arial,sans-serif;color:#102a2a;line-height:1.6"><h2>Your DealSafe invitation is ready</h2><p>Hello ${recipientName || "there"},</p><p>You have been invited to review a protected deal for <strong>${dealTitle}</strong>.</p><p><strong>Transaction:</strong> ${transactionCode}<br /><strong>Amount:</strong> ${amount || "See transaction details"}</p><p>Sign in to DealSafe to review the agreement and accept the invitation.</p><p>DealSafe helps keep payments protected until the transaction is completed.</p></div>`,
      }),
    });

    const result = await resendResponse.json();
    if (!resendResponse.ok) return new Response(JSON.stringify({ error: result.message || "Resend rejected the email." }), { status: resendResponse.status, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ id: result.id }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Resend request failed.", error);
    return new Response(JSON.stringify({ error: "Email service unavailable." }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}
