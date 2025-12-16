import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedPage = localStorage.getItem('currentPage');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Keep current page if user is logged in
        setCurrentPage(savedPage || 'home');
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const navigate = (page) => {    
    if (page === 'logout') {
      handleLogout();
      return;
    }

    setCurrentPage(page);
    if (user && token) {
      localStorage.setItem('currentPage', page);
    }
  };

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('currentPage', 'home');
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        fontSize: '18px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5ede3'
      }}>
        Loading...
      </div>
    );
  }

  if (token && user) {
    if (currentPage === 'home') {
      return <HomePage onNavigate={navigate} user={user} />;
    }

    return (
      <DashboardPage
        user={user}
        token={token}
        onLogout={handleLogout}
        onNavigate={navigate}
        selectedPage={currentPage}
      />
    );
  }

  if (currentPage === 'home') {
    return <HomePage onNavigate={navigate} user={null} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onNavigate={navigate} onSuccess={handleLogin} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onNavigate={navigate} onSuccess={handleLogin} />;
  }

  // Default to home
  return <HomePage onNavigate={navigate} user={null} />;
}