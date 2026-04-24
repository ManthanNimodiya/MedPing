import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

export default function PatientsTab() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);   // 'add-patient' | 'add-med' | null
  const [selected, setSelected] = useState(null);   // selected patient for medications

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    try {
      const data = await api.get('/patients');
      setPatients(data);
    } catch {}
    setLoading(false);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Patients</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
            {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button onClick={() => setModal('add-patient')} style={btnPrimary}>
          + Add patient
        </button>
      </div>

      {/* Patient list */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading patients…</div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon="👤"
          title="No patients yet"
          desc="Add your first patient to start sending medication reminders."
          action={{ label: '+ Add patient', onClick: () => setModal('add-patient') }}
        />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {patients.map(p => (
            <PatientCard
              key={p.id}
              patient={p}
              onAddMed={() => { setSelected(p); setModal('add-med'); }}
              onRefresh={fetchPatients}
            />
          ))}
        </div>
      )}

      {/* Modals */}
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
  const [meds, setMeds]       = useState([]);
  const [open, setOpen]       = useState(false);
  const [loadMeds, setLoadMeds] = useState(false);

  async function toggleMeds() {
    if (!open && meds.length === 0) {
      setLoadMeds(true);
      try {
        const data = await api.get(`/medications?patientId=${patient.id}`);
        setMeds(data);
      } catch {}
      setLoadMeds(false);
    }
    setOpen(o => !o);
  }

  async function deleteMed(medId) {
    if (!confirm('Delete this medication and all its reminders?')) return;
    await api.delete(`/medications/${medId}`);
    setMeds(m => m.filter(x => x.id !== medId));
  }

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      overflow: 'hidden', background: '#fff',
    }}>
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer',
      }} onClick={toggleMeds}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--accent-soft)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15,
          }}>
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{patient.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{patient.phone}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            background: 'var(--green-soft)', color: 'var(--green)',
            borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 500,
          }}>
            {patient.active_medications || 0} active med{patient.active_medications !== 1 ? 's' : ''}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--bg-subtle)' }}>
          {loadMeds ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</div>
          ) : meds.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No medications yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              {meds.map(m => (
                <MedRow key={m.id} med={m} onDelete={() => deleteMed(m.id)} />
              ))}
            </div>
          )}
          <button onClick={e => { e.stopPropagation(); onAddMed(); }} style={btnSecondary}>
            + Add medication
          </button>
        </div>
      )}
    </div>
  );
}

function MedRow({ med, onDelete }) {
  const times = Array.isArray(med.reminder_times)
    ? med.reminder_times
    : JSON.parse(med.reminder_times || '[]');

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
      padding: '12px 14px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{med.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {med.dosage} · {times.join(', ')}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          background: med.active ? 'var(--green-soft)' : 'var(--border)',
          color: med.active ? 'var(--green)' : 'var(--text-muted)',
          borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 500,
        }}>
          {med.active ? 'Active' : 'Paused'}
        </span>
        <button onClick={onDelete} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: 16, padding: '2px 6px',
        }}>×</button>
      </div>
    </div>
  );
}

function AddPatientModal({ onClose, onSaved }) {
  const [form, setForm]   = useState({ name: '', phone: '', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setError(''); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const phone = form.phone.startsWith('+') ? form.phone : `+91${form.phone}`;
      await api.post('/patients', { ...form, phone });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <Modal title="Add patient" onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full name"    value={form.name}  onChange={v => set('name', v)}  placeholder="Ravi Sharma" required />
        <Field label="WhatsApp number" value={form.phone} onChange={v => set('phone', v)} placeholder="9876543210" required />
        <Field label="Notes (optional)" value={form.notes} onChange={v => set('notes', v)} placeholder="e.g. Diabetic patient" />
        {error && <ErrorBox msg={error} />}
        <button type="submit" disabled={saving} style={btnPrimary}>
          {saving ? 'Saving…' : 'Add patient'}
        </button>
      </form>
    </Modal>
  );
}

function AddMedicationModal({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', dosage: '', reminderTimes: '', startDate: '', endDate: '', instructions: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setError(''); }

  async function submit(e) {
    e.preventDefault();
    // Parse comma-separated times "08:00, 14:00, 21:00" → ["08:00","14:00","21:00"]
    const reminderTimes = form.reminderTimes
      .split(',').map(t => t.trim()).filter(Boolean);

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
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <Modal title={`Add medication — ${patient.name}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Medication name" value={form.name}   onChange={v => set('name', v)}   placeholder="Metformin 500mg" required />
        <Field label="Dosage"          value={form.dosage} onChange={v => set('dosage', v)} placeholder="1 tablet" required />
        <Field
          label="Reminder times (comma-separated, 24h)"
          value={form.reminderTimes}
          onChange={v => set('reminderTimes', v)}
          placeholder="08:00, 14:00, 21:00"
          required
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start date" type="date" value={form.startDate} onChange={v => set('startDate', v)} required />
          <Field label="End date (optional)" type="date" value={form.endDate} onChange={v => set('endDate', v)} />
        </div>
        <Field label="Instructions (optional)" value={form.instructions} onChange={v => set('instructions', v)} placeholder="Take with food" />
        {error && <ErrorBox msg={error} />}
        <button type="submit" disabled={saving} style={btnPrimary}>
          {saving ? 'Saving…' : 'Add medication'}
        </button>
      </form>
    </Modal>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────────────── */

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        padding: '28px 28px', width: '100%', maxWidth: 460,
        boxShadow: 'var(--shadow-lg)', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', padding: '9px 12px',
          border: '1px solid var(--border)', borderRadius: 8, fontSize: 14,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      background: 'var(--red-soft)', color: 'var(--red)',
      border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>{msg}</div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>{desc}</div>
      {action && (
        <button onClick={action.onClick} style={btnPrimary}>{action.label}</button>
      )}
    </div>
  );
}

const btnPrimary = {
  background: 'var(--accent)', color: '#fff', border: 'none',
  borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
};
const btnSecondary = {
  background: 'none', color: 'var(--accent)',
  border: '1px solid var(--accent)', borderRadius: 8,
  padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};
