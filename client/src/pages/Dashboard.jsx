import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { LogoFull } from '../components/Logo.jsx';
import PatientsTab  from '../components/PatientsTab.jsx';
import AdherenceTab from '../components/AdherenceTab.jsx';

const NAV = [
  { id: 'patients',  icon: '👥', label: 'Patients' },
  { id: 'adherence', icon: '📊', label: 'Adherence' },
];

export default function Dashboard() {
  const { doctor, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('patients');

  useEffect(() => {
    if (!loading && !doctor) navigate('/');
  }, [doctor, loading]);

  if (loading || !doctor) return <Loader />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--dark)',
        display: 'flex', flexDirection: 'column',
        padding: '0 0 24px',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo area */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: 12,
        }}>
          <LogoFull size={24} dark />
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 10px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 10, border: 'none',
              background: tab === n.id ? 'rgba(217,119,87,0.18)' : 'transparent',
              color: tab === n.id ? 'var(--accent)' : 'var(--mid-gray)',
              fontFamily: "'Poppins',sans-serif",
              fontWeight: tab === n.id ? 600 : 400,
              fontSize: 14, cursor: 'pointer',
              transition: 'background .15s, color .15s',
              marginBottom: 2,
              textAlign: 'left',
            }}
              onMouseEnter={e => { if (tab !== n.id) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (tab !== n.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Doctor profile footer */}
        <div style={{
          margin: '0 10px',
          padding: '14px 12px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, color: '#fff',
            }}>
              {doctor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13, color: '#fff', lineHeight: 1.2 }}>
                {doctor.name}
              </div>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 11, color: 'var(--mid-gray)', marginTop: 2 }}>
                {doctor.clinic_name}
              </div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            width: '100%', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '7px', color: 'var(--mid-gray)',
            fontFamily: "'Poppins',sans-serif", fontSize: 12, cursor: 'pointer',
            transition: 'background .15s, color .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--mid-gray)'; }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minWidth: 0 }}>
        {tab === 'patients'  && <PatientsTab />}
        {tab === 'adherence' && <AdherenceTab />}
      </main>
    </div>
  );
}

function Loader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--light-gray)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
