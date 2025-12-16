import React, { useState, useEffect } from "react";
import "../styles/HomePage.css";
import apiService from "../services/api";
import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";

function DashboardPage({ user, token, onLogout, onNavigate, selectedPage }) {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState(selectedPage || "dashboard");
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    service_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Sync activeTab with parent selectedPage
  useEffect(() => {
    if (selectedPage && selectedPage !== "home") setActiveTab(selectedPage);
  }, [selectedPage]);

  const tabs = [
    { id: "home", name: "Home", icon: "🏠" },
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "booking", name: "Book", icon: "📅" },
    { id: "appointments", name: "My Appts", icon: "🗓️" },
    { id: "profile", name: "Profile", icon: "👤" },
  ];

  useEffect(() => {
    fetchServices();
    fetchAppointments();
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Separate past and upcoming appointments
  const now = new Date();
  
  const pastAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
    return appointmentDate < now;
  });
  
  const upcomingAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(`${a.appointment_date}T${a.appointment_time}`);
    return appointmentDate >= now;
  });

  const fetchServices = async () => {
    try {
      const res = await apiService.getServices();
      if (res && res.data && Array.isArray(res.data) && res.data.length) setServices(res.data);
      else
        setServices([
          { id: "checkup", name: "General Checkup" },
          { id: "cleaning", name: "Teeth Cleaning" },
        ]);
    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await apiService.getMyAppointments();
      if (res && res.data) {
        const uniqueAppointments = Array.from(new Map(res.data.map((apt) => [apt.id, apt])).values());
        setAppointments(uniqueAppointments);
      }
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const res = await apiService.getAvailableSlots(date);
      if (res && res.data) setAvailableSlots(res.data);
    } catch (err) {
      console.error("Failed to load slots", err);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await apiService.getOverview();
      if (res && res.success) {
        const uniqueAppointments = Array.from(
          new Map((res.data.appointments || []).map((apt) => [apt.id, apt])).values()
        );
        setAppointments(uniqueAppointments);
        setTreatmentPlan(res.data.treatmentPlan || null);
      }
    } catch (err) {
      console.error("Failed to fetch overview", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (name === "appointment_date") {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime()) && d.getDay() === 5) {
          // Friday
          setAvailableSlots([]);
          setFormData((p) => ({ ...p, appointment_date: "" }));
          setToast({ open: true, message: "يوم الجمعة عطلة، لا يمكن الحجز", severity: "error" });
          return;
        }
      } catch (err) {
        // ignore
      }
      fetchAvailableSlots(value);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.bookAppointment(formData);
      if (!res || !res.success) throw new Error((res && res.message) || "Booking failed");
      setToast({ open: true, message: "تم حجز الموعد بنجاح", severity: "success" });
      const bookedDate = formData.appointment_date;
      await fetchAppointments();
      await fetchOverview();
      if (bookedDate) await fetchAvailableSlots(bookedDate);
      setFormData({ service_id: "", appointment_date: "", appointment_time: "" });
    } catch (err) {
      setToast({ open: true, message: err.message || "Booking failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    onNavigate && onNavigate(tabId);
  };


  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5ede3" }}>
      <nav
        style={{
          backgroundColor: "#2d5016",
          color: "white",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20 }}>🦷 Dental Clinic</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>{user?.name}</span>
          <button
            onClick={onLogout}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#c1463b", border: "none", color: "white", borderRadius: 5, cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr" }}>
        <aside
          style={{
            position: "sticky",
            top: 80,
            height: "calc(100vh - 80px)",
            backgroundColor: "white",
            borderRight: "1px solid #e0e0e0",
            paddingTop: 12,
            overflowY: "auto",
            zIndex: 50,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              style={{
                width: "100%",
                padding: "12px 16px",
                textAlign: "left",
                border: "none",
                backgroundColor: activeTab === t.id ? "#f5ede3" : "white",
                color: "#333",
                cursor: "pointer",
                fontWeight: activeTab === t.id ? 600 : 500,
                borderLeft: activeTab === t.id ? "4px solid #2d5016" : "none",
                fontSize: 13,
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ marginRight: 8 }}>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </aside>

        <main style={{ padding: 30, backgroundColor: "#f5ede3", overflowY: "auto", maxHeight: "calc(100vh - 80px)" }}>
          {activeTab === "home" && (
            <div>
              <HomePage user={user} onNavigate={onNavigate} />
            </div>
          )}

          {activeTab === "dashboard" && (
            <div>
              <h2 style={{ color: "#2d5016", marginBottom: 20 }}>Dashboard</h2>
              <div style={{ backgroundColor: "white", padding: 24, borderRadius: 12, marginBottom: 20 }}>
                <p style={{ marginBottom: 8 }}>Welcome, {user?.name}</p>
                <p style={{ color: "#666", fontSize: 14 }}>Email: {user?.email}</p>
                <p style={{ color: "#666", fontSize: 14 }}>Phone: {user?.phone}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 30 }}>
                <div style={{ backgroundColor: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
                  <h3 style={{ color: "#2d5016", margin: "0 0 8px 0", fontSize: 24 }}>{upcomingAppointments.length}</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Upcoming</p>
                </div>
                <div style={{ backgroundColor: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
                  <h3 style={{ color: "#2d5016", margin: "0 0 8px 0", fontSize: 24 }}>{pastAppointments.length}</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Completed</p>
                </div>
                <div style={{ backgroundColor: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
                  <h3 style={{ color: "#2d5016", margin: "0 0 8px 0", fontSize: 24 }}>{appointments.length}</h3>
                  <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Total</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div>
              <h2 style={{ color: "#2d5016", marginBottom: 20 }}>Book Appointment</h2>
              <form onSubmit={handleBookAppointment} style={{ backgroundColor: "white", padding: 24, borderRadius: 12, maxWidth: 600 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: "bold", fontSize: 14 }}>Service</label>
                  <select name="service_id" value={formData.service_id} onChange={handleInputChange} required style={{ width: "100%", padding: 10, border: "2px solid #ddd", borderRadius: 8, fontSize: 14 }}>
                    <option value="">Select service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: "bold", fontSize: 14 }}>Date</label>

                  <input type="date" min={todayDate} name="appointment_date" value={formData.appointment_date} onChange={handleInputChange} required style={{ width: "100%", padding: 10, border: "2px solid #ddd", borderRadius: 8, fontSize: 14 }} />
                </div>

                {availableSlots && availableSlots.filter((s) => s.available).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: "bold", fontSize: 14 }}>Time</label>
                    <select name="appointment_time" value={formData.appointment_time} onChange={handleInputChange} required style={{ width: "100%", padding: 10, border: "2px solid #ddd", borderRadius: 8, fontSize: 14 }}>
                      <option value="">Select time...</option>
                      {availableSlots.filter((s) => s.available).slice(0, 10).map((slot, i) => (
                        <option key={i} value={slot.time}>{slot.time}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <button type="submit" disabled={loading} style={{ padding: "10px 16px", backgroundColor: "#2d5016", color: "white", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "Booking..." : "Book Now"}</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "appointments" && (
            <div>
              <h2 style={{ color: "#2d5016", marginBottom: 20 }}>My Appointments</h2>
              {appointments.length === 0 ? (
                <p style={{ backgroundColor: "white", padding: 20, borderRadius: 12 }}>No appointments</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {appointments.map((apt) => (
                    <div key={apt.id} style={{ backgroundColor: "white", padding: 16, borderRadius: 12, borderLeft: "5px solid #2d5016" }}>
                      <h4 style={{ color: "#2d5016", margin: "0 0 8px 0" }}>{apt.service_name}</h4>
                      <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>📅 {apt.appointment_date}</p>
                      <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>🕐 {apt.appointment_time}</p>
                      <span style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 20, fontSize: 12, backgroundColor: apt.status === "pending" ? "#fff3e0" : "#e8f5e9", color: apt.status === "pending" ? "#e65100" : "#2e7d32" }}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <ProfilePage onNavigate={onNavigate} user={user} upcomingAppointments={upcomingAppointments} pastAppointments={pastAppointments} />
            </div>
          )}
        </main>

        {/* Toast Notification */}
        {toast.open && (
          <div style={{ position: "fixed", left: 24, bottom: 24, zIndex: 2000 }}>
            <div style={{ background: toast.severity === "success" ? "#e8f5e9" : "#ffebee", color: toast.severity === "success" ? "#2e7d32" : "#c62828", borderLeft: `4px solid ${toast.severity === "success" ? "#2e7d32" : "#c62828"}`, padding: "12px 16px", borderRadius: 8, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>{toast.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
