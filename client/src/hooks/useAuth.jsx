import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [doctor, setDoctor]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('medping_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(d => setDoctor(d))
      .catch(() => localStorage.removeItem('medping_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, doctor: d } = await api.post('/auth/login', { email, password });
    localStorage.setItem('medping_token', token);
    setDoctor(d);
    return d;
  }

  async function register(data) {
    const { token, doctor: d } = await api.post('/auth/register', data);
    localStorage.setItem('medping_token', token);
    setDoctor(d);
    return d;
  }

  function logout() {
    localStorage.removeItem('medping_token');
    setDoctor(null);
  }

  return (
    <AuthContext.Provider value={{ doctor, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
