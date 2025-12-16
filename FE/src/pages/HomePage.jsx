import React from 'react';
import '../styles/HomePage.css';

function HomePage({ onNavigate, user = null }) {
  const features = [
    { icon: '👨‍⚕️', title: 'Expert Doctors', description: 'Professional and experienced dental specialists' },
    { icon: '🔬', title: 'Modern Technology', description: 'Latest equipment and advanced dental techniques' },
    { icon: '😊', title: 'Comprehensive Care', description: 'Full range of dental services and treatments' },
  ];

  const services = [
    'General Checkup', 'Teeth Cleaning', 'Cavity Filling', 'Tooth Extraction', 
    'Braces Installation', 'Teeth Whitening'
  ];

  const tabs = [
    { id: "home", name: "Home", icon: "🏠" },
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "booking", name: "Book", icon: "📅" },
    { id: "appointments", name: "My Appts", icon: "🗓️" },
    { id: "profile", name: "Profile", icon: "👤" },
  ];

  const handleTabClick = (tabId) => {
    onNavigate(tabId);
  };

  const handleLogout = () => {
    onNavigate('logout');
  };

  if (user) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5ede3", display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Bar */}
        <nav style={{ 
          backgroundColor: "#2d5016", 
          color: "white", 
          padding: "1rem", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>🦷 Dental Clinic</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>{user?.name}</span>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: "0.5rem 1rem", 
                backgroundColor: "#c1463b", 
                border: "none", 
                color: "white", 
                borderRadius: 5, 
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Logout
            
            </button>
          </div>
        </nav>

        {/* Main Layout */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* Sidebar */}
          <aside style={{ 
            width: "180px",
            backgroundColor: "white", 
            borderRight: "1px solid #e0e0e0", 
            paddingTop: 12,
            overflowY: "auto",
            zIndex: 50,
            maxHeight: "calc(100vh - 80px)"
          }}>
            {tabs.map((t) => (
              <button 
                key={t.id} 
                onClick={() => handleTabClick(t.id)} 
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  textAlign: "left", 
                  border: "none", 
                  backgroundColor: "white", 
                  color: "#333", 
                  cursor: "pointer", 
                  fontWeight: 500, 
                  fontSize: 13,
                  transition: "all 0.3s ease",
                  borderLeft: "4px solid transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5ede3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <span style={{ marginRight: 8 }}>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </aside>

          {/* Content Area */}
          <main style={{ 
            flex: 1,
            overflow: "auto",
            maxHeight: "calc(100vh - 80px)",
            backgroundColor: "#f5ede3"
          }}>
            {/* Hero Section */}
            <section className="hero-section">
              <div className="container">
                <div className="hero-content">
                  <div className="hero-text">
                    <h1 className="hero-title">Welcome back, {user?.name}!</h1>
                    <p className="hero-subtitle">Your smile is our priority</p>
                    <p className="hero-description">
                      Professional dental care with the latest technology and experienced doctors. 
                      Book your appointment today and get the best treatment in Jerusalem.
                    </p>
                    
                    <div className="hero-buttons">
                      <button 
                        onClick={() => handleTabClick('booking')} 
                        className="btn btn-primary"
                        style={{ cursor: 'pointer' }}
                      >
                        Book Appointment
                      </button>
                      <button 
                        onClick={() => handleTabClick('appointments')} 
                        className="btn btn-secondary"
                        style={{ cursor: 'pointer' }}
                      >
                        My Appointments
                      </button>
                    </div>
                  </div>
                  
                  <div className="hero-image">
                    <div className="hero-icon">🦷</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
              <div className="container">
                <h2 className="section-title">Why Choose Us</h2>
                <div className="features-grid">
                  {features.map((feature, index) => (
                    <div key={index} className="feature-card">
                      <div className="feature-icon">{feature.icon}</div>
                      <h3 className="feature-title">{feature.title}</h3>
                      <p className="feature-description">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section className="services-section">
              <div className="container">
                <h2 className="section-title">Our Services</h2>
                <div className="services-grid">
                  {services.map((service, index) => (
                    <div key={index} className="service-card">
                      <h4>{service}</h4>
                      <p>Professional and affordable treatment</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* About Section */}
            <section className="about-section">
              <div className="container">
                <div className="about-content">
                  <div className="about-text">
                    <h2>About Our Clinic</h2>
                    <p>
                      We are a modern dental clinic located in Jerusalem, dedicated to providing 
                      the highest quality dental care for you and your family. Our experienced 
                      team of dentists uses the latest technology to ensure your comfort and satisfaction.
                    </p>
                    <p>
                      From routine cleanings to complex procedures, we offer comprehensive dental 
                      services in a friendly and welcoming environment. Your oral health is our 
                      top priority, and we're committed to helping you achieve a healthy, beautiful smile.
                    </p>
                  </div>
                  
                  <div className="about-stats">
                    <div className="stat">
                      <h3>500+</h3>
                      <p>Happy Patients</p>
                    </div>
                    <div className="stat">
                      <h3>15+</h3>
                      <p>Years Experience</p>
                    </div>
                    <div className="stat">
                      <h3>24/7</h3>
                      <p>Emergency Care</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
              <div className="container">
                <h2>Ready to Schedule Your Appointment?</h2>
                <p>Don't wait for dental problems to get worse. Book your appointment today!</p>
                <button 
                  onClick={() => handleTabClick('booking')} 
                  className="btn btn-large"
                  style={{ cursor: 'pointer' }}
                >
                  Book Now
                </button>
              </div>
            </section>

            {/* Footer */}
            <footer className="footer">
              <div className="container">
                <div className="footer-content">
                  <div className="footer-section">
                    <h4>Dental Clinic</h4>
                    <p>Providing quality dental care in Jerusalem</p>
                    <p>📍 Al-Masoudieh Street, Jerusalem</p>
                    <p>📞 +972 2 123 4567</p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>Quick Links</h4>
                    <button 
                      onClick={() => handleTabClick('home')} 
                      className="footer-link"
                      style={{ cursor: 'pointer' }}
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => handleTabClick('dashboard')} 
                      className="footer-link"
                      style={{ cursor: 'pointer' }}
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => handleTabClick('booking')} 
                      className="footer-link"
                      style={{ cursor: 'pointer' }}
                    >
                      Book
                    </button>
                    <button 
                      onClick={() => handleTabClick('appointments')} 
                      className="footer-link"
                      style={{ cursor: 'pointer' }}
                    >
                      My Appointments
                    </button>
                  </div>
                  
                  <div className="footer-section">
                    <h4>Services</h4>
                    <p>General Dentistry</p>
                    <p>Cosmetic Dentistry</p>
                    <p>Orthodontics</p>
                    <p>Oral Surgery</p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>Hours</h4>
                    <p>Sunday - Thursday: 8:00 AM - 6:00 PM</p>
                    <p>Friday: 8:00 AM - 2:00 PM</p>
                    <p>Saturday: Closed</p>
                    <p>Emergency: 24/7</p>
                  </div>
                </div>
                
                <div className="footer-bottom">
                  <p>&copy; 2024 Dental Clinic Jerusalem. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Bar */}
      <nav style={{ 
        backgroundColor: "#2d5016", 
        color: "white", 
        padding: "1rem", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center"
      }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>🦷 Dental Clinic</h1>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Welcome to Dental Clinic</h1>
              <p className="hero-subtitle">Your smile is our priority</p>
              <p className="hero-description">
                Professional dental care with the latest technology and experienced doctors. 
                Book your appointment today and get the best treatment in Jerusalem.
              </p>
              
              <div className="hero-buttons">
                <button 
                  onClick={() => onNavigate('register')} 
                  className="btn btn-primary"
                  style={{ cursor: 'pointer' }}
                >
                  Get Started
                </button>
                <button 
                  onClick={() => onNavigate('login')} 
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </div>
            </div>
            
            <div className="hero-image">
              <div className="hero-icon">🦷</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <h4>{service}</h4>
                <p>Professional and affordable treatment</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Our Clinic</h2>
              <p>
                We are a modern dental clinic located in Jerusalem, dedicated to providing 
                the highest quality dental care for you and your family. Our experienced 
                team of dentists uses the latest technology to ensure your comfort and satisfaction.
              </p>
              <p>
                From routine cleanings to complex procedures, we offer comprehensive dental 
                services in a friendly and welcoming environment. Your oral health is our 
                top priority, and we're committed to helping you achieve a healthy, beautiful smile.
              </p>
            </div>
            
            <div className="about-stats">
              <div className="stat">
                <h3>500+</h3>
                <p>Happy Patients</p>
              </div>
              <div className="stat">
                <h3>15+</h3>
                <p>Years Experience</p>
              </div>
              <div className="stat">
                <h3>24/7</h3>
                <p>Emergency Care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Schedule Your Appointment?</h2>
          <p>Don't wait for dental problems to get worse. Book your appointment today!</p>
          <button 
            onClick={() => onNavigate('register')} 
            className="btn btn-large"
            style={{ cursor: 'pointer' }}
          >
            Book Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Dental Clinic</h4>
              <p>Providing quality dental care in Jerusalem</p>
              <p>📍 Jerusalem</p>
              <p>📞 +972 2 123 4567</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <button 
                onClick={() => onNavigate('home')} 
                className="footer-link"
                style={{ cursor: 'pointer' }}
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate('register')} 
                className="footer-link"
                style={{ cursor: 'pointer' }}
              >
                Sign Up
              </button>
              <button 
                onClick={() => onNavigate('login')} 
                className="footer-link"
                style={{ cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
            
            <div className="footer-section">
              <h4>Services</h4>
              <p>General Dentistry</p>
              <p>Cosmetic Dentistry</p>
              <p>Orthodontics</p>
              <p>Oral Surgery</p>
            </div>
            
            <div className="footer-section">
              <h4>Hours</h4>
              <p>Sunday - Thursday: 8:00 AM - 6:00 PM</p>
              <p>Friday: Closed</p>
              <p>Saturday: 8:00 AM - 2:00 PM</p>
              <p>Emergency: 24/7</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 Dental Clinic Jerusalem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;