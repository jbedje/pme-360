import React, { useState } from 'react';

// Version minimale d'App.tsx pour debugging
function AppDebug() {
  console.log('AppDebug is rendering');
  
  const [isLoading, setIsLoading] = useState(false);
  
  try {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
          🏢 PME 360 - Version Debug
        </h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2>🔍 Test de rendu de base</h2>
          <p>✅ React fonctionne</p>
          <p>✅ État local fonctionne: {isLoading ? 'Chargement...' : 'Prêt'}</p>
          
          <button 
            onClick={() => setIsLoading(!isLoading)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Arrêter' : 'Démarrer'} le test
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#fef3c7', 
          padding: '15px', 
          borderRadius: '8px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <h3>⚠️ Étape de debugging</h3>
          <p>Si vous voyez ce message, le problème n'est pas dans le rendu de base de React.</p>
          <p>Le problème est probablement dans les hooks, le routing, ou les imports spécifiques d'App.tsx.</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AppDebug render error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Erreur de rendu</h1>
        <pre>{error?.toString()}</pre>
      </div>
    );
  }
}

export default AppDebug;