# University Analytics Dashboard (Frontend)

Vite + React frontend for the coursework dashboard.

## Setup

1) Create a `.env` from the example:

```bash
cp .env.example .env
```

2) Install dependencies:

```bash
npm install
```

3) Run the app:

```bash
npm run dev
```

Frontend will run on a Vite port (commonly `5173`). Ensure the backend is running and `VITE_API_BASE_URL` points to it.

## Key Pages

- **Dashboard**: analytics + exports\n+- **Graphs & Charts**: dedicated charts page\n+- **Alumni Explorer**: listing + required filters + saved filter presets\n+- **Bidding**: blind bidding with win/lose feedback

