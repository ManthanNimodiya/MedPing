require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes       = require('./routes/auth');
const patientRoutes    = require('./routes/patients');
const medicationRoutes = require('./routes/medications');
const adherenceRoutes  = require('./routes/adherence');
const webhookRoutes    = require('./routes/webhook');
const { startScheduler } = require('./jobs/scheduler.cron');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Webhooks need raw body — mount before express.json()
app.use('/webhook', express.urlencoded({ extended: false }), webhookRoutes);

app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,               // stricter for login/register
  message: { error: 'Too many auth attempts, please try again later' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/patients',    patientRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/adherence',   adherenceRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 MedPing server running on port ${PORT}`);
  startScheduler();
});

module.exports = app;
