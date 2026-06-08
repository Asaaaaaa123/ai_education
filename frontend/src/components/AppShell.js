import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import './AppShell.css';

export default function AppShell({ title, subtitle, children, backTo = '/dashboard', showBack = true }) {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <div className="app-shell-brand">
          <Link to="/" className="app-shell-logo">
            SpecialCare
          </Link>
          {title && <h1 className="app-shell-title">{title}</h1>}
          {subtitle && <p className="app-shell-subtitle">{subtitle}</p>}
        </div>
        <div className="app-shell-actions">
          {showBack && backTo && (
            <button type="button" className="btn btn-outline" onClick={() => navigate(backTo)}>
              ← Back
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="app-shell-main">{children}</main>
    </div>
  );
}
