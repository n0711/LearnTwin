// =============================================================================
// MOCK DATA FOR LEARNTWIN DEMO
// =============================================================================
// This file contains synthetic student data and analytics functions
// for demonstration purposes during the hackathon presentation.

// -----------------------------------------------------------------------------
// Anonymous Session Data
// -----------------------------------------------------------------------------
// Each entry represents anonymous student feedback for demo purposes

export const studentsData = [
  {
    sessions: {
      1: { stuck: 2, gotIt: 8, pause: 1, example: 3, confidence: 4 },
      2: { stuck: 1, gotIt: 9, pause: 0, example: 2, confidence: 5 }
    }
  },
  {
    sessions: {
      1: { stuck: 5, gotIt: 4, pause: 2, example: 4, confidence: 2 },
      2: { stuck: 4, gotIt: 5, pause: 1, example: 3, confidence: 3 }
    }
  },
  {
    sessions: {
      1: { stuck: 1, gotIt: 9, pause: 0, example: 1, confidence: 5 },
      2: { stuck: 0, gotIt: 10, pause: 0, example: 0, confidence: 5 }
    }
  },
  {
    sessions: {
      1: { stuck: 3, gotIt: 6, pause: 1, example: 3, confidence: 3 },
      2: { stuck: 2, gotIt: 7, pause: 1, example: 2, confidence: 4 }
    }
  },
  {
    sessions: {
      1: { stuck: 4, gotIt: 5, pause: 3, example: 4, confidence: 2 },
      2: { stuck: 3, gotIt: 6, pause: 2, example: 3, confidence: 3 }
    }
  },
  {
    sessions: {
      1: { stuck: 2, gotIt: 7, pause: 0, example: 2, confidence: 4 },
      2: { stuck: 1, gotIt: 8, pause: 0, example: 1, confidence: 5 }
    }
  }
];

// -----------------------------------------------------------------------------
// Analytics Functions
// -----------------------------------------------------------------------------

/**
 * Calculate aggregate class analytics for a specific session
 * @param {number} sessionNum - Session number (1 or 2)
 * @returns {Object} Analytics data including totals, averages, and percentages
 */
export function getClassAnalytics(sessionNum) {
  const sessionData = studentsData
    .map(s => s.sessions[sessionNum])
    .filter(s => s !== undefined);

  if (sessionData.length === 0) return null;

  // Calculate totals
  const totals = sessionData.reduce(
    (acc, session) => ({
      stuck: acc.stuck + session.stuck,
      gotIt: acc.gotIt + session.gotIt,
      pause: acc.pause + session.pause,
      example: acc.example + session.example,
      confidence: acc.confidence + session.confidence
    }),
    { stuck: 0, gotIt: 0, pause: 0, example: 0, confidence: 0 }
  );

  // Calculate derived metrics
  const studentCount = sessionData.length;
  const avgConfidence = totals.confidence / studentCount;
  const totalSignals = totals.stuck + totals.gotIt + totals.pause + totals.example;
  const confusionRate = totalSignals > 0 ? (totals.stuck / totalSignals) * 100 : 0;

  return {
    studentCount,
    avgConfidence: avgConfidence.toFixed(1),
    totalSignals,
    confusionRate: confusionRate.toFixed(1),
    signals: {
      stuck: totals.stuck,
      gotIt: totals.gotIt,
      pause: totals.pause,
      example: totals.example
    },
    signalPercentages: {
      stuck: totalSignals > 0 ? ((totals.stuck / totalSignals) * 100).toFixed(1) : 0,
      gotIt: totalSignals > 0 ? ((totals.gotIt / totalSignals) * 100).toFixed(1) : 0,
      pause: totalSignals > 0 ? ((totals.pause / totalSignals) * 100).toFixed(1) : 0,
      example: totalSignals > 0 ? ((totals.example / totalSignals) * 100).toFixed(1) : 0
    }
  };
}

/**
 * Compare analytics between Session 1 and Session 2
 * @returns {Object} Comparison data with both sessions and calculated changes
 */
export function getSessionComparison() {
  const session1 = getClassAnalytics(1);
  const session2 = getClassAnalytics(2);

  if (!session1 || !session2) return null;

  return {
    session1,
    session2,
    changes: {
      confidence: (session2.avgConfidence - session1.avgConfidence).toFixed(1),
      stuck: session2.signals.stuck - session1.signals.stuck,
      gotIt: session2.signals.gotIt - session1.signals.gotIt,
      confusionRate: (session2.confusionRate - session1.confusionRate).toFixed(1)
    }
  };
}
