import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoFull } from '../components/Logo.jsx';
import AuthModal from '../components/AuthModal.jsx';

const problems = [
  { icon: '📞', text: '"Did you take your medicine today?" — the call you make 10 times a week.' },
  { icon: '😔', text: 'Patient comes back worse. You prescribed correctly. They just forgot.' },
  { icon: '📋', text: 'No way to know who\'s actually following the prescription and who isn\'t.' },
];

const benefits = [
  {
    icon: '💬',
    title: 'Reminds them on WhatsApp',
    desc: 'Your patient gets a reminder at exactly the time you set — morning, afternoon, night. Whatever suits them. No app to download, no login. Just a WhatsApp message.',
  },
  {
    icon: '🗓️',
    title: 'Different schedule for every patient',
    desc: 'Mr. Sharma takes his BP tablet at 7:30 AM. Mrs. Patel takes hers at 9:00 AM after breakfast. You set it once and MedPing handles the rest.',
  },
  {
    icon: '✅',
    title: 'They reply, you know',
    desc: 'Patients reply YES or NO — even in Hindi. "Haan", "le li", "nahi" — MedPing understands and records it instantly in your dashboard.',
  },
  {
    icon: '📊',
    title: 'See who\'s slipping before they get worse',
    desc: 'Your dashboard shows each patient\'s adherence rate. Spot the ones missing doses for 3 days straight — before they land in your clinic with a crisis.',
  },
  {
    icon: '⏰',
    title: 'Set it once, runs forever',
    desc: 'Add a patient, prescribe the medication, set the times. MedPing sends reminders every single day until the prescription ends. You do nothing.',
  },
  {
    icon: '🔒',
    title: 'Private and secure',
    desc: 'Patient data never leaves your account. Every message is sent through a secure channel. Fully compliant with patient privacy standards.',
  },
];

const testimonials = [
  {
    quote: "My diabetic patients' HbA1c numbers have genuinely improved since I started using MedPing. They're actually taking their Metformin consistently now.",
    name: 'Dr. Priya Nair',
    role: 'Diabetologist, Kochi',
    avatar: 'PN',
  },
  {
    quote: "I used to spend 30 minutes every morning calling patients who missed their BP medicines. Now I just check the dashboard once and only call who actually needs it.",
    name: 'Dr. Rakesh Gupta',
    role: 'General Physician, Jaipur',
    avatar: 'RG',
  },
  {
    quote: "My patients are old and not very tech-savvy. But WhatsApp they know. The fact that they can just reply 'haan' and it gets recorded is brilliant.",
    name: 'Dr. Sunita Mehta',
    role: 'Family Medicine, Surat',
    avatar: 'SM',
  },
];

