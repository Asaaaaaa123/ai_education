import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './utils/i18n';
import HomePage from './components/HomePage';
import AssessmentPage from './components/AssessmentPage';
import ResultPage from './components/ResultPage';
import TestPage from './components/TestPage';
import TestAgeAdaptive from './components/TestAgeAdaptive';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ChildRegistration from './components/ChildRegistration';
import ChildTestPage from './components/ChildTestPage';
import TrainingPlanPage from './components/TrainingPlanPage';
import DailyTaskPage from './components/DailyTaskPage';
import OnlineGame from './components/OnlineGame';
import ProgressPage from './components/ProgressPage';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <div className="App">
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/assessment" element={ 
              <ProtectedRoute>
                <AssessmentPage />
              </ProtectedRoute>
            } />
            <Route path="/result" element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            } />
            <Route path="/test" element={<TestPage />} />
            <Route path="/test-age-adaptive" element={<TestAgeAdaptive />} />
            <Route path="/child-registration" element={<ChildRegistration />} />
            <Route path="/child-test" element={<ChildTestPage />} />
            <Route path="/training-plan" element={<TrainingPlanPage />} />
            <Route path="/daily-task" element={<DailyTaskPage />} />
            <Route path="/online-game" element={<OnlineGame />} />
            <Route path="/progress" element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            } />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App; 