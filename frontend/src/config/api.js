// API Configuration
const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout',
      CHANGE_PASSWORD: '/api/auth/change-password'
    },
    
    // Cars
    CARS: {
      ALL: '/api/cars',
      POPULAR: '/api/cars/popular',
      RECOMMEND: '/api/cars/recommend',
      BY_ID: (id) => `/api/cars/${id}`,
      SEARCH: (query) => `/api/cars?search=${encodeURIComponent(query)}`
    },
    
    // News
    NEWS: {
      ALL: '/api/news',
      BY_ID: (id) => `/api/news/${id}`
    },
    
    // Blogs
    BLOGS: {
      ALL: '/api/blogs',
      BY_ID: (id) => `/api/blogs/${id}`
    },
    
    // Market Data
    MARKET: {
      BY_CAR_ID: (carId) => `/api/market/car/${carId}`,
      PRICE_TRENDS: (carId) => `/api/market/car/${carId}/price-trends`,
      RESALE_VALUES: (carId) => `/api/market/car/${carId}/resale-values`,
      MARKET_DEMAND: (carId) => `/api/market/car/${carId}/market-demand`,
      BEST_TIME: (carId) => `/api/market/car/${carId}/best-time`,
      DEALER_INVENTORY: (carId) => `/api/market/car/${carId}/dealer-inventory`,
      MARKET_INSIGHTS: (carId) => `/api/market/car/${carId}/market-insights`
    },
    
    // Reviews
    REVIEWS: {
      BY_CAR_ID: (carId) => `/api/reviews/car/${carId}`,
      AVERAGE_RATING: (carId) => `/api/reviews/car/${carId}/average-rating`,
      CREATE: '/api/reviews',
      BY_ID: (id) => `/api/reviews/${id}`,
      LIKE: (id) => `/api/reviews/${id}/like`
    },
    
    // Forums
    FORUMS: {
      BY_CAR_ID: (carId) => `/api/forums/car/${carId}`,
      BY_ID: (id) => `/api/forums/${id}`,
      CREATE: '/api/forums',
      ADD_COMMENT: (id) => `/api/forums/${id}/comments`,
      LIKE: (id) => `/api/forums/${id}/like`,
      SOLVE: (id) => `/api/forums/${id}/solve`
    },
    
    // Maintenance
    MAINTENANCE: {
      BY_CAR_ID: (carId) => `/api/maintenance/car/${carId}`,
      POPULAR: '/api/maintenance/popular',
      BY_ID: (id) => `/api/maintenance/${id}`,
      CREATE: '/api/maintenance',
      VERIFY: (id) => `/api/maintenance/${id}/verify`,
      LIKE: (id) => `/api/maintenance/${id}/like`
    },
    
    // Fuel Economy
    FUEL_ECONOMY: {
      BY_CAR_ID: (carId) => `/api/fuel-economy/car/${carId}`,
      AVERAGE: (carId) => `/api/fuel-economy/car/${carId}/average`,
      BY_ID: (id) => `/api/fuel-economy/${id}`,
      CREATE: '/api/fuel-economy',
      LIKE: (id) => `/api/fuel-economy/${id}/like`
    },
    
    // Common Issues
    COMMON_ISSUES: {
      BY_CAR_ID: (carId) => `/api/common-issues/car/${carId}`,
      POPULAR: '/api/common-issues/popular',
      BY_ID: (id) => `/api/common-issues/${id}`,
      CREATE: '/api/common-issues',
      VERIFY: (id) => `/api/common-issues/${id}/verify`,
      ADD_SOLUTION: (id) => `/api/common-issues/${id}/solutions`,
      VERIFY_SOLUTION: (issueId, solutionId) => `/api/common-issues/${issueId}/solutions/${solutionId}/verify`,
      LIKE_SOLUTION: (issueId, solutionId) => `/api/common-issues/${issueId}/solutions/${solutionId}/like`
    }
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default API_CONFIG; 