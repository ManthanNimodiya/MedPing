import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdherenceTab() {
  const [patients, setPatients]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [adherence, setAdherence] = useState([]);
  const [timeline, setTimeline]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/patients').then(data => {
      setPatients(data);
      if (data.length > 0) selectPatient(data[0]);
    }).finally(() => setLoading(false));
  }, []);

  async function selectPatient(p) {
    setSelected(p);
    setAdherence([]);
    setTimeline([]);
    const [adh, tl] = await Promise.all([
      api.get(`/adherence/${p.id}`),
      api.get(`/adherence/${p.id}/timeline?days=30`),
    ]);
    setAdherence(adh);
    setTimeline(tl);
  }

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</div>;

  if (patients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontWeight: 600 }}>No patients yet</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
          Add patients in the Patients tab to see adherence data.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 20 }}>Adherence</h1>

      {/* Patient selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {patients.map(p => (
          <button key={p.id} onClick={() => selectPatient(p)} style={{
            background: selected?.id === p.id ? 'var(--accent)' : 'var(--bg-subtle)',
            color: selected?.id === p.id ? '#fff' : 'var(--text)',
            border: `1px solid ${selected?.id === p.id ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8, padding: '7px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            {p.name}
          </button>
        ))}
      </div>

      {selected && (
        <>
          {/* Medication adherence cards */}
          {adherence.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No medication data yet for {selected.name}.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 32 }}>
              {adherence.map(m => (
                <AdherenceCard key={m.medication_id} med={m} />
              ))}
            </div>
          )}

          {/* Timeline chart */}
          {timeline.length > 0 && (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px',
            }}>
              <h3 style={{ fontWeight: 600, marginBottom: 4 }}>30-day activity — {selected.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Daily doses taken vs total</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timeline} barSize={12}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(val, name) => [val, name === 'taken' ? 'Taken' : 'Total']}
                    labelFormatter={l => `Date: ${l}`}
                  />
                  <Bar dataKey="total"  fill="var(--border)"   radius={[4,4,0,0]} name="total" />
                  <Bar dataKey="taken"  fill="var(--green)"    radius={[4,4,0,0]} name="taken" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdherenceCard({ med }) {
  const pct = med.adherence_pct != null ? parseFloat(med.adherence_pct) : null;

  const color = pct == null ? 'var(--text-muted)'
    : pct >= 80 ? 'var(--green)'
    : pct >= 50 ? 'var(--yellow)'
    : 'var(--red)';

  const bg = pct == null ? 'var(--bg-subtle)'
    : pct >= 80 ? 'var(--green-soft)'
    : pct >= 50 ? 'var(--yellow-soft)'
    : 'var(--red-soft)';

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '20px', background: '#fff',
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{med.medication_name}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{med.dosage}</div>

      {/* Big adherence % */}
      <div style={{
        background: bg, color, borderRadius: 8,
        padding: '12px', textAlign: 'center', marginBottom: 14,
      }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>
          {pct != null ? `${pct}%` : '—'}
        </div>
        <div style={{ fontSize: 12, marginTop: 2 }}>adherence</div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
        <Stat label="Taken"     value={med.taken_count}       color="var(--green)" />
        <Stat label="Skipped"   value={med.skipped_count}     color="var(--yellow)" />
        <Stat label="No reply"  value={med.no_response_count} color="var(--text-muted)" />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color }}>{value ?? 0}</div>
      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
