import { useState, useEffect } from 'react';
import Logo from './Logo';

function LiveDashboard({ sessionCode }) {
  const [signals, setSignals] = useState({
    stuck: 0,
    gotIt: 0,
    pause: 0,
    example: 0,
  });
  const [avgConfidence, setAvgConfidence] = useState(3.5);
  const [showTip, setShowTip] = useState(null);
  const [sessionData, setSessionData] = useState([]);

  // Mock live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const updates = { ...signals };
      const random = Math.random();

      if (random > 0.7) {
        const signalType = ['stuck', 'gotIt', 'pause', 'example'][Math.floor(Math.random() * 4)];
        updates[signalType]++;
        setSignals(updates);

        const timestamp = new Date().toLocaleTimeString();
        setSessionData(prev => [...prev, { time: timestamp, signal: signalType, confidence: avgConfidence }]);

        if (signalType === 'stuck' && updates.stuck % 3 === 0) {
          setShowTip({ type: 'warning', message: '⚠️ Confusion spike detected! Consider slowing down or reviewing.' });
        } else if (signalType === 'example' && updates.example % 2 === 0) {
          setShowTip({ type: 'info', message: '💡 Multiple students need an example. Time to demonstrate!' });
        } else if (signalType === 'pause' && updates.pause % 2 === 0) {
          setShowTip({ type: 'caution', message: '⏸️ Students need a break. Consider a short pause.' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [signals, avgConfidence]);

  const exportCSV = () => {
    const csv = [
      ['Timestamp', 'Signal', 'Confidence'],
      ...sessionData.map(d => [d.time, d.signal, d.confidence])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live_session_${sessionCode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <Logo size={40} />
            <h1 className="dashboard-title" style={{ margin: 0 }}>LearnTwin Live Dashboard</h1>
          </div>
          <p className="dashboard-session">
            Live Session: <span className="session-code">{sessionCode}</span>
            <span className="session-live">
              <span className="live-dot"></span>
              Live
            </span>
          </p>
        </div>

        {showTip && (
          <div className={`tip-alert ${showTip.type}`}>
            <span>{showTip.message}</span>
            <button onClick={() => setShowTip(null)}>✕</button>
          </div>
        )}

        <div className="signal-cards">
          <div className="signal-card stuck">
            <div className="card-emoji">✋</div>
            <div className="card-count">{signals.stuck}</div>
            <div className="card-label">Stuck</div>
          </div>

          <div className="signal-card gotit">
            <div className="card-emoji">✅</div>
            <div className="card-count">{signals.gotIt}</div>
            <div className="card-label">Got it</div>
          </div>

          <div className="signal-card pause">
            <div className="card-emoji">⏸️</div>
            <div className="card-count">{signals.pause}</div>
            <div className="card-label">Pause</div>
          </div>

          <div className="signal-card example">
            <div className="card-emoji">💡</div>
            <div className="card-count">{signals.example}</div>
            <div className="card-label">Example?</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <h3 className="panel-title">Session Stats</h3>
            <ul className="stats-list">
              <li>
                <span>Total Signals:</span>
                <span className="stat-value">{signals.stuck + signals.gotIt + signals.pause + signals.example}</span>
              </li>
              <li>
                <span>Avg Confidence:</span>
                <span className="stat-value">{avgConfidence.toFixed(1)}/5</span>
              </li>
              <li>
                <span>Active Students:</span>
                <span className="stat-value">~{Math.max(3, Math.floor((signals.stuck + signals.gotIt) / 3))}</span>
              </li>
              <li>
                <span>Confusion Rate:</span>
                <span className="stat-value danger">
                  {signals.stuck > 0 ? ((signals.stuck / (signals.stuck + signals.gotIt)) * 100).toFixed(0) : 0}%
                </span>
              </li>
            </ul>
          </div>

          <div className="dashboard-panel">
            <h3 className="panel-title">Actions</h3>
            <div className="action-buttons">
              <button
                onClick={exportCSV}
                disabled={sessionData.length === 0}
                className="btn-export"
              >
                📥 Export Session CSV ({sessionData.length} events)
              </button>
              <button
                onClick={() => setSignals({ stuck: 0, gotIt: 0, pause: 0, example: 0 })}
                className="btn-reset"
              >
                🔄 Reset Counters
              </button>
            </div>

            <div className="student-url-box">
              <p><strong>Student URL:</strong></p>
              <code>learntwin.app/s/{sessionCode}</code>
              <p style={{ fontSize: '11px', marginTop: '8px', opacity: 0.8 }}>
                Students should switch to Live Mode
              </p>
            </div>
          </div>
        </div>

        <div className="activity-panel">
          <h3 className="panel-title">Recent Activity</h3>
          <div className="activity-list">
            {sessionData.slice(-10).reverse().map((event, idx) => (
              <div key={idx} className="activity-item">
                <span className="activity-time">{event.time}</span>
                <span className="activity-signal">{event.signal}</span>
                <span className="activity-conf">Conf: {event.confidence.toFixed(1)}</span>
              </div>
            ))}
            {sessionData.length === 0 && (
              <p className="activity-empty">No activity yet. Waiting for student signals...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveDashboard;
