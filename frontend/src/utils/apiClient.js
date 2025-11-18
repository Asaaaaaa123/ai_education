import axios from 'axios';

// API base configuration
// In Docker: use the current hostname with backend port
// In local dev: use localhost:8001
// If REACT_APP_API_URL is explicitly set, use it
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `http://${window.location.hostname}:8001`
    : 'http://localhost:8001');

// Debug logging
console.log('API Base URL:', API_BASE_URL);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('Window hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    // Add authentication token (if available)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add language preference header for i18n support
    const language = localStorage.getItem('language') || 'en';
    config.headers['X-Language'] = language;
    // Also set Accept-Language header (standard HTTP header)
    config.headers['Accept-Language'] = language === 'zh' ? 'zh-CN,zh;q=0.9' : 'en-US,en;q=0.9';
    
    // Debug logging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Language headers:', {
      'X-Language': config.headers['X-Language'],
      'Accept-Language': config.headers['Accept-Language'],
      'All headers': config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request time
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized, please login again');
          localStorage.removeItem('authToken');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access Forbidden');
          break;
        case 404:
          console.error('Resource Not Found');
          break;
        case 500:
          console.error('Internal Server Error');
          break;
        default:
          console.error(`Request Failed: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('Network Error, please check your connection');
    } else {
      console.error('Request Configuration Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Health check
  healthCheck: () => apiClient.get('/health'),
  
  // Get API status
  getStatus: () => apiClient.get('/'),
  
  // Analyze assessment
  analyzeAssessment: (data) => apiClient.post('/analyze', data),
  
  // Get assessment history
  getAssessmentHistory: (limit = 10) => apiClient.get(`/history?limit=${limit}`),
  
  // Get statistics
  getStatistics: () => apiClient.get('/statistics'),
  
  // Get model status
  getModelStatus: () => apiClient.get('/model-status'),
  
  // Save model
  saveModel: () => apiClient.post('/save-model'),
  
  // Load model
  loadModel: (modelPath = 'models/education_model.pth') => 
    apiClient.post('/load-model', null, { params: { model_path: modelPath } }),
  
  // Train model
  trainModel: (data) => apiClient.post('/train', data),
  
  // ==================== 新的计划管理API ====================
  // 孩子信息管理
  createChild: (data) => apiClient.post('/api/plans/children', data),
  getChildren: () => apiClient.get('/api/plans/children'),
  getChild: (childId) => apiClient.get(`/api/plans/children/${childId}`),
  
  // 测试结果
  submitTestResult: (data) => apiClient.post('/api/plans/test-results', data),
  getTestResults: (childId) => apiClient.get(`/api/plans/children/${childId}/test-results`),
  
  // 训练计划
  createPlan: (data) => apiClient.post('/api/plans/plans', data),
  getPlan: (planId) => apiClient.get(`/api/plans/plans/${planId}`),
  getChildPlans: (childId) => apiClient.get(`/api/plans/children/${childId}/plans`),
  getPlanProgress: (planId) => apiClient.get(`/api/plans/plans/${planId}/progress`),
  updateDailyTask: (planId, day, data) => 
    apiClient.put(`/api/plans/plans/${planId}/tasks/${day}`, data),
};

// Cache management
class ApiCache {
  constructor(maxSize = 50, maxAge = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();

// Cached API methods
export const cachedApi = {
  getStatistics: async () => {
    const cacheKey = 'statistics';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
    
    const response = await api.getStatistics();
    apiCache.set(cacheKey, response.data);
    return response.data;
  },
  
  getModelStatus: async () => {
    const cacheKey = 'model-status';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;
    
    const response = await api.getModelStatus();
    apiCache.set(cacheKey, response.data);
    return response.data;
  }
};

export default apiClient;
