/**
 * Run once to create all tables.
 * Usage: node db/migrate.js
 */
require('dotenv').config();
const pool = require('./client');

const SQL = `
-- ── Doctors ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  clinic_name  TEXT NOT NULL,
  phone        TEXT NOT NULL,
  plan         TEXT NOT NULL DEFAULT 'free',   -- free | pro | enterprise
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Patients ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,               -- WhatsApp number with country code
  date_of_birth DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, phone)                  -- one patient per phone per doctor
);

-- ── Medications ───────────────────────────────────────────────────────────────
-- reminder_times is a JSONB array of "HH:MM" strings, e.g. ["08:00","21:00"]
-- Each row is one prescription — fully per-patient schedule
CREATE TABLE IF NOT EXISTS medications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  dosage          TEXT NOT NULL,
  reminder_times  JSONB NOT NULL,            -- ["08:00", "14:00", "21:00"]
  start_date      DATE NOT NULL,
  end_date        DATE,
  instructions    TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Reminders ─────────────────────────────────────────────────────────────────
-- One row per scheduled reminder instance.
-- Idempotency key = (medication_id, scheduled_at) — prevents double-send on restart.
CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id   UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | sent | delivered | failed
  twilio_sid      TEXT,                             -- MessageSid from Twilio
  retry_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (medication_id, scheduled_at)             -- idempotency guard
);

-- ── Adherence logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS adherence_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id    UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  medication_id  UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  responded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status         TEXT NOT NULL,              -- taken | skipped | unknown
  raw_message    TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_medications_patient    ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status       ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_adherence_patient      ON adherence_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone         ON patients(phone);
`;

async function migrate() {
  console.log('Running migrations…');
  const client = await pool.connect();
  try {
    await client.query(SQL);
    console.log('✅ All tables created (or already exist)');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
