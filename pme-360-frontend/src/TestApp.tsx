import React from 'react';

function TestApp() {
  console.log('TestApp is rendering');
  console.log('Environment variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_WS_URL: import.meta.env.VITE_WS_URL,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎯 PME 360 Test Page</h1>
      <p>✅ React is working!</p>
      <p>📡 API URL: {import.meta.env.VITE_API_URL || 'Not set'}</p>
      <p>🔗 WebSocket URL: {import.meta.env.VITE_WS_URL || 'Not set'}</p>
      <p>📱 App Name: {import.meta.env.VITE_APP_NAME || 'Not set'}</p>
      <p>🌍 Mode: {import.meta.env.MODE}</p>
      <p>🚀 Production: {import.meta.env.PROD ? 'Yes' : 'No'}</p>
      
      <button 
        onClick={() => {
          fetch('https://pme-360-backend-deploy-production.up.railway.app/health')
            .then(r => r.json())
            .then(data => {
              alert('Backend connected: ' + JSON.stringify(data));
            })
            .catch(err => {
              alert('Backend error: ' + err.message);
            });
        }}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🧪 Test Backend Connection
      </button>
    </div>
  );
}

export default TestApp;