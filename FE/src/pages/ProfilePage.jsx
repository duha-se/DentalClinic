import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import apiService from '../services/api';

function ProfilePage({ onNavigate, user, upcomingAppointments: propsUpcoming, pastAppointments: propsPast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [appointments, setAppointments] = useState([]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProfile();
      if (res && res.data) {
        setForm({ name: res.data.name || '', phone: res.data.phone || '', address: res.data.address || '', email: res.data.email || '' });
      }
    } catch (err) {
      setMessage(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    // If parent passed appointments, don't fetch; otherwise load them here
    if (
  (!propsUpcoming || propsUpcoming.length === 0) &&
  (!propsPast || propsPast.length === 0)
) {
  loadAppointments();
}

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await apiService.getMyAppointments();
      if (res && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.warn('Failed to load appointments for profile:', err?.message || err);
    }
  };


  // derive lists: prefer props from parent if provided, otherwise use local appointments
  const now = new Date();
//   const upcoming = propsUpcoming || appointments.filter(a => {
//     const appointmentDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
//     return appointmentDate >= now;
//   });
const upcoming =
  propsUpcoming && propsUpcoming.length > 0
    ? propsUpcoming
    : appointments.filter((a) => {
        const d = new Date(`${a.appointment_date}T${a.appointment_time}`);
        return d >= now;
      });

const past =
  propsPast && propsPast.length > 0
    ? propsPast
    : appointments.filter((a) => {
        const d = new Date(`${a.appointment_date}T${a.appointment_time}`);
        return d < now;
      });

//   const past = propsPast || appointments.filter(a => {
//     const appointmentDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
//     return appointmentDate < now;
//   });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address };
      const res = await apiService.updateProfile(payload);
      if (res && res.success) {
        setMessage('Profile updated successfully');
        setEditing(false);
        // reload profile to ensure sync
        await loadProfile();
      } else {
        setMessage(res.message || 'Update failed');
      }
    } catch (err) {
      setMessage(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="home-page-container">
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">Profile</h2>

          {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          {loading ? (
            <p>Loading profile...</p>
          ) : (
            <div className="about-content">
              <div className="about-text">
                {editing ? (
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Name</label>
                      <input name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Phone</label>
                      <input name="phone" value={form.phone} onChange={handleChange} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Address</label>
                      <input name="address" value={form.address} onChange={handleChange} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      <button className="btn btn-secondary" style={{ marginLeft: 12 }} onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3>{form.name}</h3>
                    <p>{form.email}</p>
                    <p>{form.phone}</p>
                    <p>{form.address}</p>
                    <div style={{ marginTop: 12 }}>
                      <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                      <button className="btn btn-secondary" style={{ marginLeft: 12 }} onClick={() => onNavigate && onNavigate('dashboard')}>Back</button>
                    </div>
                  </div>
                )}
              </div>
                <div className="about-stats">
                  {/** Show counts either from props or local state */}

                  {(() => {
                    const all = propsUpcoming || propsPast ? (propsUpcoming || []).concat(propsPast || []) : appointments || [];
                    const now = new Date();
                    const upcoming = propsUpcoming || appointments.filter(a => {
                      const appointmentDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
                      return appointmentDate >= now;
                    });
                    const past = propsPast || appointments.filter(a => {
                      const appointmentDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
                      return appointmentDate < now;
                    });
                    return (
                      <>
                        <div className="stat">
                          <h3>{all.length}</h3>
                          <p>Appointments</p>
                        </div>
                        <div className="stat">
                          <h3>{upcoming.length}</h3>
                          <p>Upcoming</p>
                        </div>
                        <div className="stat">
                          <h3>{past.length}</h3>
                          <p>Completed</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
            </div>
          )}
        </div>
      </section>
        {/* Appointments lists */}
        <section style={{ padding: 24 }}>
          {upcoming.length > 0 && (
            <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, marginBottom: 20 }}>
              <h3 style={{ color: '#2d5016', marginBottom: 12 }}>📅 Upcoming Appointments</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {upcoming.map((apt) => (
                  <div key={apt.id} style={{ padding: 12, backgroundColor: '#f5ede3', borderRadius: 8, borderLeft: '4px solid #4a7c2c' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#2d5016' }}>{apt.service_name}</h4>
                        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{apt.appointment_date} at {apt.appointment_time}</p>
                      </div>
                      <span style={{ padding: '4px 12px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{apt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12 }}>
              <h3 style={{ color: '#2d5016', marginBottom: 12 }}>✓ Completed Appointments</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {past.map((apt) => (
                  <div key={apt.id} style={{ padding: 12, backgroundColor: '#f5ede3', borderRadius: 8, borderLeft: '4px solid #c1463b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#2d5016' }}>{apt.service_name}</h4>
                        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{apt.appointment_date} at {apt.appointment_time}</p>
                      </div>
                      <span style={{ padding: '4px 12px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
    </div>
  );
}

export default ProfilePage;
