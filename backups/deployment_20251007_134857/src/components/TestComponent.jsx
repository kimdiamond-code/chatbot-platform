import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: 'green', fontSize: '48px' }}>✅ CHATBOT PLATFORM LOADED!</h1>
      <p style={{ fontSize: '24px', marginBottom: '30px' }}>
        If you see this message, the React app is working correctly.
      </p>
      <div style={{ fontSize: '18px', marginBottom: '20px' }}>
        <strong>Current Time:</strong> {new Date().toLocaleTimeString()}
      </div>
      <button 
        onClick={() => alert('React and JavaScript are working!')}
        style={{ 
          padding: '15px 30px', 
          fontSize: '18px', 
          backgroundColor: '#3B82F6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Click to Test Interactivity
      </button>
      <div style={{ marginTop: '30px', fontSize: '16px', color: '#666' }}>
        <p>✅ React is rendering</p>
        <p>✅ JavaScript is working</p>
        <p>✅ Styles are loading</p>
        <p>✅ All dependencies resolved</p>
      </div>
    </div>
  );
};

export default TestComponent;