const express     = require('express');
const pool        = require('../db/client');
const requireAuth = require('../middleware/auth');
const validate    = require('../middleware/validate');
const { medicationSchema, medicationUpdateSchema } = require('../schemas/medication');

const router = express.Router();
router.use(requireAuth);

// ── POST /api/medications ─────────────────────────────────────────────────────
router.post('/', validate(medicationSchema), async (req, res) => {
  const { patientId, name, dosage, reminderTimes, startDate, endDate, instructions } = req.body;

  // Ensure the patient belongs to this doctor
  try {
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND doctor_id = $2',
      [patientId, req.doctorId]
    );
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const result = await pool.query(
      `INSERT INTO medications
         (doctor_id, patient_id, name, dosage, reminder_times, start_date, end_date, instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.doctorId, patientId, name, dosage,
        JSON.stringify(reminderTimes),
        startDate, endDate || null, instructions || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create medication error:', err.message);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

// ── GET /api/medications?patientId=... ────────────────────────────────────────
router.get('/', async (req, res) => {
  const { patientId } = req.query;

  try {
    let query  = 'SELECT m.* FROM medications m WHERE m.doctor_id = $1';
    const vals = [req.doctorId];

    if (patientId) {
      query += ' AND m.patient_id = $2';
      vals.push(patientId);
    }

    query += ' ORDER BY m.created_at DESC';

    const result = await pool.query(query, vals);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// ── GET /api/medications/:medicationId ────────────────────────────────────────
router.get('/:medicationId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medications WHERE id = $1 AND doctor_id = $2',
      [req.params.medicationId, req.doctorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Medication not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medication' });
  }
});

// ── PATCH /api/medications/:medicationId ──────────────────────────────────────
router.patch('/:medicationId', validate(medicationUpdateSchema), async (req, res) => {
  const fields  = req.body;
  const updates = [];
  const values  = [];
  let   idx     = 1;

  if (fields.name)          { updates.push(`name = $${idx++}`);           values.push(fields.name); }
  if (fields.dosage)        { updates.push(`dosage = $${idx++}`);         values.push(fields.dosage); }
  if (fields.reminderTimes) { updates.push(`reminder_times = $${idx++}`); values.push(JSON.stringify(fields.reminderTimes)); }
  if (fields.startDate)     { updates.push(`start_date = $${idx++}`);     values.push(fields.startDate); }
  if (fields.endDate !== undefined) { updates.push(`end_date = $${idx++}`); values.push(fields.endDate); }
  if (fields.instructions !== undefined) { updates.push(`instructions = $${idx++}`); values.push(fields.instructions); }
  if (fields.active !== undefined) { updates.push(`active = $${idx++}`);  values.push(fields.active); }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.params.medicationId, req.doctorId);

  try {
    const result = await pool.query(
      `UPDATE medications SET ${updates.join(', ')}
       WHERE id = $${idx} AND doctor_id = $${idx + 1}
       RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Medication not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update medication error:', err.message);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// ── DELETE /api/medications/:medicationId ─────────────────────────────────────
router.delete('/:medicationId', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM medications WHERE id = $1 AND doctor_id = $2 RETURNING id',
      [req.params.medicationId, req.doctorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Medication not found' });
    res.json({ message: 'Medication deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

module.exports = router;
