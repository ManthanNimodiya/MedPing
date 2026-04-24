import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import Landing   from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
