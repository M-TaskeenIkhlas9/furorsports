// API Configuration
// In production, this will use the Railway backend URL
// In development, it uses the proxy (localhost:5000)

const getApiUrl = () => {
  // Check if we're in production and have a backend URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development: use proxy (handled by vite.config.js)
  // Production fallback: use relative paths (if backend is on same domain)
  return '';
};

export const API_URL = getApiUrl();

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  return fetch(url, options);
};

