import IssuesService from '../services/issues.js';
import { InvalidParameterError } from '../utils/errors.js';
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
}