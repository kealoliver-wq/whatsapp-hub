export default function handler(req, res) {
  if (req.method === "GET") {
    const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  if (req.method === "POST") {
    try {
      const entry = req.body?.entry?.[0];
      const change = entry?.changes?.[0];
      const msg = change?.value?.messages?.[0];
      console.log("WA incoming:", JSON.stringify({ from: msg?.from, text: msg?.text?.body }, null, 2));
    } catch (e) {
      console.error("Webhook error:", e);
    }
    return res.status(200).json({ status: "ok" });
  }

  return res.status(405).end();
}