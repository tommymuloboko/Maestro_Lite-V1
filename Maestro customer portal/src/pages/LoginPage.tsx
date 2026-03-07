import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, LogIn, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const success = login(email, password, role);
    if (success) {
      navigate(role === 'customer' ? '/dashboard' : '/station');
    } else {
      setError('Invalid credentials. Use the demo accounts shown below.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <Fuel size={48} className="brand-icon" />
          <h1>Maestro Fuel</h1>
          <p>Online Fuel Ordering System</p>
        </div>

        <div className="login-card">
          <div className="role-tabs">
            <button
              className={`role-tab ${role === 'customer' ? 'active' : ''}`}
              onClick={() => { setRole('customer'); setError(''); }}
            >
              <User size={18} />
              Customer
            </button>
            <button
              className={`role-tab ${role === 'station_manager' ? 'active' : ''}`}
              onClick={() => { setRole('station_manager'); setError(''); }}
            >
              <Shield size={18} />
              Station Manager
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'customer' ? 'customer@maestro.com' : 'manager@maestro.com'}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-full">
              <LogIn size={18} />
              Sign In
            </button>
          </form>

          <div className="demo-creds">
            <p><strong>Demo Credentials:</strong></p>
            {role === 'customer' ? (
              <p>customer@maestro.com / password123</p>
            ) : (
              <p>manager@maestro.com / password123</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
