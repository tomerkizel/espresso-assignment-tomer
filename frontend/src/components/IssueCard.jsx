import React from 'react';
import { Edit, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const IssueCard = ({ issue, onDelete, onResolve, onEdit }) => {
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
            default: return <AlertCircle className="h-4 w-4" />;
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(issue?.status)}`}>
                            {getStatusIcon(issue?.status)}
                            <span className="ml-1 capitalize">
                                {issue?.status ? issue.status.replace('_', ' ') : 'No status'}
                            </span>
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
                            onClick={() => onResolve(issue)}
                            className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Resolve
                        </button>
                    )}
                    
                    <button
                        onClick={() => onEdit(issue)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </button>
                    
                    <button
                        onClick={() => onDelete(issue.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
