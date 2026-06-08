import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setClerkTokenGetter } from '../utils/apiClient';

/**
 * Registers Clerk session token getter for axios (must render inside ClerkProvider).
 */
export default function ClerkApiBridge() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setClerkTokenGetter(null);
      return;
    }
    // Do not clear the getter on effect cleanup — React StrictMode remounts
    // would briefly null the getter and send unauthenticated API requests.
    setClerkTokenGetter(async () => {
      try {
        return await getToken();
      } catch (e) {
        console.warn('Clerk getToken failed:', e);
        return null;
      }
    });
  }, [getToken, isSignedIn, isLoaded]);

  return null;
}
