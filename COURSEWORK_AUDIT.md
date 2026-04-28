## Coursework Audit (Alumni Influencers – Part 2)

This audit is mapped to the provided specification. Each item is classified as:

- **CORRECT**: Implemented and meets the requirement
- **INCORRECT**: Implemented but does not meet the requirement (needs adjustment)
- **MISSING**: Not implemented

Evidence references use file paths in this repository.

---

## 1) Authentication & session security

### 1.1 Email registration (university domain restriction)
- **CORRECT (config-driven)**: Registration enforces allowed university domains when `UNIVERSITY_EMAIL_DOMAINS` is set.
  - Evidence: `BE/src/dtos/user.dto.ts` (domain refinement using `UNIVERSITY_EMAIL_DOMAINS`)
  - Evidence: `BE/.env.example` documents `UNIVERSITY_EMAIL_DOMAINS`

### 1.2 Email verification
- **CORRECT**: OTP verification exists end-to-end (send/verify/resend).
  - Evidence: `BE/src/services/AuthService.ts` (send/verify/resend OTP)
  - Evidence: `BE/src/routes/authRoutes.ts` (verify/resend endpoints)
  - Evidence: `BE/src/db/schema.ts` (`email_verification_tokens`)

### 1.3 Secure login/logout + route protection (avoid IDOR)
- **CORRECT (with one policy gap)**: JWT bearer authentication middleware exists and is mounted on protected routes.
  - Evidence: `BE/src/middleware/auth.ts` (`requireAuth`, `requireRole`, `requireSelfOrRole`)
  - Evidence: `BE/src/routes/alumniRoutes.ts` (`router.use(requireAuth)` + `requireSelfOrRole`)
  - Evidence: `BE/src/routes/userRoutes.ts` (admin-only management endpoints)
  - **Policy gap**: Login currently does **not** block unverified accounts from signing in (only verification state is returned).
    - Evidence: `BE/src/services/AuthService.ts#login` does not check `is_email_verified`

### 1.4 Password reset
- **CORRECT**: Reset tokens are hashed, expire, and cannot be reused (`used_at` checked + set).
  - Evidence: `BE/src/services/AuthService.ts` (filters `used_at` null; sets `used_at` on success)
  - Evidence: `BE/src/db/schema.ts` (`password_reset_tokens`)

---

## 2) Core pages

### 2.1 Dashboard
- **CORRECT**:
  - Evidence: `FE/src/pages/index.tsx`

### 2.2 Graphs/Charts (separate page)
- **CORRECT**:
  - Evidence: `FE/src/pages/charts.tsx`
  - Evidence: `FE/src/main.tsx` (route `path: "charts"`)

### 2.3 Alumni explorer with filters + saved presets
- **CORRECT**: Programme, graduation date range, industry sector, and saved filter presets exist.
  - Evidence: `FE/src/pages/employees.tsx`

---

## 3) Data visualization (6–8+ charts, interactive, responsive, required coverage)

### 3.1 Charts count + types
- **CORRECT**: Dashboard includes more than 6–8 charts, including radar and doughnut-style pie.
  - Evidence: `FE/src/pages/index.tsx` (Pie with `innerRadius`, RadarChart, BarChart, LineChart)

### 3.2 API-driven data (no hardcoding in assessed path)
- **CORRECT (dev-only bypass exists)**: Normal mode uses API; mock data is gated behind `import.meta.env.DEV`.
  - Evidence: `FE/src/services/api/alumni.ts` + `FE/src/utils/devMode.ts`

### 3.3 Required coverage (skills gaps, job titles, employers, industry, geography)
- **CORRECT**:
  - Evidence: `FE/src/utils/analytics.ts` (skills gap, job titles, employers, industry sector, geography)
  - Evidence: `FE/src/pages/index.tsx` (renders the above)

---

## 4) Blind bidding system

### 4.1 Hidden bids (no highest-bid visibility)
- **CORRECT**: The API does not expose global “highest bid” to regular users; user routes are scoped by `requireSelfOrRole`.
  - Evidence: `BE/src/routes/alumniRoutes.ts`

### 4.2 Only allow increasing bids
- **CORRECT**:
  - Evidence: `BE/src/services/AlumniService.ts#updateBid` (enforces strictly increasing)

### 4.3 Monthly win limit (max 3)
- **CORRECT**:
  - Evidence: `BE/src/services/AlumniService.ts` (`MONTHLY_APPEARANCE_LIMIT = 3`)

### 4.4 Win/lose outcomes + persistence
- **CORRECT**:
  - Evidence: `BE/src/services/AlumniService.ts#selectWinnerForDay` (sets `won`/`lost`, updates `feature_days`)
  - Evidence: `BE/src/db/schema.ts` (`feature_days`, `bids`)

### 4.5 Automatic winner selection at midnight
- **CORRECT**:
  - Evidence: `BE/src/jobs/featureDayScheduler.ts` + `BE/src/index.ts` (scheduler started at boot)

---

## 5) API security & key scoping

### 5.1 Bearer token auth for human users
- **CORRECT**:
  - Evidence: `BE/src/middleware/auth.ts`

### 5.2 API keys with permission scoping + usage logs
- **CORRECT**:
  - Evidence: `BE/src/middleware/apiKeyAuth.ts` (hashed keys, permission checks, usage logging)
  - Evidence: `BE/src/routes/clientRoutes.ts` (scoped permissions per endpoint)
  - Evidence: `BE/src/db/schema.ts` (`api_clients`, `api_keys`, `api_key_permissions`, `api_key_usage`)

---

## 6) Export & reporting

### 6.1 Export CSV/PDF
- **CORRECT**:
  - Evidence: `FE/src/utils/export.ts` + `FE/src/pages/index.tsx` (CSV, PNG, PDF)

### 6.2 Chart downloads
- **CORRECT**:
  - Evidence: `FE/src/pages/index.tsx` (per-chart download + “Download All Charts”)

---

## 7) Security hardening

### 7.1 Password hashing (bcrypt ≥ 10)
- **CORRECT**:
  - Evidence: `BE/src/services/UserService.ts` + `BE/src/services/AuthService.ts`

### 7.2 Security headers + CORS + rate limiting
- **CORRECT**:
  - Evidence: `BE/src/app.ts` (helmet, CORS, rate limiting, request size limit)

### 7.3 JWT secret handling
- **CORRECT**: Secrets are required (no unsafe fallbacks).
  - Evidence: `BE/src/utils/jwt.ts`

---

## 8) Database integrity & schema alignment

### 8.1 Normalization + relationships
- **CORRECT (core entities)**:
  - Evidence: `BE/src/db/schema.ts` (profile + sub-entities, bidding + feature days, API keys)

---

## 9) Documentation & assessment readiness

### 9.1 README + env examples
- **PARTIALLY CORRECT**: READMEs exist and `.env.example` exists for both FE and BE.
  - Evidence: `BE/README.md`, `FE/README.md`, `BE/.env.example`, `FE/.env.example`
  - Note: Ensure example env files contain **no real credentials**.

