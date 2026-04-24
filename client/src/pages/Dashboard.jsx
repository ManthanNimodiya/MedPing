import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../api/client.js';
import PatientsTab from '../components/PatientsTab.jsx';
import AdherenceTab from '../components/AdherenceTab.jsx';

const TABS = ['Patients', 'Adherence'];

export default function Dashboard() {
  const { doctor, logout, loading } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab] = useState('Patients');

  useEffect(() => {
    if (!loading && !doctor) navigate('/');
  }, [doctor, loading]);

  if (loading || !doctor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header style={{
        height: 60, padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>💊</span>
          <span style={{ fontWeight: 700, letterSpacing: '-0.3px' }}>MedPing</span>
          <span style={{
            marginLeft: 4, background: 'var(--accent-soft)', color: 'var(--accent)',
            borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 500,
          }}>
            {doctor.plan}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{doctor.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doctor.clinic_name}</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 14px',
            fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div style={{
        padding: '0 28px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 4,
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none',
            padding: '14px 16px',
            fontSize: 14, fontWeight: tab === t ? 600 : 400,
            color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer', transition: 'color .15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '28px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        {tab === 'Patients'   && <PatientsTab />}
        {tab === 'Adherence'  && <AdherenceTab />}
      </main>
    </div>
  );
}
