import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoFull } from '../components/Logo.jsx';
import AuthModal from '../components/AuthModal.jsx';

const features = [
  {
    icon: '⏰',
    title: 'Per-patient schedules',
    desc: 'Set exact reminder times for each prescription — 07:30 for one patient, 09:00 for another. Never a fixed global schedule.',
  },
  {
    icon: '💬',
    title: 'WhatsApp reminders',
    desc: "Patients reply YES or in their own language — English, Hindi, 'haan', 'le li'. Smart intent parsing handles it all.",
  },
  {
    icon: '🔄',
    title: '3× retry engine',
    desc: 'Failed sends retry automatically with exponential backoff via BullMQ + Redis. No reminder ever silently disappears.',
  },
  {
    icon: '📊',
    title: 'Real-time dashboard',
    desc: 'Adherence % per medication, missed doses, 30-day chart. Know who needs a follow-up before they do.',
  },
  {
    icon: '🔒',
    title: 'Production-grade security',
    desc: 'JWT auth, Zod-validated inputs, rate limiting, and environment-based secrets. Compliant from day one.',
  },
  {
    icon: '⚡',
    title: 'Idempotent by design',
    desc: "Server restarts can't cause double-sends. Every reminder is deduped at the database level.",
  },
];

const stats = [
  { value: '<150ms', label: 'API latency' },
  { value: '3×',    label: 'Auto retries' },
  { value: '95%+',  label: 'Delivery rate' },
  { value: '500+',  label: 'Concurrent reminders' },
];

