import React, { useState } from 'react';
import '../styles/AuthPages.css';
import apiService from '../services/api';   
function LoginPage({ onNavigate, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await apiService.login(formData);
      if (res.success) {
        setMessage('Login successful!');
        setTimeout(() => onSuccess(res.data, res.data.token), 1500);
      } else {
        setMessage(res.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Login failed: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}
        
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '14px', backgroundColor: '#2d5016', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
              cursor: 'pointer', marginTop: '8px'
            }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </div>
        <p className="auth-link">No account? <button onClick={() => onNavigate('register')}>Create one</button></p>
      </div>
    </div>
  );
}
export default LoginPage;