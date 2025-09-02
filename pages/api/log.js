// pages/api/log.js
export default function handler(req, res) {
  console.log('TEST LOG:', {
    now: new Date().toISOString(),
    method: req.method,
    query: req.query
  });
  res.status(200).json({ ok: true });
}
