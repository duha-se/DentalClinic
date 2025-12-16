import React, { useState } from 'react';
import apiService from '../services/api';
import '../styles/AuthPages.css';

function RegisterPage({ onNavigate, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', age: '', address: ''
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.register(formData);
      if (res.success) {
        setMessage('Registration successful! Redirecting...');
        setTimeout(() => {
          if (res.data && res.data.token) {
            onSuccess(res.data, res.data.token);
          }
        }, 1500);
      } else {
        setMessage(res.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Registration failed: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Book your dental appointments</p>
        {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}
        
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
            <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required />
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleInputChange} />
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} required />
            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '14px', backgroundColor: '#2d5016', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
              cursor: 'pointer', marginTop: '8px'
            }}>
              {loading ? 'Creating...' : 'Register'}
            </button>
          </div>
        </div>
        <p className="auth-link">Have account? <button onClick={() => onNavigate('login')}>Sign In</button></p>
      </div>
    </div>
  );
}
export default RegisterPage;