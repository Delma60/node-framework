export default {
    // The default database driver to use
    default: process.env.DB_CONNECTION || 'mysql',

    // Define all possible connections here
    connections: {
        mysql: {
            driver: 'mysql',
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            database: process.env.DB_DATABASE || 'backend',
            user: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
        },
        postgres: {
            driver: 'postgres',
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
            database: process.env.DB_DATABASE || 'forge',
            user: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '',
        },
        sqlite: {
            driver: 'sqlite',
            database: process.env.DB_DATABASE || './database/database.sqlite',
        }
    }
};
