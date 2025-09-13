import { getIssuesService } from '../db/index.js';
import { Op, Sequelize } from 'sequelize';
import _ from 'lodash';

export default class IssuesService {
    constructor() {
        this.issuesService = getIssuesService();
    }

    getFilteredIssues = async (filters) => {
        const { 
            title = '', 
            status = '', 
            severity = '', 
            site = '',
            sortBy = 'createdAt', 
            sortOrder = 'desc', 
            page = 1, 
            limit = 20 
        } = filters;
        
        const where = _.omitBy({
            title: _.isEmpty(title) ? undefined : { [Op.like]: `%${title}%` },
            status: _.isEmpty(status) ? undefined : status,
            severity: _.isEmpty(severity) ? undefined : severity,
            site: _.isEmpty(site) ? undefined : { [Op.like]: `%${site}%` },
        }, _.isNil);
        
        // Build custom order for severity and status fields
        let orderClause;
        if (sortBy === 'severity') {
            const severityOrder = sortOrder.toLowerCase() === 'asc' 
                ? "CASE WHEN severity = 'critical' THEN 1 WHEN severity = 'major' THEN 2 WHEN severity = 'minor' THEN 3 ELSE 4 END"
                : "CASE WHEN severity = 'critical' THEN 1 WHEN severity = 'major' THEN 2 WHEN severity = 'minor' THEN 3 ELSE 4 END DESC";
            orderClause = [[Sequelize.literal(severityOrder)]];
        } else if (sortBy === 'status') {
            const statusOrder = sortOrder.toLowerCase() === 'asc'
                ? "CASE WHEN status = 'open' THEN 1 WHEN status = 'in_progress' THEN 2 WHEN status = 'resolved' THEN 3 ELSE 4 END"
                : "CASE WHEN status = 'open' THEN 1 WHEN status = 'in_progress' THEN 2 WHEN status = 'resolved' THEN 3 ELSE 4 END DESC";
            orderClause = [[Sequelize.literal(statusOrder)]];
        } else {
            orderClause = [[sortBy, sortOrder]];
        }

        const { count, rows: issues} = await this.issuesService.get({
            where,
            order: orderClause,
            offset: (page - 1) * limit,
            limit,
        });

        const totalPages = Math.ceil(count / limit);
        return {
            issues,
            totalPages,
            currentPage: page,
            totalItems: count,
            limit,
        };
    }

    mapIssuesCounts = async () => {
        const { count: grouppedByStatus } = await this.issuesService.get({
            attributes: [
                [this.issuesService.Issues.sequelize.fn('COUNT', this.issuesService.Issues.sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        const { count: grouppedBySeverity } = await this.issuesService.get({
            attributes: [
                [this.issuesService.Issues.sequelize.fn('COUNT', this.issuesService.Issues.sequelize.col('id')), 'count']
            ],
            group: ['severity'],
            raw: true
        });

        return {
            grouppedByStatus,
            grouppedBySeverity
        };
    }

    createNewIssue = async (issue) => {
        const newIssue = await this.issuesService.create(issue);
        return newIssue;
    }

    updateIssue = async (id, update) => {
        const updatedIssue = await this.issuesService.update(id, update);
        return updatedIssue;
    }

    deleteIssue = async (id) => {
        const deletedIssue = await this.issuesService.delete({ id });
        return deletedIssue;
    }

    bulkCreateIssues = async (issues) => {
        const bulkCreatedIssues = await this.issuesService.bulkCreate(issues);
        return bulkCreatedIssues;
    }
}