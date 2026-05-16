import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import IdeaInputPage from './pages/IdeaInputPage';
import BlueprintDashboardPage from './pages/BlueprintDashboardPage';
import BobPromptPage from './pages/BobPromptPage';
import ArtifactTrackerPage from './pages/ArtifactTrackerPage';
import BobEvidencePage from './pages/BobEvidencePage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Home page - Idea input */}
          <Route path="/" element={<IdeaInputPage />} />
          
          {/* Blueprint dashboard with ID */}
          <Route path="/blueprints/:id" element={<BlueprintDashboardPage />} />
          
          {/* Bob prompt page with ID */}
          <Route path="/blueprints/:id/bob-prompt" element={<BobPromptPage />} />
          
          {/* Artifact tracker */}
          <Route path="/artifacts" element={<ArtifactTrackerPage />} />
          
          {/* Bob evidence dashboard */}
          <Route path="/bob-evidence" element={<BobEvidencePage />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/dashboard" element={<BlueprintDashboardPage />} />
          <Route path="/bob-prompt" element={<BobPromptPage />} />
          <Route path="/evidence" element={<BobEvidencePage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

// Made with Bob
