/**
 * Lightweight toast shim to avoid hard dependency on external toast packages.
 * Keeps API shape compatible with `{ toast }` usage in components.
 */
const notify = (level, message) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { level, message: String(message || '') },
      })
    );
  }
  if (level === 'error') {
    console.error(message);
  } else if (level === 'success') {
    console.info(message);
  } else {
    console.log(message);
  }
};

export const toast = {
  success: (message) => notify('success', message),
  error: (message) => notify('error', message),
  info: (message) => notify('info', message),
};

export default toast;
