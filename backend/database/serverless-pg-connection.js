import { Sequelize } from 'sequelize';

let cachedDb = null;

/**
 * This function handles PostgreSQL connection caching specifically for serverless environments
 * It ensures we don't create multiple connections on cold starts or frequent function invocations
 */
export async function connectToDatabase() {
    if (cachedDb) {
        try {
            // Test the existing connection
            await cachedDb.authenticate();
            console.log("Using cached database connection");
            return cachedDb;
        } catch (error) {
            console.log("Cached connection failed, creating new connection");
            cachedDb = null;
        }
    }

    console.log("Creating new database connection");
    
    try {
        // Create new Sequelize instance for Neon DB (serverless optimized)
        cachedDb = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false // For Neon DB
                }
            },
            pool: {
                max: 2,  // Smaller pool for serverless
                min: 0,
                acquire: 30000,
                idle: 5000
            },
            logging: false // Disable logging in serverless
        });

        // Test the connection
        await cachedDb.authenticate();
        console.log("Connected to PostgreSQL database");
        
        return cachedDb;
    } catch (error) {
        console.error("PostgreSQL connection error:", error);
        cachedDb = null;
        throw error;
    }
}

/**
 * Check if the database connection is healthy
 */
export async function checkDatabaseConnection() {
    try {
        if (!cachedDb) {
            await connectToDatabase();
        }
        
        // Test the connection
        await cachedDb.authenticate();
        return { connected: true, status: 'Connection healthy' };
    } catch (error) {
        return { connected: false, status: `Connection error: ${error.message}` };
    }
}

export { cachedDb };