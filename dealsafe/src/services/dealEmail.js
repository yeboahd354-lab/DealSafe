export async function sendDealCreatedEmail({ recipient, recipientName, dealTitle, transactionCode, amount }) {
  if (!recipient) return { skipped: true };

  const response = await fetch("/api/send-deal-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient, recipientName, dealTitle, transactionCode, amount }),
  });

  if (!response.ok) {
    throw new Error("The deal email could not be sent.");
  }

  return response.json();
}
