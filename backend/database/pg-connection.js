import { Sequelize } from 'sequelize';

// Create a cached connection variable
let cachedConnection = null;

export const connection = async () => {
    // If we already have a connection, return it
    if (cachedConnection) {
        console.log("Using cached database connection.");
        return cachedConnection;
    }
    
    try {
        // Create new Sequelize instance for Neon DB
        cachedConnection = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false // For Neon DB
                }
            },
            pool: {
                max: 10,
                min: 1,
                acquire: 30000,
                idle: 10000
            },
            logging: process.env.NODE_ENV === 'development' ? console.log : false
        });

        // Test the connection
        await cachedConnection.authenticate();
        console.log("Connected to PostgreSQL database successfully.");
        
        return cachedConnection;
    } catch (err) {
        console.error(`Database connection error: ${err}`);
        cachedConnection = null;
        throw err;
    }
};

export default connection;