/**
 * Frontend Configuration File
 * Allows switching between Local Development and Production Render Backend
 */
const CONFIG = {
  // If running locally (localhost or 127.0.0.1), connect to local Express server
  // When deployed to Netlify, set this to your live Render Web Service URL
  // Example Production: 'https://student-management-api.onrender.com/api'
  API_BASE_URL: (() => {
    // Check if a global override is injected
    if (window.__ENV__ && window.__ENV__.API_BASE_URL) {
      return window.__ENV__.API_BASE_URL;
    }

    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'http://localhost:5000/api';
    }

    // Default placeholder for Render production backend (can be updated before Netlify deploy)
    return 'https://student-backend-service.onrender.com/api';
  })(),

  DEPARTMENTS: [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
  ],

  SEMESTERS: [1, 2, 3, 4, 5, 6, 7, 8],
};

// Freeze config object to prevent accidental mutation
Object.freeze(CONFIG);
