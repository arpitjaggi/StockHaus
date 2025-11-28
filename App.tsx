import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UploadForm } from './pages/UploadForm';
import { Dashboard } from './pages/Dashboard';
import { ProjectSelection } from './pages/ProjectSelection';
import { db } from './lib/db';

// Guard component: Redirects to Project Selection if no project is active
const RequireProject: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeProject = db.getActiveProjectId();
  if (!activeProject) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ProjectSelection />} />
        
        <Route path="/" element={<Layout />}>
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
      </Routes>
    </HashRouter>
  );
};

export default App;