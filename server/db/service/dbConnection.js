import { Sequelize } from 'sequelize';

class DbConnection {
    static instance = new DbConnection();

    constructor() {
        this.sequelize = null;
    }

    init = async () => {
        this.sequelize = new Sequelize({
            dialect: 'mysql',
            host: process.env.DB_HOST,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'espresso',
            // dialectOptions: {
            //     ssl: { rejectUnauthorized: false },
            // },
            logging: false,
        });

        try {
            await this.sequelize.authenticate();
            console.log('[dbConnection] init > Database connection established successfully');
        } catch (error) {
            console.log('[dbConnection] init > Unable to connect to the database:', error);
            throw error;
        }
    };

    execute = async ({ query, values = undefined, timeout = 10 * 60 * 1000 }) => {
        try {
            const result = await this.sequelize.query(query, {
                raw: true,
                nest: true,
                replacements: values,
                timeout,
            });
            return result;
        } catch (err) {
            if (err.name === 'SequelizeTimeoutError' || err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
                console.log(`[dbConnection] execute > sql query timed out after ${timeout}ms (${err.message || ''})`);
                throw new Error(`[dbConnection] execute > sql query timed out after ${timeout}ms (${err.message || ''})`);
            }
            console.log(`[dbConnection] execute > Unhandled SQL Exception:\n ${err.message} ${err.stack}`);
            throw err;
        }
    };

    getSequelize = () => {
        return this.sequelize;
    };

}

export default DbConnection.instance;