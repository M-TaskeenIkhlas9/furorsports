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

// WhatsApp Configuration
// Format: country code + number (e.g., "923008522576" for Pakistan)
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '923008522576';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  return fetch(url, options);
};

// Helper function to generate WhatsApp message URL
export const generateWhatsAppUrl = (message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

// Helper function to get full image URL (prepends API_URL if image path is relative)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If it's already a full URL (http://, https://, or data:), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  // If API_URL is set, prepend it to the image path
  if (API_URL) {
    return `${API_URL}${imagePath}`;
  }
  // Otherwise return the path as is (for development with proxy)
  return imagePath;
};

