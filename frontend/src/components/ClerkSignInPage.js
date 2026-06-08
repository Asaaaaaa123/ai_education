import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import './LoginPage.css';

/** Clerk-hosted sign-in UI (replaces legacy email/password login). */
export default function ClerkSignInPage() {
  return (
    <div className="login-page">
      <div className="login-container login-container--clerk">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
