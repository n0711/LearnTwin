// =============================================================================
// API SERVICE - FastAPI Backend Integration
// =============================================================================
// Connects to FastAPI backend at /ingest/json endpoint

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || 'devkey';

// -----------------------------------------------------------------------------
// Send Metrics to Backend
// -----------------------------------------------------------------------------

/**
 * Send metrics data to FastAPI /ingest/json endpoint
 * @param {Array} metricsArray - Array of metric records matching backend schema
 * @returns {Promise} - Response from backend
 */
export async function sendMetrics(metricsArray) {
  try {
    const response = await fetch(`${API_BASE_URL}/ingest/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(metricsArray)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending metrics:', error);
    throw error;
  }
}

/**
 * Get class mastery analytics
 * @param {string} classId - The class identifier
 * @returns {Promise} - Mastery analytics data
 */
export async function getClassMastery(classId) {
  try {
    const response = await fetch(`${API_BASE_URL}/mastery/${classId}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching mastery:', error);
    throw error;
  }
}

/**
 * Get recommendations for a class
 * @param {string} classId - The class identifier
 * @returns {Promise} - Recommendation data
 */
export async function getRecommendations(classId) {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend/${classId}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}
