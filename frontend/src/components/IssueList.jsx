import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Filter, Edit, Trash2, CheckCircle2, Upload, Plus, AlertCircle, Clock } from 'lucide-react';
import issuesService from '../services/issueService';
import { IssueForm } from './IssueForm';

export const IssueList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingIssue, setEditingIssue] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [otherFilters, setOtherFilters] = useState({
        status: '',
        severity: ''
    });
    const searchTimeoutRef = useRef(null);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const filters = {
                search: debouncedSearchTerm,
                ...otherFilters
            };
            const data = await issuesService.getIssues(filters);
            setIssues(data.issues);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
        } finally {
            setLoading(false);  
        }
    };

    // Debounce the search term - wait 2 seconds after user stops typing
    useEffect(() => {
        // Clear the existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set a new timeout
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 2000);

        // Cleanup function to clear timeout on component unmount or dependency change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    // Fetch issues when debounced search term or other filters change
    useEffect(() => {
        fetchIssues();
    }, [debouncedSearchTerm, otherFilters]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this issue?')) {
            return;
        }

        try {
            await issuesService.removeIssue(id);
            await fetchIssues();
        } catch (error) {
            console.error('Failed to delete issue:', error);
        }
    };

    const handleResolve = async (issue) => {
        try {
          await issuesService.updateIssue(issue.id, { status: 'resolved' });
          await fetchIssues();
        } catch (error) {
          console.error('Failed to resolve issue:', error);
        }
    };

    const handleSaveIssue = async (savedIssue) => {
        setShowForm(false);
        setEditingIssue(null);
        await fetchIssues();
    };

    const handleCSVImport = async (event) => {
        // const file = event.target.files?.[0];
        // if (!file) return;

        // try {
        //   const text = await file.text();
        //   const importedCount = await MockIssueService.importFromCSV(text);
        //   alert(`Successfully imported ${importedCount} issues`);
        //   await fetchIssues();
        // } catch (error) {
        //   alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // } finally {
        //   event.target.value = '';
        // }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
        case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'open': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
        case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
        case 'in_progress': return <Clock className="h-4 w-4" />;
        case 'open': return <AlertCircle className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Issues Management</h1>
            <div className="flex items-center space-x-3">
            <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
                id="csv-import"
            />
            <label
                htmlFor="csv-import"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
            </label>
            <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
                <Plus className="h-4 w-4 mr-2" />
                New Issue
            </button>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                value={otherFilters.status}
                onChange={(e) => setOtherFilters(prev => ({ ...prev, status: e.target.value }))}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                </select>
            </div>
            
            <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                value={otherFilters.severity}
                onChange={(e) => setOtherFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="">All Severities</option>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
                </select>
            </div>
            </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            ) : issues.length === 0 ? (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{
                    debouncedSearchTerm !== '' || otherFilters.status !== '' || otherFilters.severity !== '' ? 'No issues found. Check your filters.' : 'No issues found. Create your first issue to get started.'
                }</p>
            </div>
            ) : (
            <div className="divide-y divide-gray-200">
                {issues.map((issue) => (
                <div key={issue.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                            {issue.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                            {getStatusIcon(issue.status)}
                            <span className="ml-1 capitalize">{issue.status.replace('_', ' ')}</span>
                        </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                            <strong>Site:</strong> <span className="ml-1">{issue.site}</span>
                        </span>
                        <span className="flex items-center">
                            <strong>Created:</strong> <span className="ml-1">{formatDate(issue.createdAt)}</span>
                        </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                        {issue.status !== 'resolved' && (
                        <button
                            onClick={() => handleResolve(issue)}
                            className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Resolve
                        </button>
                        )}
                        
                        <button
                        onClick={() => setEditingIssue(issue)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                        </button>
                        
                        <button
                        onClick={() => handleDelete(issue.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                        >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>

        {/* Forms */}
        {(showForm || editingIssue) && (
            <IssueForm
            issue={editingIssue}
            onSave={handleSaveIssue}
            onCancel={() => {
                setShowForm(false);
                setEditingIssue(null);
            }}
            />
        )}
        </div>
    );
};