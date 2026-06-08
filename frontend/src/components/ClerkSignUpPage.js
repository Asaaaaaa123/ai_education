import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import './LoginPage.css';

/** Clerk-hosted sign-up UI (replaces legacy registration). */
export default function ClerkSignUpPage() {
  return (
    <div className="login-page">
      <div className="login-container login-container--clerk">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
