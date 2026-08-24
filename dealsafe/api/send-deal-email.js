export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { recipient, recipientName, dealTitle, transactionCode, amount } = request.body || {};
  if (!recipient || !dealTitle || !transactionCode) {
    return response.status(400).json({ error: "Recipient, deal title, and transaction code are required." });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(500).json({ error: "Email service is not configured." });
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "DealSafe <onboarding@resend.dev>",
        to: [recipient],
        subject: `DealSafe invitation: ${transactionCode}`,
        html: `<div style="font-family:Arial,sans-serif;color:#102a2a;line-height:1.6"><h2>Your DealSafe invitation is ready</h2><p>Hello ${recipientName || "there"},</p><p>You have been invited to review a protected deal for <strong>${dealTitle}</strong>.</p><p><strong>Transaction:</strong> ${transactionCode}<br /><strong>Amount:</strong> ${amount || "See transaction details"}</p><p>Sign in to DealSafe to review the agreement and accept the invitation.</p><p>DealSafe helps keep payments protected until the transaction is completed.</p></div>`,
      }),
    });

    const result = await resendResponse.json();
    if (!resendResponse.ok) return response.status(resendResponse.status).json({ error: result.message || "Resend rejected the email." });
    return response.status(200).json({ id: result.id });
  } catch (error) {
    console.error("Resend request failed.", error);
    return response.status(502).json({ error: "Email service unavailable." });
  }
}
