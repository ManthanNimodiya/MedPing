const express   = require('express');
const pool      = require('../db/client');
const { parseAdherenceReply, normaliseTwilioPhone } = require('../services/adherence');

const router = express.Router();

// ── POST /webhook/whatsapp ────────────────────────────────────────────────────
// Twilio calls this when a patient replies to a WhatsApp message.
router.post('/whatsapp', async (req, res) => {
  // Twilio sends form-encoded body
  const from = req.body.From;   // "whatsapp:+919876543210"
  const body = req.body.Body;

  if (!from || !body) {
    return res.status(400).send('<Response></Response>');
  }

  const phone  = normaliseTwilioPhone(from);
  const intent = parseAdherenceReply(body);

  try {
    // Find the most recent sent reminder for this patient (within last 2 hours)
    const reminderResult = await pool.query(
      `SELECT r.id, r.medication_id, r.patient_id, r.scheduled_at
       FROM reminders r
       JOIN patients p ON p.id = r.patient_id
       WHERE p.phone = $1
         AND r.status IN ('sent', 'delivered')
         AND r.sent_at >= NOW() - INTERVAL '2 hours'
         AND NOT EXISTS (
           SELECT 1 FROM adherence_logs al WHERE al.reminder_id = r.id
         )
       ORDER BY r.scheduled_at DESC
       LIMIT 1`,
      [phone]
    );

    if (reminderResult.rows.length > 0) {
      const reminder = reminderResult.rows[0];

      await pool.query(
        `INSERT INTO adherence_logs
           (reminder_id, medication_id, patient_id, scheduled_at, status, raw_message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [reminder.id, reminder.medication_id, reminder.patient_id,
         reminder.scheduled_at, intent, body]
      );

      console.log(`✅ Adherence logged: ${phone} → ${intent}`);
    } else {
      console.log(`⚠️  No matching reminder found for ${phone}`);
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
  }

  // Always reply with empty TwiML — Twilio requires a response
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
});

// ── POST /webhook/status ──────────────────────────────────────────────────────
// Twilio calls this with delivery status updates (delivered / failed / read).
router.post('/status', async (req, res) => {
  const { MessageSid, MessageStatus } = req.body;

  if (!MessageSid || !MessageStatus) return res.sendStatus(400);

  const statusMap = {
    delivered: 'delivered',
    read:      'delivered',   // treat read as delivered
    failed:    'failed',
    undelivered: 'failed',
  };

  const mappedStatus = statusMap[MessageStatus];
  if (!mappedStatus) return res.sendStatus(200); // ignore interim statuses

  try {
    await pool.query(
      'UPDATE reminders SET status = $1 WHERE twilio_sid = $2',
      [mappedStatus, MessageSid]
    );
  } catch (err) {
    console.error('Status webhook error:', err.message);
  }

  res.sendStatus(200);
});

module.exports = router;
