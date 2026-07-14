export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const { system, messages } = req.body || {};
  if (!system || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'system and messages required' });
  }

  // Basic guardrails so a public URL can't be abused as a free LLM proxy
  if (messages.length > 60) {
    return res.status(400).json({ error: 'conversation too long' });
  }
  const totalChars = messages.reduce((n, m) => n + (typeof m.content === 'string' ? m.content.length : 0), 0);
  if (totalChars > 40000) {
    return res.status(400).json({ error: 'conversation too large' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(501).json({ error: 'anthropic not configured' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system,
        messages
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Anthropic error', r.status, detail);
      return res.status(502).json({ error: 'upstream error' });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
      .trim();

    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  }
}
