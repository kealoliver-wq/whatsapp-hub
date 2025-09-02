// pages/api/wa.js
// One-file WhatsApp webhook + simple inbox + ChatGPT-powered auto-reply

// ===== In-memory inbox (for testing) =====
const inbox = global._waInbox || [];
global._waInbox = inbox;
function addMessage(item) {
  inbox.unshift({ ...item, ts: Date.now() });
  if (inbox.length > 200) inbox.length = 200;
}

// ===== WhatsApp send helper =====
async function sendWhatsApp(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const pnid = process.env.PHONE_NUMBER_ID;
  if (!token || !pnid) return; // sending disabled if envs missing

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pnid}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        text: { body: text },
      }),
    });
    const t = await r.text();
    if (!r.ok) console.log('SEND ERROR:', r.status, t);
  } catch (e) {
    console.log('SEND EXCEPTION:', e?.message);
  }
}

// ===== OpenAI (ChatGPT) helper =====
// Set OPENAI_API_KEY in Vercel → Settings → Environment Variables (Production)
// Optional: OPENAI_MODEL (defaults to gpt-4o-mini)
async function generateReplyWithOpenAI(userText) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) return null;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
