import { useState } from 'react';
import { login } from '../utils/api';


export default function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(creds.username, creds.password);
      if (data.success) {
        onLogin();
      } else {
        setError(data.message || 'Invalid username or password');
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setError('Login failed. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-container card-3d">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-bracket">&lt;</span>
            <span className="logo-text">Admin</span>
            <span className="logo-bracket">/&gt;</span>
          </div>
          <h2>Portfolio Admin Panel</h2>
          <p>Enter your credentials to access the dashboard</p>
        </div>

        <form className="login-form" id="loginForm" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="admin-username">
              <i className="fas fa-user" aria-hidden="true"></i> Username
            </label>
            <input
              type="text"
              id="admin-username"
              name="username"
              value={creds.username}
              onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
              required
              autoComplete="username"
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">
              <i className="fas fa-lock" aria-hidden="true"></i> Password
            </label>
            <input
              type="password"
              id="admin-password"
              name="password"
              value={creds.password}
              onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
              required
              autoComplete="current-password"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div role="alert" className="login-error" style={{ display: 'block' }}>
              <i className="fas fa-exclamation-circle" aria-hidden="true"></i> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            id="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Logging in...</>
            ) : (
              <><i className="fas fa-sign-in-alt" aria-hidden="true"></i> <span>Login</span></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
