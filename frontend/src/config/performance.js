// Performance optimization configuration
export const PERFORMANCE_CONFIG = {
  // Lazy loading configuration
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px'
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 50 // Maximum cache 50 requests
  },
  
  // Debounce configuration
  debounce: {
    search: 300, // Search debounce 300ms
    resize: 100, // Window resize debounce 100ms
    scroll: 16   // Scroll debounce 16ms (60fps)
  },
  
  // Virtual scroll configuration
  virtualScroll: {
    enabled: true,
    itemHeight: 50,
    overscan: 5
  },
  
  // Image optimization
  imageOptimization: {
    enabled: true,
    lazy: true,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8vPjwvc3ZnPg=='
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Record page load time
  recordPageLoad: (pageName) => {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      console.log(`Page ${pageName} load time: ${loadTime}ms`);
    }
  },
  
  // Record component render time
  recordComponentRender: (componentName, startTime) => {
    const renderTime = performance.now() - startTime;
    console.log(`Component ${componentName} render time: ${renderTime.toFixed(2)}ms`);
  },
  
  // Record API request time
  recordApiCall: (endpoint, startTime) => {
    const apiTime = performance.now() - startTime;
    console.log(`API ${endpoint} request time: ${apiTime.toFixed(2)}ms`);
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryUsage: () => {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  },
  
  logMemoryUsage: () => {
    const memory = memoryMonitor.getMemoryUsage();
    if (memory) {
      console.log(`Memory usage: ${memory.used}MB / ${memory.total}MB (limit: ${memory.limit}MB)`);
    }
  }
};
