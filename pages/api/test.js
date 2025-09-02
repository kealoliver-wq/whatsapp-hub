export default async function handler(req, res) {
  const payload = {
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: "447000000000",
            id: "wamid.TEST",
            timestamp: String(Math.floor(Date.now()/1000)),
            text: { body: "test via server" },
            type: "text"
          }]
        }
      }]
    }]
  };

  const url = new URL('/api/wa', `https://${req.headers.host}`);
  const r = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await r.text();
  return res.status(200).json({ forwarded_status: r.status, forwarded_response: text });
}
