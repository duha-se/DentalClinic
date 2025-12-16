import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import apiService from '../services/api';

function AppointmentsPage({ onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getMyAppointments();
      if (res && res.data) setAppointments(res.data);
      else setAppointments([]);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(id);
    try {
      const res = await apiService.cancelAppointment(id);
      if (res && res.success) {
        // optimistic update: mark canceled
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'canceled' } : a));
      } else {
        alert(res.message || 'Cancel failed');
      }
    } catch (err) {
      alert(err.message || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="home-page-container">
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">My Appointments</h2>

          {loading && <p>Loading appointments...</p>}
          {error && <div className="message error">{error}</div>}

          {!loading && appointments.length === 0 && <p>No appointments found.</p>}

          <div className="services-grid">
            {appointments.map(a => (
              <div key={a.id} className="service-card">
                <h4>{a.service || a.service_name || 'Service'}</h4>
                <p>Date: {a.appointment_date || a.date} • Time: {a.appointment_time || a.time}</p>
                <p>Status: {a.status}</p>
                <div style={{ marginTop: 8 }}>
                  {a.status === 'upcoming' && (
                    <button className="btn btn-danger" disabled={actionLoading === a.id} onClick={() => handleCancel(a.id)}>
                      {actionLoading === a.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => onNavigate && onNavigate('dashboard')}>Back</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AppointmentsPage;
