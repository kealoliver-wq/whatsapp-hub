// pages/api/webhook.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Use environment variable if available, otherwise fall back to hard-coded value
    const SERVER_TOKEN = process.env.VERIFY_TOKEN || 'mango-ice-48291';

    if (mode === 'subscribe' && token === SERVER_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    console.log('WEBHOOK EVENT:', JSON.stringify(req.body, null, 2));
    return res.status(200).send('EVENT_RECEIVED');
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
