# The Insight Game — Vercel deployment

A product-management work-experience game: read a brand call, capture insights,
prioritise, interrogate an AI brand contact and data engineer, survive a grilling
from an SLT member, and close the loop with the customer.

## What's in here

```
index.html    — the whole game (front end)
api/chat.js   — serverless proxy to Anthropic (keeps the API key server-side)
api/tts.js    — serverless proxy to ElevenLabs (optional, adds real voices)
```

The browser never sees your API keys. All calls go through the two functions above.

## Deploy (about 5 minutes)

### Option A — Vercel CLI
1. Install: `npm i -g vercel`
2. From this folder: `vercel`
3. Follow the prompts (new project, defaults are fine)
4. Add the environment variables (below), then `vercel --prod`

### Option B — GitHub
1. Push this folder to a GitHub repo
2. vercel.com → Add New Project → import the repo → Deploy
3. Add the environment variables, then redeploy

## Environment variables (Project → Settings → Environment Variables)

| Name | Required | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Powers Maya, Priya and Craig. Get one at console.anthropic.com |
| `ELEVENLABS_API_KEY` | No | Adds natural voices for the call + spoken chat replies. Without it, the game falls back to browser text-to-speech |
| `GAME_CODE` | No, but recommended | Any string. If set, visitors must enter it before the AI features work — stops strangers spending your credits if the URL leaks |

After adding or changing variables, trigger a redeploy (Vercel → Deployments → Redeploy).

## Cost control

- The chat proxy caps conversation length and size, only serves the game's own
  system prompts... but anyone with the URL (and code) can chat, so:
- Set `GAME_CODE`.
- Use a dedicated Anthropic key with a spend limit; delete it after the event.
- A full playthrough costs pennies (Claude) + a few hundred ElevenLabs characters
  per chat reply. The transcript is ~2,500 characters per full listen.

## Local development

`vercel dev` runs the site and functions locally at http://localhost:3000.

Opening index.html directly as a file also works — the game detects `file://`
and shows a panel where keys can be pasted manually (kept in memory only).
