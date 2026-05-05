export async function sendLeadNotification(lead) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) {
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.NOTIFICATION_FROM || "InvestPro <onboarding@resend.dev>",
      to: [process.env.NOTIFICATION_EMAIL],
      subject: "New InvestPro lead",
      text: [
        `Name: ${lead.name}`,
        `Email: ${lead.email}`,
        `Plan: ${lead.planId}`,
        `Message: ${lead.message || "-"}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Email notification failed");
    throw new Error(message);
  }
}
