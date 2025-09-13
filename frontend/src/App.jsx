import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { IssueList } from './components/IssueList';

function App() {
  const [currentView, setCurrentView] = useState('issues');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {currentView === 'dashboard' ? (
          <Dashboard />
        ) : (
          <IssueList />
        )}
      </main>
    </div>
  );
}

export default App;