import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Filter, Upload, Plus, AlertCircle } from 'lucide-react';
import issuesService from '../services/issueService';
import { IssueForm } from './IssueForm';
import { IssueCard } from './IssueCard';
import { Pagination } from './Pagination';

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
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0
    });
    const searchTimeoutRef = useRef(null);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const filters = {
                title: debouncedSearchTerm,
                ...otherFilters,
                page: pagination.currentPage,
                limit: pagination.itemsPerPage
            };
            const data = await issuesService.getIssues(filters);
            setIssues(data.issues);
            setPagination(prev => ({
                ...prev,
                totalPages: data.totalPages,
                totalItems: data.totalItems,
                currentPage: data.currentPage
            }));
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

    // Reset to page 1 when search term or filters change
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    }, [debouncedSearchTerm, otherFilters]);

    // Fetch issues when debounced search term, other filters, or pagination change
    useEffect(() => {
        fetchIssues();
    }, [debouncedSearchTerm, otherFilters, pagination.currentPage, pagination.itemsPerPage]);

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

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }));
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setPagination(prev => ({
            ...prev,
            itemsPerPage: newItemsPerPage,
            currentPage: 1 // Reset to page 1 when changing items per page
        }));
    };

    const handleCSVImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedCount = await issuesService.importFromCSV(text);
            alert(`Successfully imported ${importedCount} issues`);
            await fetchIssues();
        } catch (error) {
            alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            event.target.value = '';
        }
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
                    <IssueCard
                        key={issue.id}
                        issue={issue}
                        onDelete={handleDelete}
                        onResolve={handleResolve}
                        onEdit={setEditingIssue}
                    />
                ))}
            </div>
            )}
        </div>

        {/* Pagination */}
        <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
        />

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