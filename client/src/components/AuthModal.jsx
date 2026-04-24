import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
  const { login, register } = useAuth();
  const [form, setForm]     = useState({ name: '', email: '', password: '', clinicName: '', phone: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register({
          name:       form.name,
          email:      form.email,
          password:   form.password,
          clinicName: form.clinicName,
          phone:      form.phone.startsWith('+') ? form.phone : `+91${form.phone}`,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '36px 32px',
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none',
          fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer',
        }}>×</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
          <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.5px' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {isLogin ? 'Sign in to your doctor dashboard' : 'Start improving patient adherence today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isLogin && (
            <>
              <Field label="Full name" value={form.name} onChange={v => set('name', v)} placeholder="Dr. Priya Nair" required />
              <Field label="Clinic name" value={form.clinicName} onChange={v => set('clinicName', v)} placeholder="Nair Diabetic Centre" required />
              <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="9876543210" required />
            </>
          )}
          <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@clinic.com" required />
          <Field label="Password" type="password" value={form.password} onChange={v => set('password', v)} placeholder={isLogin ? '••••••••' : 'Min. 8 characters'} required />

          {error && (
            <div style={{
              background: 'var(--red-soft)', color: 'var(--red)',
              border: '1px solid #fca5a5',
              borderRadius: 8, padding: '10px 14px', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? '#ccc' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '12px', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4,
          }}>
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => onSwitch(isLogin ? 'register' : 'login')} style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            fontWeight: 600, cursor: 'pointer', fontSize: 14,
          }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', padding: '10px 12px',
          border: '1px solid var(--border)', borderRadius: 8,
          fontSize: 14, background: '#fff',
          transition: 'border-color .15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}
