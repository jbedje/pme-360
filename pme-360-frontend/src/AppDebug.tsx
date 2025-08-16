import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Test étape 2: Hooks useAuth et API calls
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3000/api';

// Simple auth hook (copié d'App.tsx)
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

function AppDebug() {
  console.log('AppDebug rendering with hooks');
  
  const [step, setStep] = useState(2);
  const [testResults, setTestResults] = useState<any[]>([]);
  
  // Test du hook useAuth
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Test d'useEffect
  useEffect(() => {
    console.log('useEffect running');
    setTestResults(prev => [...prev, '✅ useEffect fonctionne']);
  }, []);

  // Test API call
  const testAPI = async () => {
    try {
      const response = await fetch(`${API_BASE}/test`);
      const data = await response.json();
      setTestResults(prev => [...prev, `✅ API test: ${data.message}`]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ API error: ${error}`]);
    }
  };
  
  try {
    return (
      <Router>
        <div style={{ 
          padding: '20px', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8fafc',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
            🏢 PME 360 - Debug Étape {step}: Hooks
          </h1>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h2>🔍 Test Hooks useAuth + useEffect</h2>
            <p>✅ React fonctionne</p>
            <p>✅ Router fonctionne</p>
            <p>✅ useAuth hook: {isAuthenticated ? 'Connecté' : 'Non connecté'}</p>
            <p>✅ User state: {user ? `${user.email || 'email non défini'}` : 'null'}</p>
            <p>✅ API_BASE: {API_BASE}</p>
            
            <div style={{ margin: '20px 0' }}>
              <h3>Résultats des tests:</h3>
              {testResults.map((result, index) => (
                <div key={index} style={{ margin: '5px 0' }}>{result}</div>
              ))}
            </div>
            
            <div style={{ margin: '20px 0' }}>
              <button 
                onClick={testAPI}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                🧪 Tester API
              </button>
              
              <button 
                onClick={() => setStep(step + 1)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Étape suivante: {step + 1}
              </button>
            </div>
          </div>

          <Routes>
            <Route path="/" element={
              <div style={{ 
                backgroundColor: '#ecfdf5', 
                padding: '15px', 
                borderRadius: '8px',
                borderLeft: '4px solid #10b981'
              }}>
                <h3>✅ Hooks fonctionnent</h3>
                <p>Si vous voyez ce message, les hooks useAuth et useEffect fonctionnent.</p>
                <p>Le problème est probablement dans les composants complexes ou les états spécifiques.</p>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    );
  } catch (error) {
    console.error('AppDebug Hooks error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Erreur Hooks</h1>
        <pre>{error?.toString()}</pre>
      </div>
    );
  }
}

export default AppDebug;