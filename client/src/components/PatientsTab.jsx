import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export default function PatientsTab() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  async function fetchPatients() {
    setLoading(true);
    try { const d = await api.get('/patients'); setPatients(d); } catch {}
    setLoading(false);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', color: 'var(--dark)' }}>
            Patients
          </h1>
          <p style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button onClick={() => setModal('add-patient')} style={btn.primary}>
          + Add patient
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
      ) : patients.length === 0 ? (
        <EmptyState icon="👤" title="No patients yet"
          desc="Add your first patient to start sending medication reminders."
          action={{ label: '+ Add patient', onClick: () => setModal('add-patient') }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {patients.map(p => (
            <PatientCard key={p.id} patient={p}
              onAddMed={() => { setSelected(p); setModal('add-med'); }}
              onRefresh={fetchPatients} />
          ))}
        </div>
      )}

      {modal === 'add-patient' && (
        <AddPatientModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchPatients(); }} />
      )}
      {modal === 'add-med' && selected && (
        <AddMedicationModal patient={selected} onClose={() => setModal(null)} onSaved={() => setModal(null)} />
      )}
    </div>
  );
}

function PatientCard({ patient, onAddMed, onRefresh }) {
  const [meds, setMeds]         = useState([]);
  const [open, setOpen]         = useState(false);
  const [loadMeds, setLoadMeds] = useState(false);

  async function toggleMeds() {
    if (!open && meds.length === 0) {
      setLoadMeds(true);
      try { setMeds(await api.get(`/medications?patientId=${patient.id}`)); } catch {}
      setLoadMeds(false);
    }
    setOpen(o => !o);
  }

  async function deleteMed(medId) {
    if (!confirm('Delete this medication and all its reminders?')) return;
    await api.delete(`/medications/${medId}`);
    setMeds(m => m.filter(x => x.id !== medId));
  }

  const initials = patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      transition: 'box-shadow .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Card header */}
      <div style={{
        padding: '18px 22px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer',
      }} onClick={toggleMeds}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--accent-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Poppins',sans-serif", fontWeight: 700,
            fontSize: 14, color: 'var(--accent)',
            flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15, color: 'var(--dark)' }}>
              {patient.name}
            </div>
            <div style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {patient.phone}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill text={`${patient.active_medications || 0} active`} color="green" />
          <span style={{ color: 'var(--mid-gray)', fontSize: 12, fontFamily: "'Poppins',sans-serif" }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded medications */}
      {open && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          padding: '16px 22px',
        }}>
          {loadMeds ? (
            <p style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>
          ) : meds.length === 0 ? (
            <p style={{ fontFamily: "'Lora',serif", fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              No medications added yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {meds.map(m => <MedRow key={m.id} med={m} onDelete={() => deleteMed(m.id)} />)}
            </div>
          )}
          <button onClick={e => { e.stopPropagation(); onAddMed(); }} style={btn.secondary}>
            + Add medication
          </button>
        </div>
      )}
    </div>
  );
}

