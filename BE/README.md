# University Analytics Dashboard (Backend)

Express + TypeScript backend for the coursework, using Drizzle ORM with MySQL.

## Setup

1) Create a `.env` from the example:

```bash
cp .env.example .env
```

2) Install dependencies:

```bash
npm install
```

3) Ensure the database schema is applied (see `drizzle/`).

4) Run in dev:

```bash
npm run dev
```

or build + start:

```bash
npm run build
npm start
```

## Security Model (summary)

- **User auth**: JWT bearer tokens (access + refresh).\n+- **Authorization**: protected routes validate bearer tokens and block IDOR access via `userId` params.\n+- **API keys (client access)**: `/api/client/*` endpoints require an API key with scoped permissions and log usage.

## Key Endpoints

### Auth
- `POST /api/auth/login`\n+- `POST /api/auth/refresh`\n+- `GET /api/auth/verify`\n+- `POST /api/auth/request-password-reset`\n+- `POST /api/auth/reset-password`\n+- `POST /api/auth/verify-email`\n+- `POST /api/auth/resend-verification`

### Alumni (JWT required)
- `GET /api/alumni`\n+- `GET /api/alumni/:userId`\n+- `POST /api/alumni/:userId/profile`\n+- `POST /api/alumni/:userId/bids` (bids for tomorrow’s slot)\n+- `PUT /api/alumni/:userId/bids/:bidId` (must increase)\n+- `PATCH /api/alumni/:userId/bids/:bidId/cancel`

### API Keys (admin only)
- `GET /api/api-keys` (list)\n+- `POST /api/api-keys` (create)\n+- `DELETE /api/api-keys/:apiKeyId` (revoke)\n+- `GET /api/api-keys/csrf` (issues CSRF token cookie + response token for key-management actions)

### Client API (API key required)
- `GET /api/client/alumni` requires `read:alumni`\n+- `GET /api/client/analytics` requires `read:analytics`\n+- `GET /api/client/alumni-of-day` requires `read:alumni_of_day`

## API Documentation

Swagger UI is available at `GET /api-docs`.

