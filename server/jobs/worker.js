/**
 * BullMQ worker — processes reminder jobs.
 *
 * Each job payload:
 * {
 *   reminderId:     UUID,
 *   patientPhone:   "+919876543210",
 *   patientName:    "Ravi Sharma",
 *   medicationName: "Metformin 500mg",
 *   dosage:         "1 tablet",
 *   time:           "08:00",
 *   instructions:   "Take with food"  (optional)
 * }
 *
 * On success: marks reminder as sent + stores twilio_sid.
 * On failure: BullMQ retries up to 3× with exponential backoff.
 * After 3 failures: status set to "failed".
 */
require('dotenv').config();
const { Worker }             = require('bullmq');
const twilio                 = require('twilio');
const pool                   = require('../db/client');
const { connection }         = require('./queue');
const { buildReminderMessage } = require('../services/scheduler');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const worker = new Worker('reminders', async (job) => {
  const {
    reminderId, patientPhone, patientName,
    medicationName, dosage, time, instructions,
  } = job.data;

  const message = buildReminderMessage({ patientName, medicationName, dosage, time, instructions });

  console.log(`📤 Sending reminder to ${patientPhone} — ${medicationName}`);

  const msg = await twilioClient.messages.create({
    from:           `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to:             `whatsapp:${patientPhone}`,
    body:           message,
    statusCallback: `${process.env.SERVER_URL}/webhook/status`,
  });

  // Mark reminder as sent with twilio_sid for delivery tracking
  await pool.query(
    `UPDATE reminders
     SET status = 'sent', sent_at = NOW(), twilio_sid = $1, retry_count = $2
     WHERE id = $3`,
    [msg.sid, job.attemptsMade, reminderId]
  );

  console.log(`✅ Reminder sent: ${msg.sid}`);
}, {
  connection,
  concurrency: 10,   // process up to 10 jobs simultaneously
});

// ── Event handlers ────────────────────────────────────────────────────────────
worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', async (job, err) => {
  console.error(`Job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);

  // After all retries exhausted, mark as failed in DB
  if (job.attemptsMade >= job.opts.attempts) {
    await pool.query(
      `UPDATE reminders SET status = 'failed', retry_count = $1 WHERE id = $2`,
      [job.attemptsMade, job.data.reminderId]
    ).catch(e => console.error('Failed to mark reminder as failed:', e.message));
  }
});

console.log('🔧 BullMQ worker started');
module.exports = worker;
