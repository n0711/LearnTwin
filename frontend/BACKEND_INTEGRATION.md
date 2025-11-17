# Backend Integration Guide

## Overview
This guide explains how to connect the LearnTwin frontend to a backend API.

---

## Step 1: Set Up Backend

### Option A: Node.js + Express (Recommended for Hackathon)

Create a new folder `backend/` at the root of your project:

```bash
mkdir backend
cd backend
npm init -y
npm install express cors mongoose socket.io dotenv
```

**Basic Server Setup** (`backend/server.js`):

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learntwin');

// Session Schema
const sessionSchema = new mongoose.Schema({
  sessionCode: String,
  createdAt: { type: Date, default: Date.now },
  isLive: { type: Boolean, default: false }
});

// Feedback Schema (anonymous)
const feedbackSchema = new mongoose.Schema({
  sessionCode: String,
  sessionNumber: Number,
  stuck: Number,
  gotIt: Number,
  pause: Number,
  example: Number,
  confidence: Number,
  timestamp: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

// API Routes
app.post('/api/sessions', async (req, res) => {
  const sessionCode = Math.floor(1000 + Math.random() * 9000).toString();
  const session = await Session.create({ sessionCode });
  res.json({ sessionCode: session.sessionCode });
});

app.post('/api/feedback', async (req, res) => {
  const feedback = await Feedback.create(req.body);
  res.json({ success: true, id: feedback._id });
});

app.get('/api/analytics/:code/:session', async (req, res) => {
  const { code, session } = req.params;

  const feedbacks = await Feedback.find({
    sessionCode: code,
    sessionNumber: parseInt(session)
  });

  // Calculate analytics (similar to getClassAnalytics function)
  const totals = feedbacks.reduce((acc, f) => ({
    stuck: acc.stuck + f.stuck,
    gotIt: acc.gotIt + f.gotIt,
    pause: acc.pause + f.pause,
    example: acc.example + f.example,
    confidence: acc.confidence + f.confidence
  }), { stuck: 0, gotIt: 0, pause: 0, example: 0, confidence: 0 });

  const studentCount = feedbacks.length;
  const avgConfidence = totals.confidence / studentCount;
  const totalSignals = totals.stuck + totals.gotIt + totals.pause + totals.example;
  const confusionRate = totalSignals > 0 ? (totals.stuck / totalSignals) * 100 : 0;

  res.json({
    studentCount,
    avgConfidence: avgConfidence.toFixed(1),
    totalSignals,
    confusionRate: confusionRate.toFixed(1),
    signals: {
      stuck: totals.stuck,
      gotIt: totals.gotIt,
      pause: totals.pause,
      example: totals.example
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

---

## Step 2: Update Frontend Components

### StudentView.jsx - Submit Feedback

Replace the mock `handleSubmit` with API call:

```javascript
import { submitFeedback } from './api';

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await submitFeedback(sessionCode, {
      sessionNum,
      signals,
      confidence
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    alert('Failed to submit. Please try again.');
  }
};
```

### DashboardView.jsx - Fetch Analytics

Replace mock data with API calls:

```javascript
import { getClassAnalytics, getSessionComparison } from './api';
import { useState, useEffect } from 'react';

function DashboardView({ sessionCode }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);

        if (selectedSession === 'compare') {
          const data = await getSessionComparison(sessionCode);
          setAnalytics(data);
        } else {
          const data = await getClassAnalytics(sessionCode, selectedSession);
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [sessionCode, selectedSession]);

  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No data available</div>;

  // Rest of component...
}
```

### App.jsx - Create Session

Replace random code generation with API call:

```javascript
import { createSession } from './api';

const createNewSession = async () => {
  try {
    const { sessionCode } = await createSession();
    navigateToDashboard(sessionCode);
  } catch (error) {
    console.error('Failed to create session:', error);
    alert('Failed to create session. Please try again.');
  }
};

// Update button
<button onClick={createNewSession}>
  Create New Session
</button>
```

---

## Step 3: Real-Time Features (Live Mode)

For live mode, you'll need WebSocket support:

### Backend - Add Socket.io

```javascript
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:5173" }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join-session', (sessionCode) => {
    socket.join(sessionCode);
    console.log(`Client joined session ${sessionCode}`);
  });

  socket.on('send-signal', (data) => {
    // Broadcast to all clients in the session (teachers)
    io.to(data.sessionCode).emit('new-signal', {
      signalType: data.signalType,
      confidence: data.confidence,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server with Socket.io on http://localhost:${PORT}`);
});
```

### Frontend - LiveDashboard.jsx

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function LiveDashboard({ sessionCode }) {
  const [signals, setSignals] = useState({
    stuck: 0, gotIt: 0, pause: 0, example: 0
  });

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.emit('join-session', sessionCode);

    socket.on('new-signal', (data) => {
      setSignals(prev => ({
        ...prev,
        [data.signalType]: prev[data.signalType] + 1
      }));
    });

    return () => socket.disconnect();
  }, [sessionCode]);

  // Rest of component...
}
```

---

## Step 4: Environment Variables

Create `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000/api
```

Create `.env` in backend folder:

```env
MONGODB_URI=mongodb://localhost:27017/learntwin
PORT=3000
```

---

## Step 5: Deployment Considerations

### Frontend (Vite)
- Deploy to: Vercel, Netlify, or GitHub Pages
- Update `VITE_API_URL` to production backend URL

### Backend (Node.js)
- Deploy to: Railway, Render, Heroku, or DigitalOcean
- Set production environment variables
- Use MongoDB Atlas for hosted database

### Quick Deployment with Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway init
railway up

# Get your backend URL and update frontend .env
```

---

## Alternative: Firebase (Fastest Setup)

If you want the quickest setup without managing a server:

```bash
npm install firebase
```

```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "learntwin",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function submitFeedback(sessionCode, data) {
  return addDoc(collection(db, 'feedback'), {
    sessionCode,
    ...data,
    timestamp: new Date()
  });
}

export async function getAnalytics(sessionCode, sessionNum) {
  const q = query(
    collection(db, 'feedback'),
    where('sessionCode', '==', sessionCode),
    where('sessionNumber', '==', sessionNum)
  );
  const snapshot = await getDocs(q);
  const feedbacks = snapshot.docs.map(doc => doc.data());

  // Calculate analytics...
  return analytics;
}
```

---

## Testing the Integration

1. **Start MongoDB** (if using Express):
   ```bash
   mongod
   ```

2. **Start Backend**:
   ```bash
   cd backend
   node server.js
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```

4. **Test Flow**:
   - Create a session → Check backend logs
   - Submit feedback → Check database
   - View analytics → Verify calculations

---

## Next Steps

1. Add authentication (teacher accounts)
2. Add session management (close/archive sessions)
3. Add data export features
4. Implement proper error handling
5. Add loading states throughout app
6. Set up monitoring/analytics

---

## Need Help?

Common issues:
- **CORS errors**: Enable CORS in backend
- **Connection refused**: Check backend is running
- **MongoDB errors**: Ensure MongoDB is running locally
- **WebSocket issues**: Check firewall/proxy settings
