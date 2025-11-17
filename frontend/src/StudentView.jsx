import { useState } from 'react';
import Logo from './Logo';
import { sendMetrics } from './api';

function StudentView({ sessionCode }) {
  const [mode, setMode] = useState('reflection'); // 'reflection' or 'live'
  const [name, setName] = useState('');
  const [sessionNum, setSessionNum] = useState(1);
  const [signals, setSignals] = useState({
    stuck: 0,
    gotIt: 0,
    pause: 0,
    example: 0
  });
  const [confidence, setConfidence] = useState(3);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSignalClick = (type) => {
    setSignals(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const handleLiveSignal = async (signal, emoji) => {
    // Map signal to backend format (binary flags)
    const signalMap = {
      'Stuck': { stuck: 1, got_it: 0, pause: 0, example: 0 },
      'Got it': { stuck: 0, got_it: 1, pause: 0, example: 0 },
      'Pause': { stuck: 0, got_it: 0, pause: 1, example: 0 },
      'Example?': { stuck: 0, got_it: 0, pause: 0, example: 1 }
    };

    const metrics = [{
      class_id: sessionCode,
      student_id: Math.floor(Math.random() * 1000000), // Random student ID for anonymity
      ...signalMap[signal],
      confidence: confidence * 2, // Scale 1-5 to 1-10
      timestamp: new Date().toISOString()
    }];

    try {
      await sendMetrics(metrics);
      console.log(`Live signal sent: ${signal}, Confidence: ${confidence}`);
      setFeedback(`${emoji} ${signal} sent!`);
    } catch (error) {
      setFeedback(`❌ Failed to send signal`);
      console.error('Error sending live signal:', error);
    }

    setTimeout(() => setFeedback(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build array of metric records - one for each signal count
    const metrics = [];
    const studentId = Math.floor(Math.random() * 1000000); // Same student ID for all records in this submission

    // Add records for each "stuck" signal
    for (let i = 0; i < signals.stuck; i++) {
      metrics.push({
        class_id: sessionCode,
        student_id: studentId,
        stuck: 1,
        got_it: 0,
        pause: 0,
        example: 0,
        confidence: confidence * 2, // Scale 1-5 to 1-10
        timestamp: new Date().toISOString()
      });
    }

    // Add records for each "got it" signal
    for (let i = 0; i < signals.gotIt; i++) {
      metrics.push({
        class_id: sessionCode,
        student_id: studentId,
        stuck: 0,
        got_it: 1,
        pause: 0,
        example: 0,
        confidence: confidence * 2,
        timestamp: new Date().toISOString()
      });
    }

    // Add records for each "pause" signal
    for (let i = 0; i < signals.pause; i++) {
      metrics.push({
        class_id: sessionCode,
        student_id: studentId,
        stuck: 0,
        got_it: 0,
        pause: 1,
        example: 0,
        confidence: confidence * 2,
        timestamp: new Date().toISOString()
      });
    }

    // Add records for each "example" signal
    for (let i = 0; i < signals.example; i++) {
      metrics.push({
        class_id: sessionCode,
        student_id: studentId,
        stuck: 0,
        got_it: 0,
        pause: 0,
        example: 1,
        confidence: confidence * 2,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const result = await sendMetrics(metrics);
      console.log('Submitted:', { name, sessionNum, signals, confidence });
      console.log('Backend response:', result);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting reflection:', error);
      alert('Failed to submit reflection. Please try again.');
    }
  };

  const totalSignals = signals.stuck + signals.gotIt + signals.pause + signals.example;

  // LIVE MODE VIEW
  if (mode === 'live') {
    return (
      <div className="student-container">
        <div className="student-card">
          <div className="student-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '5px' }}>
              <Logo size={35} />
              <h1 className="student-title" style={{ margin: 0 }}>LearnTwin</h1>
            </div>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#34D399', marginBottom: '5px' }}>
              🔴 LIVE Session
            </p>
            <p style={{ fontSize: '14px', marginTop: '5px' }}>
              Session: <span className="session-code">{sessionCode}</span>
            </p>
            <button
              onClick={() => setMode('reflection')}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                background: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Switch to Reflection Mode
            </button>
          </div>

          {feedback && (
            <div className="feedback-message">
              {feedback}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              Tap buttons in real-time during class
            </p>
            <div className="button-grid">
              <button
                onClick={() => handleLiveSignal('Stuck', '✋')}
                className="signal-btn stuck"
              >
                <span className="btn-emoji">✋</span>
                <span className="btn-text">Stuck</span>
              </button>

              <button
                onClick={() => handleLiveSignal('Got it', '✅')}
                className="signal-btn gotit"
              >
                <span className="btn-emoji">✅</span>
                <span className="btn-text">Got it</span>
              </button>

              <button
                onClick={() => handleLiveSignal('Pause', '⏸️')}
                className="signal-btn pause"
              >
                <span className="btn-emoji">⏸️</span>
                <span className="btn-text">Pause</span>
              </button>

              <button
                onClick={() => handleLiveSignal('Example?', '💡')}
                className="signal-btn example"
              >
                <span className="btn-emoji">💡</span>
                <span className="btn-text">Example?</span>
              </button>
            </div>
          </div>

          <div className="confidence-section">
            <label className="confidence-label">
              Confidence: <span className="confidence-value">{confidence}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="confidence-slider"
            />
            <div className="slider-labels">
              <span>1 (Low)</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5 (High)</span>
            </div>
          </div>

          <p className="student-footer">
            🔴 Live mode • Real-time feedback • Anonymous
          </p>
        </div>
      </div>
    );
  }

  // REFLECTION MODE VIEW (original)
  return (
    <div className="student-container">
      <div className="student-card">
        <div className="student-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '5px' }}>
            <Logo size={35} />
            <h1 className="student-title" style={{ margin: 0 }}>LearnTwin</h1>
          </div>
          <p>Post-Class Reflection</p>
          <p style={{ fontSize: '14px', marginTop: '5px' }}>
            Session: <span className="session-code">{sessionCode}</span>
          </p>
          <button
            onClick={() => setMode('live')}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#34D399',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Switch to Live Mode
          </button>
        </div>

        {submitted && (
          <div className="feedback-message">
            ✅ Thank you! Your reflection has been submitted.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Session Number
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSessionNum(1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: sessionNum === 1 ? '3px solid #4F46E5' : '2px solid #ddd',
                  borderRadius: '8px',
                  background: sessionNum === 1 ? '#EEF2FF' : 'white',
                  fontWeight: sessionNum === 1 ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                Session 1
              </button>
              <button
                type="button"
                onClick={() => setSessionNum(2)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: sessionNum === 2 ? '3px solid #4F46E5' : '2px solid #ddd',
                  borderRadius: '8px',
                  background: sessionNum === 2 ? '#EEF2FF' : 'white',
                  fontWeight: sessionNum === 2 ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                Session 2
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>
              How did you feel during today's class? (Tap multiple times)
            </label>
            <div className="button-grid">
              <button
                type="button"
                onClick={() => handleSignalClick('stuck')}
                className="signal-btn stuck"
              >
                <span className="btn-emoji">✋</span>
                <span className="btn-text">Stuck</span>
                <span style={{ fontSize: '14px', marginTop: '5px', display: 'block' }}>
                  {signals.stuck}x
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSignalClick('gotIt')}
                className="signal-btn gotit"
              >
                <span className="btn-emoji">✅</span>
                <span className="btn-text">Got it</span>
                <span style={{ fontSize: '14px', marginTop: '5px', display: 'block' }}>
                  {signals.gotIt}x
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSignalClick('pause')}
                className="signal-btn pause"
              >
                <span className="btn-emoji">⏸️</span>
                <span className="btn-text">Pause</span>
                <span style={{ fontSize: '14px', marginTop: '5px', display: 'block' }}>
                  {signals.pause}x
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSignalClick('example')}
                className="signal-btn example"
              >
                <span className="btn-emoji">💡</span>
                <span className="btn-text">Example?</span>
                <span style={{ fontSize: '14px', marginTop: '5px', display: 'block' }}>
                  {signals.example}x
                </span>
              </button>
            </div>
          </div>

          <div className="confidence-section">
            <label className="confidence-label">
              Overall Confidence: <span className="confidence-value">{confidence}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="confidence-slider"
            />
            <div className="slider-labels">
              <span>1 (Low)</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5 (High)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name || totalSignals === 0}
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '20px',
              background: (!name || totalSignals === 0) ? '#ccc' : '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: (!name || totalSignals === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            Submit Reflection
          </button>
        </form>

        <p className="student-footer">
          Anonymous • Privacy-first • Used only to improve your learning
        </p>
      </div>
    </div>
  );
}

export default StudentView;
