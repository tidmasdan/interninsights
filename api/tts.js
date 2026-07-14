export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  // Voices are optional: no ElevenLabs key -> tell the client to fall back
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(501).json({ error: 'tts not configured' });
  }

  const { text, voiceId } = req.body || {};
  if (!text || !voiceId) {
    return res.status(400).json({ error: 'text and voiceId required' });
  }
  if (text.length > 1200) {
    return res.status(400).json({ error: 'text too long' });
  }
  // Only allow the four voices the game actually uses
  const ALLOWED = new Set([
    'Xb7hH8MSUJpSbSDYk0k2', // Rachel (Alice)
    'pFZP5JQG7iQjIQuC4Bku', // Maya (Lily)
    'XB0fDUnXU5powFXDhCwa', // Priya (Charlotte)
    'JBFqnCBsd6RMkjVDRZzb'  // Craig (George)
  ]);
  if (!ALLOWED.has(voiceId)) {
    return res.status(400).json({ error: 'unknown voice' });
  }

  try {
    const r = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '?output_format=mp3_44100_64',
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.4, similarity_boost: 0.75 }
        })
      }
    );

    if (!r.ok) {
      const detail = await r.text();
      console.error('ElevenLabs error', r.status, detail);
      return res.status(502).json({ error: 'tts upstream error' });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  }
}
