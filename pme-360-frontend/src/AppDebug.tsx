import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';

// Test étape 3: App simplifié sans WebSocket ni notifications complexes
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3000/api';

// Simple auth hook (sans les complexités)
function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('auth_token', data.data.token);
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
}

// Navigation simple
const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: '🏠' },
  { name: 'Utilisateurs', href: '/users', icon: '👥' },
  { name: 'Messages', href: '/messages', icon: '💬' },
];

// Layout simplifié SANS WebSocket ni notifications complexes
function SimpleLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // PAS DE WebSocket useEffect ici - c'est peut-être le problème !
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '240px' : '60px',
        backgroundColor: '#1e40af',
        color: 'white',
        transition: 'width 0.2s',
        padding: '20px 10px'
      }}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: '20px',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
        
        {sidebarOpen && (
          <div>
            <h2 style={{ fontSize: '16px', margin: '0 0 20px 0' }}>PME 360</h2>
            {navigation.map((item) => (
              <div key={item.name} style={{ margin: '10px 0' }}>
                <a 
                  href={item.href}
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {item.icon} {item.name}
                </a>
              </div>
            ))}
            
            <button 
              onClick={handleLogout}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              🚪 Déconnexion
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>✅ Layout simplifié fonctionne !</h1>
        <p>Utilisateur: {user?.email || 'Non connecté'}</p>
        <Outlet />
      </div>
    </div>
  );
}

// Pages simples
function Dashboard() {
  return (
    <div>
      <h2>📊 Tableau de bord</h2>
      <p>Page principale de l'application</p>
    </div>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      alert('Erreur: ' + result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>🔐 Connexion PME 360</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppDebug() {
  console.log('AppDebug rendering simplified app');
  
  try {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <SimpleLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<div><h2>👥 Utilisateurs</h2></div>} />
            <Route path="messages" element={<div><h2>💬 Messages</h2></div>} />
          </Route>
        </Routes>
      </Router>
    );
  } catch (error) {
    console.error('AppDebug App error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Erreur App</h1>
        <pre>{error?.toString()}</pre>
      </div>
    );
  }
}

export default AppDebug;