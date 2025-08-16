import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Test étape 1: Router + imports de base
function AppDebug() {
  console.log('AppDebug is rendering with Router');
  
  const [step, setStep] = useState(1);
  
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
            🏢 PME 360 - Debug Étape {step}
          </h1>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h2>🔍 Test Router + Navigation</h2>
            <p>✅ React fonctionne</p>
            <p>✅ Router importé sans erreur</p>
            <p>✅ État local fonctionne</p>
            
            <div style={{ margin: '20px 0' }}>
              <Link to="/test" style={{ marginRight: '10px', color: '#3b82f6' }}>
                Test Link
              </Link>
              <Link to="/" style={{ color: '#3b82f6' }}>
                Home
              </Link>
            </div>
            
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

          <Routes>
            <Route path="/" element={
              <div style={{ 
                backgroundColor: '#ecfdf5', 
                padding: '15px', 
                borderRadius: '8px',
                borderLeft: '4px solid #10b981'
              }}>
                <h3>✅ Router fonctionne</h3>
                <p>Si vous voyez ce message, le problème n'est PAS dans le Router.</p>
                <p>Le problème est probablement dans les hooks ou composants spécifiques d'App.tsx.</p>
              </div>
            } />
            <Route path="/test" element={
              <div style={{ 
                backgroundColor: '#eff6ff', 
                padding: '15px', 
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <h3>🎯 Page de test</h3>
                <p>Navigation fonctionnelle !</p>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    );
  } catch (error) {
    console.error('AppDebug Router error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Erreur Router</h1>
        <pre>{error?.toString()}</pre>
      </div>
    );
  }
}

export default AppDebug;