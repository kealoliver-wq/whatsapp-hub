// pages/api/webhook.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // 👇 Debug log
    console.log('VERIFY DEBUG:', { mode, token, SERVER_TOKEN: process.env.VERIFY_TOKEN });

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    // 👇 Temporary error detail (so you see why it's failing)
    return res.status(403).json({
      error: 'Forbidden',
      got: { mode, token },
      expected: { mode: 'subscribe', token: process.env.VERIFY_TOKEN }
    });
  }

  if (req.method === 'POST') {
    console.log('WEBHOOK EVENT:', JSON.stringify(req.body, null, 2));
    return res.status(200).send('EVENT_RECEIVED');
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