function MedRow({ med, onDelete }) {
  const times = Array.isArray(med.reminder_times) ? med.reminder_times : JSON.parse(med.reminder_times || '[]');
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>
          {med.name}
        </div>
        <div style={{ fontFamily: "'Lora',serif", fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          {med.dosage} · {times.join(', ')}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pill text={med.active ? 'Active' : 'Paused'} color={med.active ? 'green' : 'gray'} />
        <button onClick={onDelete} style={{
          background: 'none', border: 'none', color: 'var(--mid-gray)',
          cursor: 'pointer', fontSize: 18, padding: '2px 6px', lineHeight: 1,
          fontFamily: "'Poppins',sans-serif",
        }}>×</button>
      </div>
    </div>
  );
}

/* ── Modals ─────────────────────────────────────────────────────────────────── */

function AddPatientModal({ onClose, onSaved }) {
  const [form, setForm]     = useState({ name: '', phone: '', notes: '' });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setError(''); }

  async function submit(e) {
    e.preventDefault(); setSaving(true);
    try {
      const phone = form.phone.startsWith('+') ? form.phone : `+91${form.phone}`;
      await api.post('/patients', { ...form, phone });
      onSaved();
    } catch (err) { setError(err.message); }
    setSaving(false);
  }

  return (
    <Modal title="Add patient" onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full name"          value={form.name}  onChange={v => set('name', v)}  placeholder="Ravi Sharma"     required />
        <Field label="WhatsApp number"    value={form.phone} onChange={v => set('phone', v)} placeholder="9876543210"       required />
        <Field label="Notes (optional)"   value={form.notes} onChange={v => set('notes', v)} placeholder="e.g. Diabetic patient" />
        {error && <ErrBox msg={error} />}
        <button type="submit" disabled={saving} style={{ ...btn.primary, width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
          {saving ? 'Saving…' : 'Add patient'}
        </button>
      </form>
    </Modal>
  );
}

function AddMedicationModal({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', dosage: '', reminderTimes: '', startDate: '', endDate: '', instructions: '' });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setError(''); }

  async function submit(e) {
    e.preventDefault();
    const reminderTimes = form.reminderTimes.split(',').map(t => t.trim()).filter(Boolean);
    setSaving(true);
    try {
      await api.post('/medications', {
        patientId:    patient.id,
        name:         form.name,
        dosage:       form.dosage,
        reminderTimes,
        startDate:    form.startDate,
        endDate:      form.endDate || undefined,
        instructions: form.instructions || undefined,
      });
      onSaved();
    } catch (err) { setError(err.message); }
    setSaving(false);
  }

  return (
    <Modal title={`Add medication — ${patient.name}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Medication name"    value={form.name}         onChange={v => set('name', v)}         placeholder="Metformin 500mg"            required />
        <Field label="Dosage"             value={form.dosage}       onChange={v => set('dosage', v)}       placeholder="1 tablet"                   required />
        <Field
          label="Reminder times (24h, comma-separated)"
          value={form.reminderTimes}
          onChange={v => set('reminderTimes', v)}
          placeholder="08:00, 14:00, 21:00"
          required
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start date"         type="date" value={form.startDate} onChange={v => set('startDate', v)} required />
          <Field label="End date (optional)" type="date" value={form.endDate}   onChange={v => set('endDate', v)}   />
        </div>
        <Field label="Instructions (optional)" value={form.instructions} onChange={v => set('instructions', v)} placeholder="Take with food" />
        {error && <ErrBox msg={error} />}
        <button type="submit" disabled={saving} style={{ ...btn.primary, width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
          {saving ? 'Saving…' : 'Add medication'}
        </button>
      </form>
    </Modal>
  );
}

/* ── Shared ─────────────────────────────────────────────────────────────────── */

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(20,20,19,0.4)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '28px', width: '100%', maxWidth: 460,
        boxShadow: 'var(--shadow-lg)', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--dark)', letterSpacing: '-0.4px' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--mid-gray)', fontFamily: "'Poppins',sans-serif" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
        textTransform: 'uppercase', marginBottom: 6,
        fontFamily: "'Poppins',sans-serif", color: 'var(--dark)',
      }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', padding: '10px 13px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          fontSize: 14, background: '#fff', color: 'var(--dark)',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)'; }}
        onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function ErrBox({ msg }) {
  return (
    <div style={{
      background: 'var(--red-soft)', color: 'var(--red)',
      border: '1px solid #f5c6c6',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
      fontFamily: "'Lora',serif", fontSize: 13,
    }}>{msg}</div>
  );
}

function Pill({ text, color }) {
  const map = {
    green: { bg: 'var(--green-soft)', color: 'var(--green)' },
    gray:  { bg: 'var(--bg-subtle)',  color: 'var(--mid-gray)' },
    orange:{ bg: 'var(--accent-soft)',color: 'var(--accent)' },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{
      background: c.bg, color: c.color,
      borderRadius: 999, padding: '3px 10px',
      fontSize: 11, fontWeight: 600,
      fontFamily: "'Poppins',sans-serif",
    }}>{text}</span>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '72px 24px',
      border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
      background: 'var(--bg-card)',
    }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--dark)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: "'Lora',serif", color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{desc}</div>
      {action && <button onClick={action.onClick} style={btn.primary}>{action.label}</button>}
    </div>
  );
}

const btn = {
  primary: {
    background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: 'var(--radius-sm)', padding: '9px 20px',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
    fontFamily: "'Poppins',sans-serif", letterSpacing: '-0.2px',
    transition: 'background .15s',
  },
  secondary: {
    background: 'none', color: 'var(--accent)',
    border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
    padding: '7px 16px', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
  },
};
