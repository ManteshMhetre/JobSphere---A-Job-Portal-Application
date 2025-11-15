import express from "express";
import { config } from "dotenv";
config({ path: "./config/config.env" });

import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase, checkDatabaseConnection } from "./database/serverless-pg-connection.js";
import { syncDatabase } from "./models/modelsFixed.js";
import { errorMiddleware } from "./middlewares/error.js";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouterPG.js";
import jobRouter from "./routes/jobRouterPG.js";
import applicationRouter from "./routes/applicationRouterPG.js";
import { newsLetterCron } from "./automation/newsLetterCronPG.js";

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:4000'
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Health check endpoint to verify the API is working
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection using our specialized function
    const dbConnectionStatus = await checkDatabaseConnection();
    
    res.status(200).json({
      success: true,
      message: "Backend API is running successfully!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbConnectionStatus.connected ? 'connected' : 'disconnected',
        message: dbConnectionStatus.status,
        type: 'PostgreSQL'
      },
      postgresInfo: {
        uri: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.replace(/postgresql:\/\/([^:]+):([^@]+)@/, 'postgresql://***:***@') : 
          'Not configured'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Backend API is running but with issues",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Job Portal Backend API is running! Go to /api/health to check status.");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);

// Initialize connection pool and sync database at startup
connectToDatabase()
  .then(async () => {
    await syncDatabase();
    console.log("Database connection and synchronization successful");
  })
  .catch(err => console.error("Initial database setup failed:", err));

// Add middleware to ensure database is connected before processing routes
app.use(async (req, res, next) => {
  // Skip connection check for health endpoints and OPTIONS requests
  if (req.path === '/' || req.path === '/api/health' || req.method === 'OPTIONS') {
    return next();
  }
  
  try {
    // Ensure database connection
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection error in middleware:", err);
    return res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again later.",
      error: err.message
    });
  }
});

// Start cron jobs only in non-serverless environments or explicitly
// In serverless, cron should be handled separately
if (process.env.NODE_ENV !== 'production' || process.env.RUN_CRON === 'true') {
  try {
    newsLetterCron();
  } catch (error) {
    console.error("Error starting cron jobs:", error);
  }
}

app.use(errorMiddleware);

export default app;