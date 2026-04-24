const express     = require('express');
const pool        = require('../db/client');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── GET /api/adherence/:patientId ─────────────────────────────────────────────
// Summary: adherence % per medication for a patient
router.get('/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const { from, to }  = req.query;   // optional date filters YYYY-MM-DD

  try {
    // Ensure patient belongs to this doctor
    const patCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND doctor_id = $2',
      [patientId, req.doctorId]
    );
    if (patCheck.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const result = await pool.query(
      `SELECT
         m.id          AS medication_id,
         m.name        AS medication_name,
         m.dosage,
         COUNT(r.id)                                            AS total_reminders,
         COUNT(al.id) FILTER (WHERE al.status = 'taken')       AS taken_count,
         COUNT(al.id) FILTER (WHERE al.status = 'skipped')     AS skipped_count,
         COUNT(r.id) FILTER (WHERE r.status = 'sent'
           AND al.id IS NULL)                                   AS no_response_count,
         ROUND(
           100.0 * COUNT(al.id) FILTER (WHERE al.status = 'taken') /
           NULLIF(COUNT(r.id) FILTER (WHERE r.status IN ('sent','delivered')), 0),
           1
         )                                                      AS adherence_pct
       FROM medications m
       LEFT JOIN reminders r    ON r.medication_id = m.id
         AND ($1::date IS NULL OR r.scheduled_at::date >= $1::date)
         AND ($2::date IS NULL OR r.scheduled_at::date <= $2::date)
       LEFT JOIN adherence_logs al ON al.reminder_id = r.id
       WHERE m.patient_id = $3 AND m.doctor_id = $4
       GROUP BY m.id, m.name, m.dosage
       ORDER BY m.created_at DESC`,
      [from || null, to || null, patientId, req.doctorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Adherence fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch adherence data' });
  }
});

// ── GET /api/adherence/:patientId/timeline ────────────────────────────────────
// Day-by-day breakdown for charts
router.get('/:patientId/timeline', async (req, res) => {
  const { patientId } = req.params;
  const { days = 30 }  = req.query;

  try {
    const patCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND doctor_id = $2',
      [patientId, req.doctorId]
    );
    if (patCheck.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const result = await pool.query(
      `SELECT
         r.scheduled_at::date                                   AS date,
         COUNT(r.id)                                            AS total,
         COUNT(al.id) FILTER (WHERE al.status = 'taken')       AS taken,
         COUNT(al.id) FILTER (WHERE al.status = 'skipped')     AS skipped
       FROM reminders r
       JOIN medications m ON m.id = r.medication_id
       LEFT JOIN adherence_logs al ON al.reminder_id = r.id
       WHERE m.patient_id = $1
         AND m.doctor_id  = $2
         AND r.scheduled_at >= NOW() - ($3 || ' days')::interval
       GROUP BY date
       ORDER BY date ASC`,
      [patientId, req.doctorId, parseInt(days)]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

module.exports = router;
