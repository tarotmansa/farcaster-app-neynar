
export default function handler(req, res) {
  // Log the entire request body to inspect the webhook payload
  console.log("Received webhook:", req.body);

  // Respond to Neynar to acknowledge receipt of the webhook
  res.status(200).json({ message: "Webhook received" });
}

