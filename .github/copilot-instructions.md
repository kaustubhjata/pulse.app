# Copilot / AI Agent Instructions for HC_06

Purpose
- Help AI coding agents (Copilot, ChatOps agents) be immediately productive when working on HC_06.
- Focus on the repository's architecture, run/debug workflows, important implementation patterns, and where to look for secrets/config.

Top-level overview
- This is a small multi-service mental-wellness prototype with two primary backend pieces and a React frontend:
  - Python Flask backend: `model/app.py` — provides /api/transcribe, /api/respond and integrates local Whisper + Google Gemini (via the `google.generativeai` client) and uses `gTTS` for speech.
  - Node/Express backend: `model/server.js` — older JS backend that also implements /api endpoints for journals, communities, mood saving, and an alternate Whisper/transcription flow (via local Whisper CLI or OpenAI Whisper depending on commented code). Listens on port 3001.
  - React frontend: `frontend/` — Create React App project (dev server on port 3000). `frontend/package.json` contains a "proxy": "http://localhost:3001" so API calls from the frontend go to the Node server during development.
  - `serverrun.py` is a convenience script to start both the Python and Node servers concurrently (it expects to run from project root).

Key files to inspect
- `model/app.py` — primary Python backend; environment vars required: `GEMINI_API_KEY` (and optionally other keys if you enable other providers). Uses local Whisper model and requires ffmpeg installed and accessible on PATH.
- `model/server.js` — Node backend with Gemini integration, Whisper CLI usage, and local file-based storage under `model/db/`.
- `frontend/package.json` and `frontend/README.md` — shows CRA workflow: `npm start`, `npm run build`.
- `serverrun.py` — starts Python and Node servers together; check working directories in the script before running.
- `compose.yaml` and `README.Docker.md` — Docker Compose and containerization hints; compose is minimal/example only.

Run / debug workflows (developer-first)
- Local dev (recommended manual steps):
  1. Create a `.env` in `model/` with `GEMINI_API_KEY=...` (the Python/Node code reads process envs via `dotenv`).
  2. Install Node deps: `cd frontend && npm install`.
  3. Start front-end: `cd frontend && npm start` (opens at http://localhost:3000). The frontend proxies API calls to http://localhost:3001.
  4. Start Node backend: `node model/server.js` (port 3001).
  5. Start Python backend: `python model/app.py` (port 5000). Or use `python serverrun.py` from project root to start both — note: `serverrun.py` uses subprocess Popen and may need path adjustments on Windows.

- Docker: `docker compose up --build` as documented in `README.Docker.md` / `compose.yaml`. The compose file is a template (no ports exposed by default) — update `ports` if you want host access.

Service boundaries / data flows
- Frontend -> Node backend: during dev calls go to Node (`/api/*`) on port 3001 (see `frontend/package.json` proxy). Node handles persistence to `model/db/*.json` and community message files under `model/db/communities/*.json`.
- Transcription: two approaches exist in the repo:
  1. In `model/app.py` (Python) — uses local Whisper model via `whisper` Python package, requires FFmpeg and model download; exposes `/api/transcribe` on Flask port 5000.
  2. In `model/server.js` (Node) — uses Whisper CLI (exec) and parses stdout or the OpenAI `whisper-1` API depending on commented code. Node's `/api/transcribe` runs on port 3001.
- Analysis/AI: Both backends call generative models (Gemini) but use different client libraries: Python uses `google.generativeai` (configured with `GEMINI_API_KEY`) and Node uses `@google/generative-ai`.

Project-specific conventions and patterns
- Simple file-based persistence: `model/db/*.json` and `model/db/communities/<id>.json` are the canonical data store. When adding new stored entities, follow the pattern: read JSON file, mutate in-memory, write back with JSON.stringify(..., null, 2).
- Two parallel backends: expect duplicate endpoints / overlapping responsibility between `model/app.py` (Python) and `model/server.js` (Node). Prefer the Python backend for features that use the loaded Whisper model and Gemini (if both exist), but verify before changing behavior.
- Transcription relies on external binaries and heavy models: the Python path uses the whisper python package (which downloads weights) and requires ffmpeg. The Node path runs the `whisper` CLI — ensure the same tooling and models are available for the environment you run.
- Secrets/config: `.env` under `model/` is expected for GEMINI_API_KEY (and older OpenAI keys in commented code). Never commit keys to repository.

Helpful code examples (copy/paste)
- Start both servers (project root, Windows PowerShell):

  # From project root
  cd model; python app.py; Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js"

  (Or use `python serverrun.py` but confirm paths are correct.)

- Example: read/write JSON (follow the helper style in `model/server.js`):
  const readJsonFile = (filePath) => { /* if not exists create '[]' then JSON.parse */ }
  const writeJsonFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

Where to make safe edits
- Prefer changes inside `model/` for backend behavior. Changing `frontend/` UI is lower risk but follow CRA conventions.
- When adding new API routes, update both backends only if you intend to support both languages; otherwise, pick one and update the frontend proxy/requests accordingly.

Common gotchas / edge cases
- FFmpeg not installed or not in PATH will cause transcription errors — both Python and Node checks rely on ffmpeg or the Whisper CLI. For local testing, install FFmpeg and confirm `ffmpeg -version` returns successfully.
- `serverrun.py` uses subprocess with cwd set incorrectly — if you use it and servers fail to start, run each server manually and check the working directory.
- The repo mixes generative client libraries — ensure environment variable names: `GEMINI_API_KEY` is required. Older commented code references `OPENAI_API_KEY`; only enable if you have that key and update env usage.

Search hints for agents
- To find where endpoints are implemented, search for `app.post("/api/` or `app.get("/api/` under `model/`.
- To find frontend components that call an endpoint, search `fetch("/api/` or axios calls in `frontend/src/components` (e.g., `JournalPage.jsx`, `Chatroom.jsx`).

If unsure, ask the maintainer
- Which backend is the "source of truth" for a given endpoint (Python `app.py` vs Node `server.js`)?
- Do you want the Node backend retired in favor of Python, or kept for historical features?

If you want changes merged
- Keep PRs small and focused. For backend changes, include a short runbook with commands to reproduce and any required env vars.

---
If any section is unclear or you want more examples (routes, specific frontend files), tell me which part to expand and I'll iterate.