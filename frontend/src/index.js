import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';
import { getClerkPublishableKey } from './runtimeConfig';

function Root() {
  const clerkPublishableKey = getClerkPublishableKey();
  if (!clerkPublishableKey) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Clerk configuration required</h1>
        <p>
          Add your Clerk publishable key to <code>frontend/.env</code>:
        </p>
        <pre
          style={{
            background: '#f4f4f5',
            padding: '1rem',
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
        </pre>
        <p>
          Create an application at{' '}
          <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer">
            dashboard.clerk.com
          </a>{' '}
          and set the backend <code>CLERK_SECRET_KEY</code> for the API.
        </p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <App />
    </ClerkProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
