import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UploadForm } from './pages/UploadForm';
import { Dashboard } from './pages/Dashboard';
import { ProjectSelection } from './pages/ProjectSelection';
import { Login } from './pages/Login';
import { db } from './lib/db';
import { AuthProvider, useAuth } from './providers/AuthProvider';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Checking session...</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RequireProject: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeProject = db.getActiveProjectId();
  if (!activeProject) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <RequireAuth>
          <ProjectSelection />
        </RequireAuth>
      }
    />
    <Route
      path="/app"
      element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }
    >
      <Route
        path="upload"
        element={
          <RequireProject>
            <UploadForm />
          </RequireProject>
        }
      />
      <Route
        path="dashboard"
        element={
          <RequireProject>
            <Dashboard />
          </RequireProject>
        }
      />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;