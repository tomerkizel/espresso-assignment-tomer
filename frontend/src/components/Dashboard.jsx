import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, AlertCircle, FileQuestion } from 'lucide-react';
import issueService from '../services/issueService';
export const Dashboard = () => {
  const [counts, setCounts] = useState({
    status: { open: 0, in_progress: 0, resolved: 0, "": 0 },
    severity: { minor: 0, major: 0, critical: 0, "": 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      const dashboardCounts = await issueService.getDashboardCounts();
      setCounts((prev) => ({
        status: { ...prev.status, ...dashboardCounts.status },
        severity: { ...prev.severity, ...dashboardCounts.severity }
    }));
    } catch (error) {
      console.error('Failed to fetch dashboard counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalIssues = counts.status.open + counts.status.in_progress + counts.status.resolved + counts.status[""];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of clinical trial issue tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Issues</p>
              <p className="text-2xl font-bold text-gray-900">{counts.status.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{counts.status.in_progress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{counts.status.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileQuestion className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Empty</p>
              <p className="text-2xl font-bold text-gray-900">{counts.status[""]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Issues by Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-800">{counts.status.open}</p>
                <p className="text-red-600 font-medium">Open</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-800">{counts.status.in_progress}</p>
                <p className="text-yellow-600 font-medium">In Progress</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-800">{counts.status.resolved}</p>
                <p className="text-green-600 font-medium">Resolved</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <FileQuestion className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{counts.status[""]}</p>
                <p className="text-gray-600 font-medium">Empty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Issues by Severity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-800">{counts.severity.minor}</p>
                <p className="text-blue-600 font-medium">Minor</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-orange-800">{counts.severity.major}</p>
                <p className="text-orange-600 font-medium">Major</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-800">{counts.severity.critical}</p>
                <p className="text-red-600 font-medium">Critical</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <FileQuestion className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{counts.severity[""]}</p>
                <p className="text-gray-600 font-medium">Empty</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};