export default function Landing() {
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();

  function onAuth() { setModal(null); navigate('/dashboard'); }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,249,245,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <LogoFull size={26} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setModal('login')} style={s.ghost}>Sign in</button>
          <button onClick={() => setModal('register')} style={s.primary}>Get started free →</button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 820, margin: '0 auto',
        padding: 'clamp(72px,10vw,120px) 24px 80px',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          border: '1px solid rgba(217,119,87,.25)',
          borderRadius: 999, padding: '6px 16px',
          fontSize: 13, fontFamily: "'Poppins',sans-serif", fontWeight: 500,
          marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          WhatsApp-first medication adherence
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Poppins', Arial, sans-serif",
          fontSize: 'clamp(38px, 6.5vw, 64px)',
          fontWeight: 700,
          letterSpacing: '-2px',
          lineHeight: 1.08,
          color: 'var(--dark)',
          marginBottom: 28,
        }}>
          Your patients never miss<br />
          <span style={{
            color: 'var(--accent)',
            fontStyle: 'italic',
            fontFamily: "'Lora', Georgia, serif",
          }}>their medication.</span>
        </h1>

        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 19, color: 'var(--text-muted)',
          maxWidth: 560, margin: '0 auto 44px',
          lineHeight: 1.7,
        }}>
          MedPing sends personalised WhatsApp reminders at each patient's exact schedule,
          parses their replies, and gives you a live adherence dashboard — no app needed.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setModal('register')} style={{ ...s.primary, fontSize: 16, padding: '14px 30px' }}>
            Start for free →
          </button>
          <button onClick={() => setModal('login')} style={{ ...s.ghost, fontSize: 16, padding: '14px 30px' }}>
            Doctor login
          </button>
        </div>
      </section>

      {/* ── WhatsApp mock ───────────────────────────────────────────────── */}
      <section style={{ maxWidth: 420, margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{
          background: '#e5ddd5',
          borderRadius: 24, padding: '20px 16px 24px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Status bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16, padding: '0 4px',
          }}>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
              MedPing
            </span>
            <span style={{ fontSize: 11, color: '#666', fontFamily: "'Poppins',sans-serif" }}>
              Today 8:00 AM
            </span>
          </div>

          <WaBubble from="bot"
            text={"💊 Hi Ravi! Time to take your *Metformin 500mg* — 1 tablet\n📝 Take with food\n\nReply *YES* once taken or *NO* to skip."} />
          <WaBubble from="user" text="Haan le li ✅" />
          <WaBubble from="bot" text="Great job Ravi! Logged for today. Keep it up 💪" />
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--dark)',
        padding: '56px 24px',
      }}>
        <div style={{
          maxWidth: 860, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 32, textAlign: 'center',
        }}>
          {stats.map(st => (
            <div key={st.label}>
              <div style={{
                fontFamily: "'Poppins',sans-serif",
                fontSize: 38, fontWeight: 700,
                color: 'var(--accent)', letterSpacing: '-2px',
              }}>{st.value}</div>
              <div style={{
                fontFamily: "'Lora',serif",
                fontSize: 14, color: 'var(--mid-gray)', marginTop: 6,
              }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{
            fontFamily: "'Poppins',sans-serif",
            fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700,
            letterSpacing: '-1px', color: 'var(--dark)', marginBottom: 14,
          }}>
            Everything a clinic needs
          </h2>
          <p style={{
            fontFamily: "'Lora',serif",
            color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto',
          }}>
            Built on a production-grade stack. Zero compromise on reliability.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} accent={i === 0} />
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '100px 24px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Poppins',sans-serif",
            fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700,
            letterSpacing: '-1px', marginBottom: 60,
          }}>
            How it works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '01', title: 'Doctor adds a patient & prescription', desc: 'Set the medication name, dosage, and exact reminder times — fully per patient.' },
              { n: '02', title: 'Cron detects the due time', desc: 'Every minute, the scheduler checks which medications are due and pushes jobs to Redis.' },
              { n: '03', title: 'Worker sends WhatsApp via Twilio', desc: 'The BullMQ worker fires the message. If Twilio fails, it retries 3× automatically.' },
              { n: '04', title: 'Patient replies in their language', desc: "YES, haan, le li, nahi — the parser handles them all and logs adherence in real time." },
              { n: '05', title: 'Doctor sees live adherence data', desc: 'Dashboard shows adherence %, missed doses, and 30-day charts per medication.' },
            ].map((step, i, arr) => (
              <div key={step.n} style={{ display: 'flex', gap: 24, textAlign: 'left', position: 'relative' }}>
                {/* Line */}
                {i < arr.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 19, top: 44, width: 2,
                    height: 'calc(100% + 8px)', background: 'var(--border)',
                  }} />
                )}
                {/* Number circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13,
                  zIndex: 1,
                }}>{step.n}</div>
                <div style={{ paddingBottom: 40 }}>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Poppins',sans-serif",
            fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700,
            letterSpacing: '-1.2px', marginBottom: 16,
          }}>
            Start improving adherence<br />today
          </h2>
          <p style={{
            fontFamily: "'Lora',serif",
            color: 'var(--text-muted)', fontSize: 17, marginBottom: 36,
          }}>
            Free to start. No credit card required.
          </p>
          <button
            onClick={() => setModal('register')}
            style={{ ...s.primary, fontSize: 17, padding: '15px 36px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            Create your free account →
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <LogoFull size={22} />
        <span style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} MedPing. MIT License.
        </span>
      </footer>

      {modal && (
        <AuthModal mode={modal} onClose={() => setModal(null)} onSwitch={m => setModal(m)} onSuccess={onAuth} />
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function FeatureCard({ feature, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--dark)' : 'var(--bg-card)',
      border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '28px 26px',
      transition: 'transform .18s, box-shadow .18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: 30, marginBottom: 14 }}>{feature.icon}</div>
      <div style={{
        fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16,
        color: accent ? '#fff' : 'var(--dark)', marginBottom: 10,
      }}>{feature.title}</div>
      <div style={{
        fontFamily: "'Lora',serif", fontSize: 14, lineHeight: 1.65,
        color: accent ? 'var(--mid-gray)' : 'var(--text-muted)',
      }}>{feature.desc}</div>
    </div>
  );
}

function WaBubble({ from, text }) {
  const isUser = from === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={{
        background: isUser ? '#dcf8c6' : '#fff',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
        maxWidth: '88%',
        fontFamily: "'Lora',serif",
        fontSize: 14, lineHeight: 1.55,
        boxShadow: '0 1px 2px rgba(0,0,0,.12)',
        whiteSpace: 'pre-wrap',
        color: '#1a1a1a',
      }}>
        {text.replace(/\*(.*?)\*/g, '$1')}
      </div>
    </div>
  );
}

/* Shared button styles */
const s = {
  primary: {
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 'var(--radius-sm)',
    padding: '10px 20px', fontWeight: 600, fontSize: 14,
    fontFamily: "'Poppins',sans-serif",
    cursor: 'pointer', transition: 'background .15s',
    letterSpacing: '-0.2px',
  },
  ghost: {
    background: 'transparent', color: 'var(--dark)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    padding: '10px 20px', fontWeight: 500, fontSize: 14,
    fontFamily: "'Poppins',sans-serif",
    cursor: 'pointer', transition: 'border-color .15s, background .15s',
  },
};
