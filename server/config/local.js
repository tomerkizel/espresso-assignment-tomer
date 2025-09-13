// Local development configuration
// This file sets environment variables only when running 'npm run dev'

export const loadLocalConfig = () => {
    if (process.env.IS_LOCAL === 'true') {
        process.env.DB_HOST = 'localhost';
        process.env.DB_USER = 'root';
        process.env.DB_PASSWORD = '';
        
        console.log('[Local Config] Development database environment variables loaded');
    }
};
