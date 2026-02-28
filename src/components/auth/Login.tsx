import { useState, type FormEvent } from 'react';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || `http://localhost:${import.meta.env.VITE_API_PORT || 3000}`;

export function Login({ onLoginSuccess, onNavigateToRegister: _onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    const credentials = role === 'admin' 
      ? { email: 'admin@farmalink.com', password: 'admin123' }
      : { email: 'user@farmalink.com', password: 'user123' };
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ ...data.user, role }));
      onLoginSuccess();
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Bienvenido a FarmaLink</p>

        {error && <div className="login-error">{error}</div>}

        <div className="demo-buttons">
          <button 
            type="button" 
            className="demo-btn demo-btn-user" 
            onClick={() => handleDemoLogin('user')}
            disabled={loading}
          >
            Demo Usuario
          </button>
          <button 
            type="button" 
            className="demo-btn demo-btn-admin" 
            onClick={() => handleDemoLogin('admin')}
            disabled={loading}
          >
            Demo Admin
          </button>
        </div>

        <div className="login-divider">
          <span>o inicia con tu cuenta</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta?{' '}
          <button type="button" className="link-btn" onClick={_onNavigateToRegister}>
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}