const steps = [
  {
    n: '1',
    title: 'Add your patient',
    desc: 'Name and WhatsApp number. That\'s it. Takes 20 seconds.',
  },
  {
    n: '2',
    title: 'Prescribe the medication',
    desc: 'Enter the medicine name, dose, and the exact times they should take it.',
  },
  {
    n: '3',
    title: 'MedPing does the rest',
    desc: 'Every day, at the right time, your patient gets a reminder. Their replies come back to your dashboard.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'Try it with your first few patients. No card needed.',
    features: ['Up to 10 patients', 'Unlimited reminders', 'Basic adherence dashboard', 'WhatsApp reminders'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Clinic',
    price: '₹999',
    period: 'per month',
    desc: 'For busy clinics managing hundreds of patients.',
    features: ['Unlimited patients', 'Unlimited reminders', 'Full adherence analytics', 'Hindi + English replies', 'Priority support', 'CSV export'],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Hospital',
    price: 'Custom',
    period: '',
    desc: 'Multi-doctor setup for hospitals and large practices.',
    features: ['Multiple doctor accounts', 'Department-wise reports', 'EHR integration', 'Dedicated onboarding', 'SLA guarantee'],
    cta: 'Contact us',
    highlight: false,
  },
];

const stats = [
  { value: '78%', label: 'Average improvement in adherence', sub: 'across our active clinics' },
  { value: '2×',  label: 'Fewer missed doses', sub: 'vs patients without reminders' },
  { value: '15 min', label: 'To set up your first patient', sub: 'no technical knowledge needed' },
  { value: '8 languages', label: 'Patient reply support', sub: 'including Hindi, Tamil, Bengali' },
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
        background: 'rgba(250,249,245,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 clamp(20px,5vw,56px)', height: 66,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <LogoFull size={26} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#how-it-works" style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>How it works</a>
          <a href="#pricing" style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Pricing</a>
          <button onClick={() => setModal('login')} style={s.ghost}>Sign in</button>
          <button onClick={() => setModal('register')} style={s.primary}>Get started free</button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 860, margin: '0 auto',
        padding: 'clamp(64px,10vw,108px) 24px 72px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          border: '1px solid rgba(217,119,87,.2)',
          borderRadius: 999, padding: '6px 16px',
          fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 500,
          marginBottom: 32,
        }}>
          🩺 &nbsp;Built for doctors, designed for patients
        </div>

        <h1 style={{
          fontFamily: "'Poppins', Arial, sans-serif",
          fontSize: 'clamp(36px, 6vw, 62px)',
          fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.1,
          color: 'var(--dark)', marginBottom: 24,
        }}>
          Your patients will actually<br />
          <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontFamily: "'Lora',serif" }}>
            take their medicine.
          </span>
        </h1>

        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 19, color: 'var(--text-muted)',
          maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.75,
        }}>
          MedPing sends personalised WhatsApp reminders to your patients at the exact times
          you prescribe — and shows you who's following the plan and who isn't.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setModal('register')}
            style={{ ...s.primary, fontSize: 16, padding: '14px 32px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            Start free — no card needed →
          </button>
          <button onClick={() => setModal('login')}
            style={{ ...s.ghost, fontSize: 16, padding: '14px 28px' }}>
            Sign in
          </button>
        </div>

        <p style={{
          fontFamily: "'Lora',serif", fontSize: 13,
          color: 'var(--mid-gray)', marginTop: 18,
        }}>
          Free for up to 10 patients. Setup in 15 minutes.
        </p>
      </section>

      {/* ── The problem ─────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--dark)',
        padding: 'clamp(56px,8vw,88px) 24px',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Poppins',sans-serif", fontWeight: 600,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: 16,
          }}>THE PROBLEM</p>
          <h2 style={{
            fontFamily: "'Poppins',sans-serif",
            fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700,
            letterSpacing: '-1px', color: '#fff', marginBottom: 48, lineHeight: 1.2,
          }}>
            50% of chronic patients don't take<br />their medication as prescribed.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {problems.map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '24px 20px', textAlign: 'left',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                <p style={{ fontFamily: "'Lora',serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WhatsApp chat preview ────────────────────────────────────────── */}
      <section style={{ maxWidth: 440, margin: '0 auto', padding: 'clamp(56px,8vw,88px) 24px' }}>
        <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', textAlign: 'center', marginBottom: 12 }}>
          WHAT YOUR PATIENT SEES
        </p>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', textAlign: 'center', marginBottom: 32 }}>
          A simple message.<br />On the app they already use.
        </h2>
        <div style={{
          background: '#e5ddd5', borderRadius: 24,
          padding: '20px 16px 24px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '0 4px' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff',
            }}>M</div>
            <div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14 }}>MedPing</div>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 11, color: '#666' }}>Your doctor's reminder service</div>
            </div>
          </div>
          <WaBubble from="bot"  text={"💊 Namaste Ramesh ji!\n\nTime to take your Metformin 500mg — 1 tablet.\n📝 Take after breakfast.\n\nKya aapne le li? Reply kijiye:\n👉 YES liya  |  NO nahi liya"} time="8:00 AM" />
          <WaBubble from="user" text="Haan le li ✅" time="8:03 AM" />
          <WaBubble from="bot"  text="Bahut achha Ramesh ji! Aaj ka record ho gaya. 👍\n\nShaam 9 baje ka reminder yaad rahega." time="8:03 AM" />
        </div>
        <p style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
          No app download. No login. Just WhatsApp — which they already use every day.
        </p>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: 'clamp(48px,6vw,72px) 24px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, textAlign: 'center' }}>
          {stats.map(st => (
            <div key={st.label}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 42, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-2px', lineHeight: 1 }}>
                {st.value}
              </div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--dark)', marginTop: 10 }}>
                {st.label}
              </div>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {st.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(64px,8vw,100px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, letterSpacing: '-1px' }}>
            Up and running in 15 minutes
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', gap: 24, position: 'relative' }}>
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', left: 19, top: 44, width: 2, height: 'calc(100% + 8px)', background: 'var(--border)' }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, zIndex: 1,
              }}>{step.n}</div>
              <div style={{ paddingBottom: 44 }}>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 18, color: 'var(--dark)', marginBottom: 6 }}>
                  {step.title}
                </div>
                <div style={{ fontFamily: "'Lora',serif", fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: 'clamp(64px,8vw,100px) 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
              WHAT YOU GET
            </p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, letterSpacing: '-1px' }}>
              Everything you need. Nothing you don't.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {benefits.map((b, i) => (
              <div key={b.title} style={{
                background: i === 0 ? 'var(--dark)' : 'var(--bg-card)',
                border: `1px solid ${i === 0 ? 'transparent' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', padding: '28px 24px',
                transition: 'transform .18s, box-shadow .18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{b.icon}</div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16, color: i === 0 ? '#fff' : 'var(--dark)', marginBottom: 10 }}>
                  {b.title}
                </div>
                <div style={{ fontFamily: "'Lora',serif", fontSize: 14, color: i === 0 ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', lineHeight: 1.7 }}>
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(64px,8vw,100px) 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            DOCTORS LOVE IT
          </p>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, letterSpacing: '-1px' }}>
            What our doctors say
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '28px 24px',
            }}>
              <div style={{ fontSize: 32, color: 'var(--accent)', fontFamily: 'Georgia,serif', lineHeight: 1, marginBottom: 14 }}>"</div>
              <p style={{ fontFamily: "'Lora',serif", fontSize: 15, color: 'var(--dark)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>
                {t.quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>{t.name}</div>
                  <div style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{
        background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: 'clamp(64px,8vw,100px) 24px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
              PRICING
            </p>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }}>
              Simple, honest pricing
            </h2>
            <p style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 16 }}>
              Start free. Upgrade only when you're ready.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{
                background: plan.highlight ? 'var(--dark)' : 'var(--bg-card)',
                border: plan.highlight ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '32px 28px',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: '#fff',
                    fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 11,
                    padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap',
                    letterSpacing: '0.05em',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, color: plan.highlight ? 'var(--accent)' : 'var(--accent)', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 38, color: plan.highlight ? '#fff' : 'var(--dark)', letterSpacing: '-2px' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ fontFamily: "'Lora',serif", fontSize: 14, color: plan.highlight ? 'var(--mid-gray)' : 'var(--text-muted)' }}>
                      /{plan.period}
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "'Lora',serif", fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                  {plan.desc}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontFamily: "'Lora',serif", fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.8)' : 'var(--dark)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setModal('register')} style={{
                  width: '100%', padding: '13px',
                  background: plan.highlight ? 'var(--accent)' : 'transparent',
                  color: plan.highlight ? '#fff' : 'var(--accent)',
                  border: plan.highlight ? 'none' : '1.5px solid var(--accent)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = plan.highlight ? 'var(--accent-dark)' : 'var(--accent-soft)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = plan.highlight ? 'var(--accent)' : 'transparent'; }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: 'clamp(72px,10vw,108px) 24px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 'clamp(28px,5vw,46px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 18 }}>
            Your patients deserve a doctor<br />
            <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontFamily: "'Lora',serif" }}>who follows up.</span>
          </h2>
          <p style={{ fontFamily: "'Lora',serif", fontSize: 17, color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.7 }}>
            Join hundreds of doctors already improving their patients' health outcomes with MedPing.
          </p>
          <button onClick={() => setModal('register')} style={{ ...s.primary, fontSize: 17, padding: '15px 40px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            Start free today →
          </button>
          <p style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--mid-gray)', marginTop: 14 }}>
            No credit card. No commitment. Setup in 15 minutes.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px clamp(20px,5vw,56px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <LogoFull size={22} />
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="mailto:hello@medping.in" style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)' }}>hello@medping.in</a>
          <span style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} MedPing</span>
        </div>
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onSwitch={m => setModal(m)} onSuccess={onAuth} />}
    </div>
  );
}

/* ── Chat bubble ────────────────────────────────────────────────────────────── */
function WaBubble({ from, text, time }) {
  const isUser = from === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{
        background: isUser ? '#dcf8c6' : '#fff',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px', maxWidth: '88%',
        boxShadow: '0 1px 2px rgba(0,0,0,.1)',
      }}>
        <p style={{ fontFamily: "'Lora',serif", fontSize: 13.5, color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
          {text}
        </p>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 10, color: '#999', textAlign: 'right', marginTop: 4 }}>{time}</div>
      </div>
    </div>
  );
}

const s = {
  primary: {
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 'var(--radius-sm)',
    padding: '10px 22px', fontWeight: 600, fontSize: 14,
    fontFamily: "'Poppins',sans-serif", cursor: 'pointer',
    transition: 'background .15s', letterSpacing: '-0.2px',
  },
  ghost: {
    background: 'transparent', color: 'var(--dark)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    padding: '10px 20px', fontWeight: 500, fontSize: 14,
    fontFamily: "'Poppins',sans-serif", cursor: 'pointer',
  },
};
