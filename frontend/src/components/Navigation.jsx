import React from 'react';
import { List, BarChart3 } from 'lucide-react';

export const Navigation = ({ currentView, onViewChange }) => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img src={import.meta.env.BASE_URL + "src/assets/espresso-logo.png"} alt="Logo" className="h-12 w-12 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Clinical Trial Issue Log</h1>
            </div>
            
            <div className="ml-10 flex items-center space-x-4">              
              <button
                onClick={() => onViewChange('issues')}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  currentView === 'issues'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                Issues
              </button>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};