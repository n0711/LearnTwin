import { useState, useEffect } from 'react';
import StudentView from './StudentView';
import DashboardView from './DashboardView';
import Logo from './Logo';

function App() {
  const [view, setView] = useState('home');
  const [sessionCode, setSessionCode] = useState('');

  const updateRoute = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#/s/')) {
      setView('student');
      setSessionCode(hash.replace('#/s/', ''));
    } else if (hash.startsWith('#/d/')) {
      setView('dashboard');
      setSessionCode(hash.replace('#/d/', ''));
    } else {
      setView('home');
      setSessionCode('');
    }
  };

  useEffect(() => {
    // Initial route
    updateRoute();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', updateRoute);

    return () => {
      window.removeEventListener('hashchange', updateRoute);
    };
  }, []);

  const navigateToStudent = (code) => {
    if (code) {
      window.location.hash = `/s/${code}`;
    }
  };

  const navigateToDashboard = (code) => {
    if (code) {
      window.location.hash = `/d/${code}`;
    }
  };

  if (view === 'home') {
    return (
      <div className="home-container">
        <div className="home-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
            <Logo size={50} />
            <h1 className="home-title" style={{ margin: 0 }}>LearnTwin</h1>
          </div>
          <p className="home-subtitle">Make understanding visible</p>

          <div>
            <div className="home-section">
              <h2>For Students</h2>
              <p>Join a session with your session code</p>
              <div className="input-group">
                <input
                  id="student-code-input"
                  type="text"
                  placeholder="Enter code (e.g., 1234)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigateToStudent(e.target.value);
                    }
                  }}
                />
                <button
                  className="btn-primary"
                  onClick={() => {
                    const code = document.getElementById('student-code-input').value;
                    navigateToStudent(code);
                  }}
                >
                  Join
                </button>
              </div>
            </div>

            <div className="home-section teacher">
              <h2>For Teachers</h2>
              <p>Access your live dashboard</p>
              <div style={{ marginBottom: '15px' }}>
                <button
                  className="btn-success"
                  onClick={() => {
                    const newCode = Math.floor(1000 + Math.random() * 9000);
                    navigateToDashboard(newCode);
                  }}
                >
                  Create New Session
                </button>
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>or use existing code:</div>
              <div className="input-group">
                <input
                  id="teacher-code-input"
                  type="text"
                  placeholder="Enter session code"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigateToDashboard(e.target.value);
                    }
                  }}
                />
                <button
                  className="btn-success"
                  onClick={() => {
                    const code = document.getElementById('teacher-code-input').value;
                    navigateToDashboard(code);
                  }}
                >
                  Open
                </button>
              </div>
            </div>

            <div className="demo-links">
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Quick Demo:</p>
              <div>
                <a href="#/s/1234">
                  Student Demo
                </a>
                <span style={{ color: '#ddd' }}> • </span>
                <a href="#/d/1234">
                  Dashboard Demo
                </a>
              </div>
            </div>
          </div>

          <p className="home-footer">
            Real-time, privacy-first micro-feedback for any classroom
          </p>
        </div>
      </div>
    );
  }

  if (view === 'student') {
    return <StudentView sessionCode={sessionCode} />;
  }

  if (view === 'dashboard') {
    return <DashboardView sessionCode={sessionCode} />;
  }
}

export default App;
