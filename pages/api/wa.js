// pages/api/wa.js
// One-file webhook + in-memory viewer

// In-memory store (survives across invocations on a warm lambda)
const inbox = global._waInbox || [];
global._waInbox = inbox;

function addMessage(item) {
  inbox.unshift({ ...item, ts: Date.now() });
  if (inbox.length > 200) inbox.length = 200; // cap for testing
}

export default async function handler(req, res) {
  // Quick health check
  if (req.query.ping === '1') return res.status(200).send('pong-v3');

  // --- Simple JSON list endpoint for the viewer ---
  if (req.method === 'GET' && req.query.list === '1') {
    return res.status(200).json({ messages: inbox });
  }

  // --- Simple HTML viewer: /api/wa?view=1 ---
  if (req.method === 'GET' && req.query.view === '1') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).end(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>WhatsApp Inbox (test)</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:20px;line-height:1.4;}
  h1{margin:0 0 12px}
  .controls{margin:0 0 14px}
  button{padding:8px 12px;cursor:pointer}
  ul{list-style:none;padding:0;margin:0}
  li{border:1px solid #e6e6e6;border-radius:8px;padding:12px;margin:0 0 10px}
  .meta{font-size:12px;color:#666}
  pre{background:#fafafa;padding:8px;overflow:auto}
  .empty{color:#999}
</style>
</head>
<body>
  <h1>WhatsApp Inbox (test)</h1>
  <div class="controls">
    <button id="refresh">Refresh</button>
    <button id="clear">Clear</button>
  </div>
  <div id="content" class="empty">Loading…</div>
  <script>
    async function fetchMessages(){
      const r = await fetch('/api/wa?list=1',{cache:'no-store'});
      const j = await r.json();
      const items = j.messages || [];
      const el = document.getElementById('content');
      if(!items.length){ el.className='empty'; el.textContent='No messages yet.'; return; }
      el.className=''; 
      el.innerHTML = '<ul>' + items.map((m,i)=>(
        '<li><div class="meta">'
        + new Date(m.ts).toLocaleString()
        + ' · ' + (m.type||'unknown')
        + '</div><div><strong>From:</strong> ' + (m.from||'unknown') + '</div>'
        + (m.text ? '<div style="margin-top:6px">'+m.text.replace(/</g,'&lt;')+'</div>'
                  : '<pre style="margin-top:6px">'+JSON.stringify(m,null,2)+'</pre>')
        + '</li>'
      )).join('') + '</ul>';
    }
    async function clearAll(){
      await fetch('/api/wa?clear=1',{method:'POST'});
      fetchMessages();
    }
    document.getElementById('refresh').onclick = fetchMessages;
    document.getElementById('clear').onclick = clearAll;
    setInterval(fetchMessages, 3000);
    fetchMessages();
  </script>
</body>
</html>`);
  }

  // --- Meta "Verify & Save" challenge (initial webhook setup) ---
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const SERVER_TOKEN = process.env.VERIFY_TOKEN || 'mango-ice-48291'; // fallback for quick setup
    if (mode === 'subscribe' && token === SERVER_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // --- Incoming events (messages/status) ---
  if (req.method === 'POST') {
    // Optional: clear inbox via POST /api/wa?clear=1 from the viewer
    if (req.query.clear === '1') {
      inbox.length = 0;
      return res.status(204).end();
    }

    const body = req.body ?? {};
    // console.log is kept for Vercel Runtime logs
    console.log('WEBHOOK EVENT:', JSON.stringify(body, null, 2));

    // Extract messages
    const changes = body?.entry?.[0]?.changes || [];
    for (const ch of changes) {
      const value = ch?.value || {};
      const msgs = value?.messages || [];
      const stats = value?.statuses || [];

      for (const m of msgs) {
        const text =
          m?.text?.body ??
          m?.button?.text ??
          m?.interactive?.button_reply?.title ??
          m?.interactive?.list_reply?.title ??
          null;

        addMessage({
          id: m?.id,
          from: m?.from,
          type: m?.type || 'message',
          text,
          raw: m,
          meta: { timestamp: m?.timestamp }
        });
      }

      // Record statuses as well (delivered/read/etc.)
      for (const s of stats) {
        addMessage({
          id: s?.id,
          from: s?.recipient_id,
          type: 'status',
          text: `status: ${s?.status}`,
          raw: s,
          meta: { timestamp: s?.timestamp }
        });
      }
    }

    return res.status(200).send('EVENT_RECEIVED');
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
}
