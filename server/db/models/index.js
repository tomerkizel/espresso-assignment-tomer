import Issues from './issues.js';
import dbConnection from '../service/dbConnection.js';

export const initializeModels = () => {
    const sequelize = dbConnection.getSequelize();

    const models = {
        issues: Issues(sequelize),
    };

    const syncModels = async () => {
        try {
            for(const model of Object.values(models)) {
                await model.sync({ alter: true });
            }
            console.info('Database models synchronized successfully');
        } catch (error) {
            console.error('Error synchronizing database models:', error);
            throw error;
        }
    };

    return {
        models,
        syncModels,
    };
};