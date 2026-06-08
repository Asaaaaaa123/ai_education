/**
 * App routing — Nature Community Journal (Private + Community)
 *
 * Current state: Transitioning from old child assessment app.
 * Old assessment/child routes have been removed during cleanup.
 *
 * Planned routes for new product:
 *   /                  → Home / Landing
 *   /sign-in, /sign-up → Auth (Clerk)
 *   /dashboard         → Main app (My Journal + Community Feed)
 *   /new               → Create new journal entry
 *   /journal/:id       → View a journal entry
 *   /explore           → Community / public feed
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/mobile-global.css';
import { LanguageProvider } from './utils/i18n';
import HomePage from './components/HomePage';
import ClerkSignInPage from './components/ClerkSignInPage';
import ClerkSignUpPage from './components/ClerkSignUpPage';
import ClerkApiBridge from './components/ClerkApiBridge';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import OnboardChildPage from './components/OnboardChildPage';
import TrainingPlanPage from './components/TrainingPlanPage';
import DailyTaskPage from './components/DailyTaskPage';
import ProgressMonitorPage from './components/ProgressMonitorPage';

// TODO: New nature journal pages (to be created)
// import NewJournalEntryPage from './components/NewJournalEntryPage';
// import JournalEntryPage from './components/JournalEntryPage';
// import CommunityFeedPage from './components/CommunityFeedPage';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <ClerkApiBridge />
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/sign-in/*" element={<ClerkSignInPage />} />
              <Route path="/sign-up/*" element={<ClerkSignUpPage />} />
              <Route path="/login" element={<Navigate to="/sign-in" replace />} />
              <Route path="/register" element={<Navigate to="/sign-up" replace />} />

              {/* Protected routes (will evolve into nature journal) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboard-child"
                element={
                  <ProtectedRoute>
                    <OnboardChildPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training-plan/:planId/day/:day"
                element={
                  <ProtectedRoute>
                    <DailyTaskPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training-plan/:planId"
                element={
                  <ProtectedRoute>
                    <TrainingPlanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/child/:childId/progress"
                element={
                  <ProtectedRoute>
                    <ProgressMonitorPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/daily-task" element={<Navigate to="/dashboard" replace />} />

              {/* Legacy routes — redirect or stub */}
              <Route path="/assessment" element={<Navigate to="/dashboard" replace />} />
              <Route path="/result" element={<Navigate to="/dashboard" replace />} />
              <Route path="/progress" element={<Navigate to="/dashboard" replace />} />
              <Route path="/test*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/online-game" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
