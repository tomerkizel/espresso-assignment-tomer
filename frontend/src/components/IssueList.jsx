import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Filter, Upload, Plus, AlertCircle, AlertTriangle, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import issuesService from '../services/issueService';
import { IssueForm } from './IssueForm';
import { IssueCard } from './IssueCard';
import { Pagination } from './Pagination';

export const IssueList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingIssue, setEditingIssue] = useState(null);
    const [titleSearchTerm, setTitleSearchTerm] = useState('');
    const [siteSearchTerm, setSiteSearchTerm] = useState('');
    const [debouncedTitleSearch, setDebouncedTitleSearch] = useState('');
    const [debouncedSiteSearch, setDebouncedSiteSearch] = useState('');
    const [otherFilters, setOtherFilters] = useState({
        status: '',
        severity: ''
    });
    const [sorting, setSorting] = useState({
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0
    });
    const [showingDuplicates, setShowingDuplicates] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState(0);
    const [allIssues, setAllIssues] = useState([]); // Store all issues when showing duplicates
    const titleSearchTimeoutRef = useRef(null);
    const siteSearchTimeoutRef = useRef(null);

    // Function to find duplicate groups (issues with same title and site)
    const findDuplicateGroups = (issuesList) => {
        const groups = {};
        
        // Group issues by title + site combination
        issuesList.forEach(issue => {
            const key = `${issue.title}|||${issue.site}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(issue);
        });
        
        // Filter only groups with more than one issue (duplicates)
        return Object.values(groups).filter(group => group.length > 1);
    };

    const fetchIssues = async () => {
        try {
            setLoading(true);
        const filters = {
            title: debouncedTitleSearch,
            site: debouncedSiteSearch,
            ...otherFilters,
            ...sorting,
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

            // Detect duplicates only if not currently showing duplicates
            if (!showingDuplicates) {
                // Fetch all issues to check for duplicates (without pagination)
                const allFilters = {
                    title: debouncedTitleSearch,
                    site: debouncedSiteSearch,
                    ...otherFilters,
                    ...sorting,
                    page: 1,
                    limit: 1000 // Large limit to get all issues
                };
                const allData = await issuesService.getIssues(allFilters);
                const duplicates = findDuplicateGroups(allData.issues);
                setDuplicateGroups(duplicates);
                setCurrentDuplicateIndex(0);
            }
        } catch (error) {
            console.error('Failed to fetch issues:', error);
        } finally {
            setLoading(false);  
        }
    };

    // Debounce the title search term - wait 2 seconds after user stops typing
    useEffect(() => {
        // Clear the existing timeout
        if (titleSearchTimeoutRef.current) {
            clearTimeout(titleSearchTimeoutRef.current);
        }

        // Set a new timeout
        titleSearchTimeoutRef.current = setTimeout(() => {
            setDebouncedTitleSearch(titleSearchTerm);
        }, 2000);

        // Cleanup function to clear timeout on component unmount or dependency change
        return () => {
            if (titleSearchTimeoutRef.current) {
                clearTimeout(titleSearchTimeoutRef.current);
            }
        };
    }, [titleSearchTerm]);

    // Debounce the site search term - wait 2 seconds after user stops typing
    useEffect(() => {
        // Clear the existing timeout
        if (siteSearchTimeoutRef.current) {
            clearTimeout(siteSearchTimeoutRef.current);
        }

        // Set a new timeout
        siteSearchTimeoutRef.current = setTimeout(() => {
            setDebouncedSiteSearch(siteSearchTerm);
        }, 2000);

        // Cleanup function to clear timeout on component unmount or dependency change
        return () => {
            if (siteSearchTimeoutRef.current) {
                clearTimeout(siteSearchTimeoutRef.current);
            }
        };
    }, [siteSearchTerm]);

    // Reset to page 1 when search terms, filters, or sorting change
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    }, [debouncedTitleSearch, debouncedSiteSearch, otherFilters, sorting]);

    // Fetch issues when debounced search terms, other filters, sorting, or pagination change
    useEffect(() => {
        fetchIssues();
    }, [debouncedTitleSearch, debouncedSiteSearch, otherFilters, sorting, pagination.currentPage, pagination.itemsPerPage]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this issue?')) {
            return;
        }

        try {
            await issuesService.removeIssue(id);
            // If we're showing duplicates and this was the last issue in current set, go back to all issues
            if (showingDuplicates && issues.length <= 1) {
                setShowingDuplicates(false);
                setCurrentDuplicateIndex(0);
            }
            await fetchIssues();
        } catch (error) {
            console.error('Failed to delete issue:', error);
        }
    };

    const handleResolve = async (issue) => {
        try {
          await issuesService.updateIssue(issue.id, { status: 'resolved' });
          // If we're showing duplicates and this was the last issue in current set, go back to all issues  
          if (showingDuplicates && issues.length <= 1) {
                setShowingDuplicates(false);
                setCurrentDuplicateIndex(0);
            }
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

    const handleDuplicateAlertClick = () => {
        if (duplicateGroups.length === 0) return;

        if (showingDuplicates) {
            // Already showing duplicates, go to next duplicate group
            const nextIndex = (currentDuplicateIndex + 1) % duplicateGroups.length;
            setCurrentDuplicateIndex(nextIndex);
            setIssues(duplicateGroups[nextIndex]);
        } else {
            // Start showing duplicates
            setAllIssues(issues); // Store current issues
            setShowingDuplicates(true);
            setCurrentDuplicateIndex(0);
            setIssues(duplicateGroups[0]);
        }
    };

    const handleBackToAllIssues = () => {
        setShowingDuplicates(false);
        setCurrentDuplicateIndex(0);
        // Refetch issues to get current state
        fetchIssues();
    };

    const handleSortFieldChange = (sortBy) => {
        setSorting(prev => ({
            ...prev,
            sortBy
        }));
    };

    const handleSortOrderChange = (sortOrder) => {
        setSorting(prev => ({
            ...prev,
            sortOrder
        }));
    };


    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Issues Management</h1>
                {/* Duplicate Alert */}
                {duplicateGroups.length > 0 && (
                    <div className="relative group">
                        <button
                            onClick={handleDuplicateAlertClick}
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 border border-yellow-300 hover:bg-yellow-200 transition-colors"
                        >
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </button>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Found likely duplicate tasks, click here to view
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                )}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                type="text"
                placeholder="Search by title..."
                value={titleSearchTerm}
                onChange={(e) => setTitleSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                type="text"
                placeholder="Search by site..."
                value={siteSearchTerm}
                onChange={(e) => setSiteSearchTerm(e.target.value)}
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
            
            <div className="relative flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button
                    type="button"
                    onClick={() =>
                        handleSortOrderChange(sorting.sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    aria-label={`Sort ${sorting.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                    {sorting.sortOrder === 'asc' ? (
                        <ArrowUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ArrowDown className="h-5 w-5 text-gray-500" />
                    )}
                </button>
                <select
                    value={sorting.sortBy}
                    onChange={(e) => handleSortFieldChange(e.target.value)}
                >
                    <option value="createdAt">Created Date</option>
                    <option value="updatedAt">Updated Date</option>
                    <option value="title">Title</option>
                    <option value="site">Site</option>
                    <option value="status">Status</option>
                    <option value="severity">Severity</option>
                </select>
            </div>
            </div>
        </div>

        {/* Duplicate View Status */}
        {showingDuplicates && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                                Viewing Duplicate Set {currentDuplicateIndex + 1} of {duplicateGroups.length}
                            </h3>
                            <p className="text-sm text-yellow-700">
                                Showing {issues.length} duplicate issues with same title and site
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {duplicateGroups.length > 1 && (
                            <button
                                onClick={handleDuplicateAlertClick}
                                className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                            >
                                Next Set
                            </button>
                        )}
                        <button
                            onClick={handleBackToAllIssues}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Back to All Issues
                        </button>
                    </div>
                </div>
            </div>
        )}

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
                    debouncedTitleSearch !== '' || debouncedSiteSearch !== '' || otherFilters.status !== '' || otherFilters.severity !== '' ? 'No issues found. Check your filters.' : 'No issues found. Create your first issue to get started.'
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
        {!showingDuplicates && (
            <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        )}

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