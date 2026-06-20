/**
 * Runtime config from /config.js (generated at container start on Coolify/Docker).
 * Falls back to Create React App build-time env for local development.
 */

function getRuntimeConfig() {
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) {
    return window.__RUNTIME_CONFIG__;
  }
  return {};
}

export function getClerkPublishableKey() {
  const runtime = getRuntimeConfig();
  return (
    runtime.REACT_APP_CLERK_PUBLISHABLE_KEY ||
    process.env.REACT_APP_CLERK_PUBLISHABLE_KEY ||
    ''
  );
}

export function resolveApiBaseUrl() {
  const runtime = getRuntimeConfig();
  const envUrl =
    runtime.REACT_APP_API_URL !== undefined
      ? runtime.REACT_APP_API_URL
      : process.env.REACT_APP_API_URL;

  if (envUrl === '') return '';
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
}
