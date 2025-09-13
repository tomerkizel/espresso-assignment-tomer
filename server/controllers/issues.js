import IssuesService from '../services/issues.js';
import { InvalidParameterError } from '../utils/errors.js';
import { CSVParser } from '../utils/csvParser.js';
import _ from 'lodash';

export default class IssuesController {
    constructor() {
        this.issuesService = new IssuesService();
    }

    getIssuesController = async ({ filters }) => {
        const issues = await this.issuesService.getFilteredIssues(JSON.parse(filters));
        return issues;
    }

    getIssuesCountsController = async () => {
        const { grouppedBySeverity, grouppedByStatus } = await this.issuesService.mapIssuesCounts();

        return {
            severity: grouppedBySeverity.reduce((acc, curr) => {
                acc[curr.severity] = parseInt(curr.count);
                return acc;
            }, {}),
            status: grouppedByStatus.reduce((acc, curr) => {
                acc[curr.status] = parseInt(curr.count);
                return acc;
            }, {}),
        };
    }

    createNewIssueController = async (issue) => {
        const { title, description, site = null, severity = null, status = null } = issue;
        if(!title || !description) {
            throw new InvalidParameterError('Title and description are required');
        }
        const newIssue = await this.issuesService.createNewIssue({ title, description, site, severity, status });
        return newIssue;
    }

    updateIssueController = async (id, issue) => {
        const { title = null, description = null, site = null, severity = null, status = null } = issue;
        if(!id) {
            throw new InvalidParameterError('Id is required');
        }
        const updatedIssue = await this.issuesService.updateIssue(id, _.omitBy({ title, description, site, severity, status }, _.isNil));
        return updatedIssue;
    }

    deleteIssueController = async (id) => {
        if(!id) {
            throw new InvalidParameterError('Id is required');
        }
        const deletedIssue = await this.issuesService.deleteIssue(id);
        return deletedIssue;
    }

    bulkCreateIssuesController = async (data, file = null) => {
        let issues;
        
        if (file) {
            // Handle CSV file upload
            if (!file.buffer) {
                throw new InvalidParameterError('No file data received');
            }
            try {
                issues = await CSVParser.parseIssuesCSV(file.buffer);
            } catch (error) {
                throw new InvalidParameterError(`CSV parsing error: ${error.message}`);
            }
        } else {
            // Handle direct JSON data (existing functionality)
            issues = data;
        }

        if (!Array.isArray(issues) || issues.length === 0) {
            throw new InvalidParameterError('No valid issues provided');
        }

        // Validate each issue
        for (let i = 0; i < issues.length; i++) {
            const issue = issues[i];
            if (!issue.title || !issue.description) {
                throw new InvalidParameterError(`Issue at row ${i + 1}: Title and description are required`);
            }
        }

        const bulkCreatedIssues = await this.issuesService.bulkCreateIssues(issues);
        return {
            message: `Successfully created ${bulkCreatedIssues.length} issues`,
            created: bulkCreatedIssues.length,
            issues: bulkCreatedIssues
        };
    }
}