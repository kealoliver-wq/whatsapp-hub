// pages/api/wa.js
export default async function handler(req, res) {
  if (req.query.ping === '1') return res.status(200).send('pong-v3');

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const SERVER_TOKEN = process.env.VERIFY_TOKEN || 'mango-ice-48291';

    if (mode === 'subscribe' && token === SERVER_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {};
      console.log('WEBHOOK EVENT:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.log('WEBHOOK EVENT parse error:', e?.message);
    }
    return res.status(200).send('EVENT_RECEIVED');
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
