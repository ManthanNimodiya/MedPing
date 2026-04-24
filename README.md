# 💊 MedPing

**Medication adherence platform for doctors — powered by WhatsApp.**

MedPing lets doctors set personalised reminder schedules for each patient, sends automated WhatsApp messages via Twilio, and tracks responses (taken / skipped) in a real-time dashboard.

---

## Features

- **Per-patient reminder times** — doctor sets exact HH:MM times for each prescription
- **WhatsApp reminders** — patients reply YES / NO in English or Hindi (`haan`, `le li`, `nahi`)
- **Retry engine** — failed messages retry 3× with exponential backoff (BullMQ + Redis)
- **Idempotent scheduler** — `UNIQUE(medication_id, scheduled_at)` prevents double-sends on restart
- **Delivery tracking** — Twilio status callbacks update `delivered` / `failed` per reminder
- **Adherence dashboard** — per-medication adherence %, missed doses, 30-day chart
- **Rate limiting** — 100 req/15 min globally, 10 req/15 min on auth routes

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | Node.js + Express |
| Database | PostgreSQL |
| Queue | Redis + BullMQ |
| Scheduler | node-cron |
| WhatsApp | Twilio WhatsApp API |
| Validation | Zod |
| Auth | JWT (bcryptjs) |
| Frontend | React + Vite |
| Tests | Jest (98 tests) |

---

## Project Structure

```
medping/
├── server/
│   ├── db/              # PostgreSQL client + migrations
│   ├── jobs/            # BullMQ queue, worker, cron scheduler
│   ├── middleware/       # Auth (JWT) + Zod validation
│   ├── routes/          # auth, patients, medications, adherence, webhook
│   ├── schemas/         # Zod schemas
│   ├── services/        # Pure functions: adherence parser, scheduler logic
│   └── tests/           # Jest unit tests
└── client/
    └── src/
        ├── pages/       # Landing, Dashboard
        ├── components/  # AuthModal, PatientsTab, AdherenceTab
        ├── hooks/       # useAuth
        └── api/         # fetch client
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Twilio account with WhatsApp sandbox

### 1. Clone & install

```bash
git clone https://github.com/ManthanNimodiya/MedPing.git
cd MedPing
npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET, TWILIO_* values
```

### 3. Run migrations

```bash
node server/db/migrate.js
```

### 4. Start (3 terminals)

```bash
# API server — port 4000
npm run dev:server

# Frontend — port 5173
npm run dev:client

# BullMQ worker (WhatsApp sender)
node server/jobs/worker.js
```

### 5. Run tests

```bash
npm test
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Doctor registration |
| POST | `/api/auth/login` | Doctor login |
| GET | `/api/auth/me` | Current doctor profile |
| GET/POST | `/api/patients` | List / create patients |
| PATCH/DELETE | `/api/patients/:id` | Update / delete patient |
| GET/POST | `/api/medications` | List / create medications |
| PATCH/DELETE | `/api/medications/:id` | Update / delete medication |
| GET | `/api/adherence/:patientId` | Adherence summary per medication |
| GET | `/api/adherence/:patientId/timeline` | 30-day day-by-day chart data |
| POST | `/webhook/whatsapp` | Twilio incoming reply webhook |
| POST | `/webhook/status` | Twilio delivery status webhook |

---

## How Reminders Work

```
Cron (every 1 min)
  → queries DB: active medications where reminder_times @> [current HH:MM]
  → INSERT INTO reminders ... ON CONFLICT DO NOTHING   ← idempotency
  → push job to BullMQ queue
        ↓
BullMQ Worker
  → sends WhatsApp via Twilio
  → marks reminder sent + stores twilio_sid
  → on fail: retries 3× (5s → 10s → 20s backoff)
        ↓
Twilio status callback → /webhook/status
  → updates reminder: delivered / failed
        ↓
Patient replies → /webhook/whatsapp
  → parses intent (taken / skipped / unknown)
  → writes adherence_logs row
```

---

## License

MIT — see [LICENSE](LICENSE)
