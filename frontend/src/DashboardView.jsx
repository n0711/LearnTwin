import { useState } from 'react';
import { getClassAnalytics, getSessionComparison } from './mockData';
import { BarChart, ConfidenceGauge, ProgressIndicator, PieChart } from './Charts';
import LiveDashboard from './LiveDashboard';
import Logo from './Logo';

function DashboardView({ sessionCode }) {
  const [mode, setMode] = useState('reflection'); // 'reflection' or 'live'
  const [selectedSession, setSelectedSession] = useState(1);

  // LIVE MODE
  if (mode === 'live') {
    return (
      <div>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100
        }}>
          <button
            onClick={() => setMode('reflection')}
            style={{
              padding: '10px 20px',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Switch to Reflection Mode
          </button>
        </div>
        <LiveDashboard sessionCode={sessionCode} />
      </div>
    );
  }

  // REFLECTION MODE - Analytics View
  const analytics = selectedSession === 'compare'
    ? getSessionComparison()
    : getClassAnalytics(selectedSession);

  if (!analytics) {
    return <div>Loading analytics...</div>;
  }

  // For single session view
  if (selectedSession !== 'compare') {
    const chartData = [
      { label: 'Stuck', value: analytics.signals.stuck, icon: '✋' },
      { label: 'Got it', value: analytics.signals.gotIt, icon: '✅' },
      { label: 'Pause', value: analytics.signals.pause, icon: '⏸️' },
      { label: 'Example', value: analytics.signals.example, icon: '💡' }
    ];

    const chartColors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6'];

    const pieData = [
      { value: analytics.signals.stuck, color: '#ef4444' },
      { value: analytics.signals.gotIt, color: '#22c55e' },
      { value: analytics.signals.pause, color: '#eab308' },
      { value: analytics.signals.example, color: '#3b82f6' }
    ];

    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Logo size={40} />
              <h1 className="dashboard-title" style={{ margin: 0 }}>LearnTwin Analytics</h1>
            </div>
            <p className="dashboard-session">
              Class: <span className="session-code">{sessionCode}</span> • Session {selectedSession}
            </p>
            <button
              onClick={() => setMode('live')}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                background: '#34D399',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Switch to Live Mode
            </button>
          </div>

          {/* Session Toggle */}
          <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => setSelectedSession(1)}
              style={{
                padding: '12px 40px',
                border: selectedSession === 1 ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                background: selectedSession === 1 ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                fontWeight: selectedSession === 1 ? '700' : '500',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Session 1
            </button>
            <button
              onClick={() => setSelectedSession(2)}
              style={{
                padding: '12px 40px',
                border: selectedSession === 2 ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                background: selectedSession === 2 ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                fontWeight: selectedSession === 2 ? '700' : '500',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Session 2
            </button>
            <button
              onClick={() => setSelectedSession('compare')}
              style={{
                padding: '12px 40px',
                border: selectedSession === 'compare' ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                background: selectedSession === 'compare' ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                fontWeight: selectedSession === 'compare' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Compare Sessions
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div className="analytics-card">
              <div className="analytics-icon">👥</div>
              <div className="analytics-value">{analytics.studentCount}</div>
              <div className="analytics-label">Participants</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">📊</div>
              <div className="analytics-value">{analytics.totalSignals}</div>
              <div className="analytics-label">Total Signals</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">⚠️</div>
              <div className="analytics-value">{analytics.confusionRate}%</div>
              <div className="analytics-label">Confusion Rate</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">💪</div>
              <div className="analytics-value">{analytics.avgConfidence}/5</div>
              <div className="analytics-label">Avg Confidence</div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {/* Bar Chart */}
            <div className="dashboard-panel">
              <h3 className="panel-title">Signal Distribution</h3>
              <div style={{ padding: '20px 0' }}>
                <BarChart data={chartData} colors={chartColors} height={250} />
              </div>
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div>✋ Stuck: <strong>{analytics.signalPercentages.stuck}%</strong></div>
                <div>✅ Got it: <strong>{analytics.signalPercentages.gotIt}%</strong></div>
                <div>⏸️ Pause: <strong>{analytics.signalPercentages.pause}%</strong></div>
                <div>💡 Example: <strong>{analytics.signalPercentages.example}%</strong></div>
              </div>
            </div>

            {/* Confidence Gauge & Pie Chart */}
            <div className="dashboard-panel">
              <h3 className="panel-title">Class Confidence Level</h3>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <ConfidenceGauge
                  value={parseFloat(analytics.avgConfidence)}
                  label="Average Confidence"
                />
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '10px' }}>
                  Class is performing at <strong style={{ color: 'white' }}>
                    {analytics.avgConfidence >= 4 ? 'High' : analytics.avgConfidence >= 3 ? 'Medium' : 'Low'}
                  </strong> confidence level
                </div>
              </div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="dashboard-panel">
            <h3 className="panel-title">📊 Class Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div className="insight-card">
                <div className="insight-icon">
                  {analytics.confusionRate > 30 ? '🔴' : analytics.confusionRate > 15 ? '🟡' : '🟢'}
                </div>
                <div className="insight-text">
                  {analytics.confusionRate > 30
                    ? 'High confusion detected - consider slowing pace'
                    : analytics.confusionRate > 15
                    ? 'Moderate confusion - some students need help'
                    : 'Low confusion - class is following well'}
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">
                  {analytics.signals.example > 10 ? '💡' : '✨'}
                </div>
                <div className="insight-text">
                  {analytics.signals.example > 10
                    ? 'Many students need examples - provide demonstrations'
                    : 'Example requests are minimal - concepts are clear'}
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon">
                  {analytics.signals.pause > 8 ? '⏸️' : '⚡'}
                </div>
                <div className="insight-text">
                  {analytics.signals.pause > 8
                    ? 'Students need breaks - consider pacing adjustments'
                    : 'Pacing is good - students are engaged'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COMPARE MODE
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <Logo size={40} />
            <h1 className="dashboard-title" style={{ margin: 0 }}>Session Comparison</h1>
          </div>
          <p className="dashboard-session">
            Class: <span className="session-code">{sessionCode}</span> • Sessions 1 vs 2
          </p>
          <button
            onClick={() => setMode('live')}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#34D399',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Switch to Live Mode
          </button>
        </div>

        {/* Session Toggle */}
        <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={() => setSelectedSession(1)}
            style={{
              padding: '12px 40px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'white',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Session 1
          </button>
          <button
            onClick={() => setSelectedSession(2)}
            style={{
              padding: '12px 40px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'white',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Session 2
          </button>
          <button
            onClick={() => setSelectedSession('compare')}
            style={{
              padding: '12px 40px',
              border: '3px solid #fff',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Compare Sessions
          </button>
        </div>

        {/* Progress Indicators */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <ProgressIndicator
            value={parseFloat(analytics.session2.avgConfidence)}
            previousValue={parseFloat(analytics.session1.avgConfidence)}
            label="Average Confidence"
          />
          <ProgressIndicator
            value={parseFloat(analytics.session2.confusionRate)}
            previousValue={parseFloat(analytics.session1.confusionRate)}
            label="Confusion Rate (%)"
          />
          <ProgressIndicator
            value={analytics.session2.totalSignals}
            previousValue={analytics.session1.totalSignals}
            label="Total Engagement"
          />
        </div>

        {/* Side by Side Comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Session 1 */}
          <div className="dashboard-panel">
            <h3 className="panel-title">📅 Session 1</h3>
            <div style={{ marginBottom: '20px' }}>
              <ConfidenceGauge
                value={parseFloat(analytics.session1.avgConfidence)}
                label="Confidence Level"
              />
            </div>
            <ul className="stats-list">
              <li>
                <span>✋ Stuck:</span>
                <span className="stat-value">{analytics.session1.signals.stuck}</span>
              </li>
              <li>
                <span>✅ Got it:</span>
                <span className="stat-value">{analytics.session1.signals.gotIt}</span>
              </li>
              <li>
                <span>⏸️ Pause:</span>
                <span className="stat-value">{analytics.session1.signals.pause}</span>
              </li>
              <li>
                <span>💡 Example:</span>
                <span className="stat-value">{analytics.session1.signals.example}</span>
              </li>
            </ul>
          </div>

          {/* Session 2 */}
          <div className="dashboard-panel">
            <h3 className="panel-title">📅 Session 2</h3>
            <div style={{ marginBottom: '20px' }}>
              <ConfidenceGauge
                value={parseFloat(analytics.session2.avgConfidence)}
                label="Confidence Level"
              />
            </div>
            <ul className="stats-list">
              <li>
                <span>✋ Stuck:</span>
                <span className="stat-value">{analytics.session2.signals.stuck}</span>
              </li>
              <li>
                <span>✅ Got it:</span>
                <span className="stat-value">{analytics.session2.signals.gotIt}</span>
              </li>
              <li>
                <span>⏸️ Pause:</span>
                <span className="stat-value">{analytics.session2.signals.pause}</span>
              </li>
              <li>
                <span>💡 Example:</span>
                <span className="stat-value">{analytics.session2.signals.example}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Overall Assessment */}
        <div className="dashboard-panel">
          <h3 className="panel-title">🎯 Overall Assessment</h3>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <div style={{
              padding: '20px',
              background: analytics.changes.confidence > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              marginBottom: '15px'
            }}>
              <strong>Confidence Trend:</strong> {analytics.changes.confidence > 0 ? '📈' : '📉'} {' '}
              {analytics.changes.confidence > 0
                ? `Class confidence improved by ${analytics.changes.confidence} points`
                : analytics.changes.confidence < 0
                ? `Class confidence decreased by ${Math.abs(analytics.changes.confidence)} points`
                : 'Class confidence remained stable'}
            </div>
            <div style={{
              padding: '20px',
              background: 'rgba(79, 70, 229, 0.2)',
              borderRadius: '10px'
            }}>
              <strong>Key Changes:</strong>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li>Stuck signals: {analytics.changes.stuck > 0 ? `+${analytics.changes.stuck}` : analytics.changes.stuck}</li>
                <li>Got it signals: {analytics.changes.gotIt > 0 ? `+${analytics.changes.gotIt}` : analytics.changes.gotIt}</li>
                <li>Confusion rate: {analytics.changes.confusionRate > 0 ? `+${analytics.changes.confusionRate}` : analytics.changes.confusionRate}%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
