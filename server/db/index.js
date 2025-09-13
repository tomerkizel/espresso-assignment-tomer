import issuesService from './service/issuesService.js';
import dbConnection from './service/dbConnection.js';
import { initializeModels } from './models/index.js';
let dbInitialized = false;
let issuesServiceInstance = null;

export const initializeDatabase = async () => {
    if (dbInitialized) {
        console.warn('[Sequelize] Database already initialized');
        return;
    }

    try {
        const sequelize = dbConnection.getSequelize();
        if(!sequelize) {
            throw new Error('Sequelize not initialized');
        }
        await sequelize.authenticate();
        console.info('[Sequelize] Database connection established successfully.');

        const { models, syncModels } = initializeModels();

        await syncModels();

        issuesServiceInstance = new issuesService(models.issues);
        dbInitialized = true;

    } catch (error) {
        console.error('[Sequelize] Failed to initialize database:', error);
        throw error;
    }
};

export const getIssuesService = () => {
    if (!dbInitialized || !issuesServiceInstance) {
        throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return issuesServiceInstance;
};