const express     = require('express');
const pool        = require('../db/client');
const requireAuth = require('../middleware/auth');
const validate    = require('../middleware/validate');
const { patientSchema, patientUpdateSchema } = require('../schemas/patient');

const router = express.Router();
router.use(requireAuth);

// ── POST /api/patients ────────────────────────────────────────────────────────
router.post('/', validate(patientSchema), async (req, res) => {
  const { name, phone, dateOfBirth, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO patients (doctor_id, name, phone, date_of_birth, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.doctorId, name, phone, dateOfBirth || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A patient with this phone number already exists' });
    }
    console.error('Create patient error:', err.message);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// ── GET /api/patients ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
              COUNT(m.id) FILTER (WHERE m.active = TRUE) AS active_medications
       FROM patients p
       LEFT JOIN medications m ON m.patient_id = p.id
       WHERE p.doctor_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.doctorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List patients error:', err.message);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// ── GET /api/patients/:patientId ──────────────────────────────────────────────
router.get('/:patientId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1 AND doctor_id = $2',
      [req.params.patientId, req.doctorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// ── PATCH /api/patients/:patientId ────────────────────────────────────────────
router.patch('/:patientId', validate(patientUpdateSchema), async (req, res) => {
  const fields  = req.body;
  const allowed = ['name', 'phone', 'date_of_birth', 'notes'];

  // Build SET clause dynamically from provided fields
  const updates = [];
  const values  = [];
  let   idx     = 1;

  if (fields.name)        { updates.push(`name = $${idx++}`);          values.push(fields.name); }
  if (fields.phone)       { updates.push(`phone = $${idx++}`);         values.push(fields.phone); }
  if (fields.dateOfBirth) { updates.push(`date_of_birth = $${idx++}`); values.push(fields.dateOfBirth); }
  if (fields.notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(fields.notes); }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.params.patientId, req.doctorId);

  try {
    const result = await pool.query(
      `UPDATE patients SET ${updates.join(', ')}
       WHERE id = $${idx} AND doctor_id = $${idx + 1}
       RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update patient error:', err.message);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// ── DELETE /api/patients/:patientId ───────────────────────────────────────────
router.delete('/:patientId', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 AND doctor_id = $2 RETURNING id',
      [req.params.patientId, req.doctorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

module.exports = router;
