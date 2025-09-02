export default function Home() {
  return (
    <main style={{padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto'}}>
      <h1>WhatsApp Hub</h1>
      <p>Deployment OK. Webhook route is at <code>/api/wa</code>.</p>
      <ul>
        <li><a href="/api/wa?ping=1">Ping webhook</a></li>
      </ul>
    </main>
  );
}
