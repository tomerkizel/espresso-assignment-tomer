import { Router } from 'express';
import IssuesController from '../controllers/issues.js';
import { uploadCSV, handleUploadError } from '../middleware/upload.js';

export default class IssuesRouter {
    constructor() {
        this.router = Router();
        this.issuesController = new IssuesController();
    }

    userRouter = (app) => {
        this.router.post('/', this.createIssue);
        this.router.put('/', this.updateIssue);
        this.router.delete('/', this.deleteIssue);
        this.router.get('/count', this.getIssuesCounts);
        this.router.get('/', this.getIssues);
        this.router.post('/bulk', uploadCSV, handleUploadError, this.bulkCreateIssues);
        app.use('/api/issues', this.router);
    }

    getIssuesCounts = async (req, res) => {
        try {
            const counts = await this.issuesController.getIssuesCountsController();
            res.json(counts);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    getIssues = async (req, res) => {
        try {
            const issues = await this.issuesController.getIssuesController(req.query);
            res.json(issues);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    createIssue = async (req, res) => {
        try {
            const newIssue = await this.issuesController.createNewIssueController(req.body);
            res.json(newIssue);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    updateIssue = async (req, res) => {
        try {
            const updatedIssue = await this.issuesController.updateIssueController(req.query.id, req.body);
            res.json(updatedIssue);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    deleteIssue = async (req, res) => {
        try {
            const deletedIssue = await this.issuesController.deleteIssueController(req.query.id);
            res.json(deletedIssue);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    bulkCreateIssues = async (req, res) => {
        try {
            const bulkCreatedIssues = await this.issuesController.bulkCreateIssuesController(req.body, req.file);
            res.json(bulkCreatedIssues);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}