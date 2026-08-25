export async function sendDealCreatedEmail({ recipient, recipientName, dealTitle, transactionCode, amount }) {
  if (!recipient) return { skipped: true };

  const response = await fetch("/api/send-deal-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient, recipientName, dealTitle, transactionCode, amount }),
  });

  if (!response.ok) {
    let errorMessage = "The deal email could not be sent.";
    try {
      const error = await response.json();
      if (error?.error) errorMessage = error.error;
    } catch {
      // Keep the generic message when the server does not return JSON.
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
