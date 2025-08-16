import React from 'react';

function SimpleApp() {
  console.log('SimpleApp is rendering');
  
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        🚀 PME 360 - Application Simple
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ L'application fonctionne !</h2>
        
        <div style={{ marginTop: '20px' }}>
          <h3>🔧 Variables d'environnement :</h3>
          <ul>
            <li><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Non définie'}</li>
            <li><strong>WS URL:</strong> {import.meta.env.VITE_WS_URL || 'Non définie'}</li>
            <li><strong>App Name:</strong> {import.meta.env.VITE_APP_NAME || 'Non définie'}</li>
            <li><strong>Mode:</strong> {import.meta.env.MODE}</li>
            <li><strong>Production:</strong> {import.meta.env.PROD ? 'Oui' : 'Non'}</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>🎯 Prochaines étapes :</h3>
          <ol>
            <li>✅ React fonctionne</li>
            <li>✅ Variables d'environnement configurées</li>
            <li>🔄 Maintenant on peut déboguer l'App principale</li>
          </ol>
        </div>

        <button 
          onClick={() => {
            console.log('Testing backend connection...');
            fetch(`${import.meta.env.VITE_API_URL}/health`)
              .then(response => response.json())
              .then(data => {
                console.log('Backend response:', data);
                alert('✅ Backend connecté: ' + JSON.stringify(data));
              })
              .catch(error => {
                console.error('Backend error:', error);
                alert('❌ Erreur backend: ' + error.message);
              });
          }}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🧪 Tester la connexion backend
        </button>
      </div>
    </div>
  );
}

export default SimpleApp;