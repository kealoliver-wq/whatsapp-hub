// pages/api/webhook.js
// WhatsApp Cloud API Webhook handler for Next.js (Pages Router)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      // ✅ Verification successful — return challenge back to Meta
      return res.status(200).send(challenge);
    }

    // ❌ Verification failed
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    // Log the incoming webhook event from Meta
    console.log('WEBHOOK EVENT:', JSON.stringify(req.body, null, 2));

    // Always respond 200 to acknowledge receipt
    return res.status(200).send('EVENT_RECEIVED');
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
