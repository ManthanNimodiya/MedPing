import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal.jsx';

const features = [
  {
    icon: '💊',
    title: 'Per-patient schedules',
    desc: 'Set exact reminder times for each patient — 7:30 AM for one, 9:00 AM for another. Never a fixed global schedule.',
  },
  {
    icon: '📲',
    title: 'WhatsApp reminders',
    desc: "Patients reply YES or NO in their own language. Supports English, Hindi, and natural phrases like 'le li' or 'haan'.",
  },
  {
    icon: '🔄',
    title: 'Retry engine',
    desc: 'Failed messages retry automatically up to 3× with exponential backoff. Powered by Redis + BullMQ.',
  },
  {
    icon: '📊',
    title: 'Adherence dashboard',
    desc: 'See adherence % per patient per medication, missed doses, and day-by-day timelines — all in one view.',
  },
  {
    icon: '🔒',
    title: 'Secure by default',
    desc: 'JWT auth, rate limiting, Zod-validated inputs, and environment-based secrets. Built for production from day one.',
  },
  {
    icon: '⚡',
    title: 'Idempotent scheduler',
    desc: "Reminders are deduped at the DB level — server restarts can't cause double-sends.",
  },
];

const stats = [
  { value: '< 150ms', label: 'API latency' },
  { value: '3×',      label: 'Auto retries' },
  { value: '95%+',    label: 'Delivery rate' },
  { value: '500+',    label: 'Concurrent reminders' },
];

export default function Landing() {
  const [modal, setModal] = useState(null);   // 'login' | 'register' | null
  const navigate = useNavigate();

  function onAuth() {
    setModal(null);
    navigate('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>💊</span>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>MedPing</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setModal('login')} style={styles.btnGhost}>
            Doctor Login
          </button>
          <button onClick={() => setModal('register')} style={styles.btnPrimary}>
            Get started free
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 760, margin: '0 auto',
        padding: '96px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          borderRadius: 999, padding: '6px 14px',
          fontSize: 13, fontWeight: 500, marginBottom: 28,
          border: '1px solid rgba(201,100,66,0.2)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          WhatsApp-powered medication adherence
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 58px)',
          fontWeight: 700,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          marginBottom: 24,
          color: 'var(--text)',
        }}>
          Your patients remember their<br />
          <span style={{ color: 'var(--accent)' }}>medication.</span> Every time.
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-muted)',
          maxWidth: 540, margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          MedPing sends personalised WhatsApp reminders at each patient's exact schedule,
          tracks responses, and gives you a real-time adherence dashboard — no app install needed.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setModal('register')} style={{ ...styles.btnPrimary, fontSize: 16, padding: '13px 28px' }}>
            Start for free →
          </button>
          <button onClick={() => setModal('login')} style={{ ...styles.btnGhost, fontSize: 16, padding: '13px 28px' }}>
            Doctor login
          </button>
        </div>
      </section>

      {/* ── WhatsApp preview ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 480, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{
          background: '#ece5dd',
          borderRadius: 20,
          padding: '20px 16px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{
              background: 'rgba(0,0,0,0.12)', borderRadius: 999,
              padding: '4px 14px', fontSize: 12, color: '#555',
            }}>Today 8:00 AM</span>
          </div>
          <ChatBubble from="medping" text="💊 Hi Ravi! Time to take your *Metformin 500mg* — 1 tablet&#10;📝 Take with food&#10;&#10;Reply *YES* once taken or *NO* to skip." />
          <ChatBubble from="patient" text="Yes" />
          <ChatBubble from="medping" text="✅ Logged! Great job staying on track, Ravi." />
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 24px',
      }}>
        <div style={{
          maxWidth: 800, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 32,
          textAlign: 'center',
        }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 12 }}>
          Everything a clinic needs
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 56 }}>
          Built on a production-grade stack. Zero compromise on reliability.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))',
          gap: 20,
        }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              transition: 'box-shadow .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--text)',
        color: '#fff',
        textAlign: 'center',
        padding: '72px 24px',
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 12 }}>
          Start improving adherence today
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 36, fontSize: 16 }}>
          Free to start. No credit card required.
        </p>
        <button onClick={() => setModal('register')} style={{
          background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 8,
          padding: '14px 32px', fontSize: 16, fontWeight: 600,
          cursor: 'pointer',
          transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          Create your free account →
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
        color: 'var(--text-muted)', fontSize: 13,
      }}>
        <span>💊 MedPing — Medication Adherence Platform</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>

      {/* ── Auth modal ───────────────────────────────────────────────────── */}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSwitch={m => setModal(m)}
          onSuccess={onAuth}
        />
      )}
    </div>
  );
}

function ChatBubble({ from, text }) {
  const isMe = from === 'patient';
  return (
    <div style={{
      display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
      marginBottom: 8,
    }}>
      <div style={{
        background: isMe ? '#dcf8c6' : '#fff',
        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 14px',
        maxWidth: '85%',
        fontSize: 14,
        lineHeight: 1.5,
        boxShadow: '0 1px 2px rgba(0,0,0,.1)',
        whiteSpace: 'pre-wrap',
      }}>
        {text.replace(/\*(.*?)\*/g, '$1')}
      </div>
    </div>
  );
}

const styles = {
  btnPrimary: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '9px 18px',
    fontWeight: 600,
    fontSize: 14,
    transition: 'background .15s',
  },
  btnGhost: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 18px',
    fontWeight: 500,
    fontSize: 14,
    transition: 'border-color .15s',
  },
};
