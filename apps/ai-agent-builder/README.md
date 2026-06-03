# AI Agent Builder

Vue 3 app for building and managing AI agents. Runs on port **3002**.

## Development

From the monorepo root:

```bash
npm run dev:agent-builder
```

## Environment variables

Create a `.env` file in this directory (copy from `.env.example`). Vite loads env from `apps/ai-agent-builder/` when the dev server or build runs.

```bash
cp .env.example .env
```

Restart the dev server after changing `.env`.

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Backend API origin used for HTTP requests and Google OAuth redirect URI | `https://api.dev.aiagents.dev` |
| `VITE_SOCKET_BASE_URL` | Yes | WebSocket URL for chat / realtime connections | `wss://dev-multi-agent.aiagents.dev/ws` |
| `VITE_WORKFLOW_SOCKET_BASE_URL` | Yes | WebSocket URL for workflow agent connections | `wss://dev-multi-agent.aiagents.dev` |
| `VITE_GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth client ID (public) | |
| `VITE_ELEVENLABS_API_KEY` | For ElevenLabs TTS | ElevenLabs API key | |
| `VITE_OPENAI_API_KEY` | For OpenAI TTS | OpenAI API key | |

These values are read in `src/services/constants.js` via `import.meta.env`. Do not commit real secrets — `.env` is gitignored.

### Example `.env`

```env
VITE_API_BASE_URL=https://api.dev.aiagents.dev
VITE_SOCKET_BASE_URL=wss://dev-multi-agent.aiagents.dev/ws
VITE_WORKFLOW_SOCKET_BASE_URL=wss://dev-multi-agent.aiagents.dev

VITE_GOOGLE_CLIENT_ID=
VITE_ELEVENLABS_API_KEY=
VITE_OPENAI_API_KEY=
```
