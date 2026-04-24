/**
 * Runs every minute.
 * Finds all active medications whose reminderTimes include the current HH:MM,
 * creates a reminders row (idempotency: UNIQUE on medication_id + scheduled_at),
 * and pushes a job to BullMQ for the worker to send the WhatsApp message.
 */
const cron           = require('node-cron');
const pool           = require('../db/client');
const { reminderQueue } = require('./queue');

function getCurrentHHMM() {
  const now = new Date();
  const hh  = String(now.getUTCHours()).padStart(2, '0');
  const mm  = String(now.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function getCurrentDateStr() {
  return new Date().toISOString().slice(0, 10);   // "YYYY-MM-DD"
}

async function tick() {
  const currentTime = getCurrentHHMM();
  const currentDate = getCurrentDateStr();

  try {
    // Fetch all active medications where:
    // 1. today is within [start_date, end_date]
    // 2. reminder_times JSONB array contains currentTime
    const { rows: medications } = await pool.query(
      `SELECT m.id, m.name, m.dosage, m.reminder_times, m.instructions,
              p.id AS patient_id, p.name AS patient_name, p.phone AS patient_phone
       FROM medications m
       JOIN patients p ON p.id = m.patient_id
       WHERE m.active = TRUE
         AND $1::date >= m.start_date
         AND (m.end_date IS NULL OR $1::date <= m.end_date)
         AND m.reminder_times @> $2::jsonb`,
      [currentDate, JSON.stringify([currentTime])]
    );

    if (medications.length === 0) return;

    console.log(`⏰ ${currentTime} — ${medications.length} reminder(s) due`);

    for (const med of medications) {
      const scheduledAt = new Date();
      scheduledAt.setSeconds(0, 0);

      // INSERT ... ON CONFLICT DO NOTHING is the idempotency guard.
      // If server restarts mid-minute, the second cron tick skips already-inserted rows.
      const { rowCount } = await pool.query(
        `INSERT INTO reminders (medication_id, patient_id, scheduled_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (medication_id, scheduled_at) DO NOTHING`,
        [med.id, med.patient_id, scheduledAt]
      );

      if (rowCount === 0) {
        // Already enqueued this minute — skip
        continue;
      }

      // Fetch the newly created reminder id
      const { rows } = await pool.query(
        `SELECT id FROM reminders
         WHERE medication_id = $1 AND scheduled_at = $2`,
        [med.id, scheduledAt]
      );

      const reminderId = rows[0].id;

      // Push to BullMQ — worker handles Twilio send + retries
      await reminderQueue.add('send-reminder', {
        reminderId,
        patientPhone:   med.patient_phone,
        patientName:    med.patient_name,
        medicationName: med.name,
        dosage:         med.dosage,
        time:           currentTime,
        instructions:   med.instructions,
      });

      console.log(`📬 Queued: ${med.patient_name} — ${med.name} @ ${currentTime}`);
    }
  } catch (err) {
    console.error('Scheduler tick error:', err.message);
  }
}

function startScheduler() {
  // Run every minute
  cron.schedule('* * * * *', tick, { timezone: 'UTC' });
  console.log('🕐 Reminder scheduler started (every minute, UTC)');
}

module.exports = { startScheduler, tick };
