# LearnTwin

LearnTwin is an open-source “learning twin” for students and educators.

It turns scattered course material into a single, AI-assisted workspace where learners can:
- centralise notes, links, PDFs and videos
- ask questions about their own material instead of random internet content
- get structured study paths and progress feedback

This MVP was built during DigiEduHack 2025 and is now published as open source.

## Architecture

- Backend: Python, FastAPI, uvicorn
- Frontend: React + Vite
- Data: local files / sample data for the MVP

Repo layout (simplified):

- backend/      FastAPI app
- frontend/     Vite + React UI
- sample_data/  example inputs
- scripts/      helper scripts
- tests/        backend tests
- requirements.txt

## Quick Run (Windows / PowerShell)

### Backend – PowerShell window 1

    cd "C:\Users\nadio\dev\LearnTwin"
    py -3 -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    \ = "devkey"
    cd backend
    python -m uvicorn app:app --reload --port 8000

Backend will be available at:

- http://localhost:8000
- http://localhost:8000/docs

Leave this window open.

### Frontend – PowerShell window 2

    cd "C:\Users\nadio\dev\LearnTwin\frontend"
    npm install
    npm run dev -- --host localhost --port 5173

Frontend will be available at:

- http://localhost:5173

The frontend talks to the backend at http://localhost:8000.

## Contributing

This started as a hackathon prototype and is evolving into a more robust open-source tool.

- Fork the repo
- Create a feature branch
- Open a PR with a clear description and, if relevant, screenshots of UI changes

## License

LearnTwin is released under the MIT License. See the LICENSE file for details.
