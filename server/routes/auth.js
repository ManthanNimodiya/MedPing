const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('../db/client');
const validate = require('../middleware/validate');
const { doctorRegisterSchema, doctorLoginSchema } = require('../schemas/doctor');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', validate(doctorRegisterSchema), async (req, res) => {
  const { name, email, password, clinicName, phone } = req.body;

  try {
    // Check duplicate email
    const existing = await pool.query('SELECT id FROM doctors WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO doctors (name, email, password_hash, clinic_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, clinic_name, phone, plan, created_at`,
      [name, email, passwordHash, clinicName, phone]
    );

    const doctor = result.rows[0];
    const token  = jwt.sign({ doctorId: doctor.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, doctor });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', validate(doctorLoginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM doctors WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const doctor = result.rows[0];
    const valid  = await bcrypt.compare(password, doctor.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ doctorId: doctor.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...safeDoctor } = doctor;
    res.json({ token, doctor: safeDoctor });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const requireAuth = require('../middleware/auth');

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, clinic_name, phone, plan, created_at FROM doctors WHERE id = $1',
      [req.doctorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
