import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
    setSelected(p); setAdherence([]); setTimeline([]);
    const [adh, tl] = await Promise.all([
      api.get(`/adherence/${p.id}`),
      api.get(`/adherence/${p.id}/timeline?days=30`),
    ]);
    setAdherence(adh); setTimeline(tl);
  }

  if (loading) return <p style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>;

  if (patients.length === 0) return (
    <div style={{
      textAlign: 'center', padding: '72px 24px',
      border: '1px dashed var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-card)',
    }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>📊</div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--dark)', marginBottom: 8 }}>No data yet</div>
      <div style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14 }}>Add patients in the Patients tab to see adherence data.</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', color: 'var(--dark)', marginBottom: 8 }}>
        Adherence
      </h1>
      <p style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
        Real-time medication compliance per patient
      </p>

      {/* Patient selector pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
        {patients.map(p => (
          <button key={p.id} onClick={() => selectPatient(p)} style={{
            fontFamily: "'Poppins',sans-serif",
            background: selected?.id === p.id ? 'var(--accent)' : 'var(--bg-card)',
            color: selected?.id === p.id ? '#fff' : 'var(--dark)',
            border: `1px solid ${selected?.id === p.id ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 999, padding: '8px 18px', fontSize: 13,
            fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
          }}>
            {p.name}
          </button>
        ))}
      </div>

      {selected && (
        <>
          {adherence.length === 0 ? (
            <div style={{
              padding: '40px 24px', textAlign: 'center',
              border: '1px dashed var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-card)',
              fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14,
            }}>
              No medication data yet for {selected.name}.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 36 }}>
              {adherence.map(m => <AdherenceCard key={m.medication_id} med={m} />)}
            </div>
          )}

          {/* 30-day chart */}
          {timeline.length > 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '28px',
            }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--dark)' }}>
                  30-day activity — {selected.name}
                </h3>
                <p style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Daily doses taken vs scheduled
                </p>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--light-gray)' }} />
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: 'var(--text-muted)' }}>Scheduled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--green)' }} />
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: 'var(--text-muted)' }}>Taken</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timeline} barSize={10} barGap={3}>
                  <XAxis dataKey="date" tick={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fill: 'var(--mid-gray)' }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fill: 'var(--mid-gray)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={(val, name) => [val, name === 'taken' ? '✅ Taken' : '📅 Scheduled']}
                    labelFormatter={l => `Date: ${l}`}
                  />
                  <Bar dataKey="total" fill="#e8e6dc" radius={[4,4,0,0]} name="total" />
                  <Bar dataKey="taken" fill="#788c5d" radius={[4,4,0,0]} name="taken" />
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

  const theme = pct == null ? { ring: 'var(--mid-gray)', bg: 'var(--bg-subtle)', text: 'var(--text-muted)' }
    : pct >= 80  ? { ring: 'var(--green)',  bg: 'var(--green-soft)',  text: 'var(--green)' }
    : pct >= 50  ? { ring: 'var(--yellow)', bg: 'var(--yellow-soft)', text: 'var(--yellow)' }
    :              { ring: 'var(--red)',    bg: 'var(--red-soft)',    text: 'var(--red)' };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '22px',
      transition: 'box-shadow .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15, color: 'var(--dark)', marginBottom: 4 }}>
        {med.medication_name}
      </div>
      <div style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
        {med.dosage}
      </div>

      {/* Ring-style percentage */}
      <div style={{
        background: theme.bg, borderRadius: 12,
        padding: '16px', textAlign: 'center', marginBottom: 16,
      }}>
        <div style={{
          fontFamily: "'Poppins',sans-serif",
          fontSize: 38, fontWeight: 700, letterSpacing: '-2px',
          color: theme.text, lineHeight: 1,
        }}>
          {pct != null ? `${pct}%` : '—'}
        </div>
        <div style={{ fontFamily: "'Lora',serif", fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          adherence rate
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
        <StatCell label="Taken"    val={med.taken_count}       color="var(--green)"  />
        <StatCell label="Skipped"  val={med.skipped_count}     color="var(--yellow)" />
        <StatCell label="No reply" val={med.no_response_count} color="var(--mid-gray)" />
      </div>
    </div>
  );
}

function StatCell({ label, val, color }) {
  return (
    <div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 20, color, lineHeight: 1 }}>
        {val ?? 0}
      </div>
      <div style={{ fontFamily: "'Lora',serif", fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
