/**
 * Axios client + api helpers — Clerk Bearer tokens via ClerkApiBridge.
 * Unified ChildProfile flows use /api/children; training tasks still use /api/plans/*.
 */

import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `http://${window.location.hostname}:8080`
    : 'http://localhost:8080');

// console.log('API Base URL:', API_BASE_URL); // cleaned during 2026 nature journal transition

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Set by ClerkApiBridge when user is signed in via Clerk */
let clerkGetToken = null;

export function setClerkTokenGetter(fn) {
  clerkGetToken = typeof fn === 'function' ? fn : null;
}

apiClient.interceptors.request.use(
  async (config) => {
    config.metadata = { startTime: new Date() };

    let token = null;
    if (clerkGetToken) {
      try {
        token = await clerkGetToken();
      } catch (e) {
        console.warn('Clerk getToken failed:', e);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language = localStorage.getItem('language') || 'en';
    config.headers['X-Language'] = language;
    config.headers['Accept-Language'] = language === 'zh' ? 'zh-CN,zh;q=0.9' : 'en-US,en;q=0.9';

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`); // cleaned
    return response;
  },
  (error) => {
    console.error('Response Error:', error);

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized');
          // Only force sign-in redirect on protected app pages — not on the public homepage
          // (otherwise "Continue Training" looks like it does nothing when Clerk azp mismatches).
          {
            const path = window.location.pathname;
            const isPublic =
              path === '/' ||
              path.startsWith('/sign-in') ||
              path.startsWith('/sign-up') ||
              path === '/login' ||
              path === '/register';
            if (!isPublic) {
              window.location.href = '/sign-in';
            }
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
    }

    return Promise.reject(error);
  }
);

export const api = {
  healthCheck: () => apiClient.get('/health'),
  getStatus: () => apiClient.get('/'),
  analyzeAssessment: (data) => apiClient.post('/analyze', data),
  getAssessmentHistory: (limit = 10) => apiClient.get(`/history?limit=${limit}`),
  getStatistics: () => apiClient.get('/statistics'),
  getModelStatus: () => apiClient.get('/model-status'),
  saveModel: () => apiClient.post('/save-model'),
  loadModel: (modelPath = 'models/education_model.pth') =>
    apiClient.post('/load-model', null, { params: { model_path: modelPath } }),
  trainModel: (data) => apiClient.post('/train', data),

  listChildProfiles: () => apiClient.get('/api/children'),
  createChildProfile: (data) => apiClient.post('/api/children', data),
  getChildProfile: (childId) => apiClient.get(`/api/children/${childId}`),
  patchChildProfile: (childId, data) => apiClient.patch(`/api/children/${childId}`, data),
  deleteChildProfile: (childId) => apiClient.delete(`/api/children/${childId}`),
  postChildAssessment: (childId, payload) =>
    apiClient.post(`/api/children/${childId}/assessment`, payload, { timeout: 120000 }),
  submitChildTestResult: (childId, body) =>
    apiClient.post(`/api/children/${childId}/test-results`, body),
  generateChildPlan: (childId, planType = 'weekly') =>
    apiClient.post(`/api/children/${childId}/generate-plan`, { plan_type: planType }),
  reportChildOnboardingStep: (childId, step, completed = false) =>
    apiClient.post(`/api/children/${childId}/onboarding-step`, { step, completed }),

  /** @deprecated Use listChildProfiles — kept for older components */
  createChild: (data) => apiClient.post('/api/children', data),
  getChildren: () => apiClient.get('/api/children'),
  getChild: (childId) => apiClient.get(`/api/children/${childId}`),
  submitTestResult: (data) =>
    apiClient.post(`/api/children/${data.child_id}/test-results`, data),
  getTestResults: (childId) => apiClient.get(`/api/plans/children/${childId}/test-results`),
  createPlan: (data) => apiClient.post('/api/plans/plans', data),
  getPlan: (planId) => apiClient.get(`/api/plans/plans/${planId}`),
  getChildPlans: (childId) => apiClient.get(`/api/plans/children/${childId}/plans`),
  getPlanProgress: (planId) => apiClient.get(`/api/plans/plans/${planId}/progress`),
  updateDailyTask: (planId, day, data) => apiClient.put(`/api/plans/plans/${planId}/tasks/${day}`, data),

  getChecklist: (scopeKey) => apiClient.get('/api/user-data/checklist', { params: { scope: scopeKey } }),
  putChecklist: (scopeKey, items) => apiClient.put('/api/user-data/checklist', { scope_key: scopeKey, items }),
};

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
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();

export default apiClient;
