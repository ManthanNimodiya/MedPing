import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { LogoMark } from './Logo.jsx';

export default function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
  const { login, register }     = useAuth();
  const [form, setForm]         = useState({ name: '', email: '', password: '', clinicName: '', phone: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const isLogin = mode === 'login';
  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
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
      background: 'rgba(20,20,19,0.45)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 20,
          background: 'none', border: 'none',
          fontSize: 22, color: 'var(--mid-gray)', cursor: 'pointer',
          fontFamily: "'Poppins',sans-serif",
        }}>×</button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <LogoMark size={44} />
          </div>
          <h2 style={{
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 700, fontSize: 22, letterSpacing: '-0.5px', color: 'var(--dark)',
          }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{
            fontFamily: "'Lora',serif",
            color: 'var(--text-muted)', fontSize: 14, marginTop: 6,
          }}>
            {isLogin ? 'Sign in to your doctor dashboard' : 'Start improving patient adherence today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isLogin && (
            <>
              <Field label="Full name"    value={form.name}       onChange={v => set('name', v)}       placeholder="Dr. Priya Nair"        required />
              <Field label="Clinic name"  value={form.clinicName} onChange={v => set('clinicName', v)} placeholder="Nair Diabetic Centre"   required />
              <Field label="Phone"        value={form.phone}      onChange={v => set('phone', v)}       placeholder="9876543210"             required />
            </>
          )}
          <Field label="Email"    type="email"    value={form.email}    onChange={v => set('email', v)}    placeholder="you@clinic.com"              required />
          <Field label="Password" type="password" value={form.password} onChange={v => set('password', v)} placeholder={isLogin ? '••••••••' : 'Min. 8 characters'} required />

          {error && (
            <div style={{
              background: 'var(--red-soft)', color: 'var(--red)',
              border: '1px solid #f5c6c6',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              fontFamily: "'Lora',serif", fontSize: 13,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? 'var(--mid-gray)' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '13px', fontSize: 15, fontWeight: 600,
            fontFamily: "'Poppins',sans-serif",
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 6, letterSpacing: '-0.2px',
            transition: 'background .15s',
          }}>
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: 22,
          fontFamily: "'Lora',serif", fontSize: 14, color: 'var(--text-muted)',
        }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => onSwitch(isLogin ? 'register' : 'login')} style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            {isLogin ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        fontFamily: "'Poppins',sans-serif",
        marginBottom: 6, color: 'var(--dark)',
        letterSpacing: '0.02em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', padding: '11px 14px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          background: '#fff', fontSize: 14,
          color: 'var(--dark)',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)'; }}
        onBlur={e  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
