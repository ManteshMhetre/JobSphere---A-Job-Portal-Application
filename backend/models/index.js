import { User } from './userModel.js';
import { Job } from './jobModel.js';
import { Application } from './applicationModel.js';
import { connectToDatabase } from '../database/serverless-pg-connection.js';

// Get the sequelize instance
const sequelize = await connectToDatabase();

// Define associations
User.hasMany(Job, {
    foreignKey: 'postedBy',
    as: 'jobs'
});

Job.belongsTo(User, {
    foreignKey: 'postedBy',
    as: 'employer'
});

User.hasMany(Application, {
    foreignKey: 'jobSeekerUserId',
    as: 'applications'
});

User.hasMany(Application, {
    foreignKey: 'employerUserId',
    as: 'receivedApplications'
});

Job.hasMany(Application, {
    foreignKey: 'jobId',
    as: 'applications'
});

Application.belongsTo(User, {
    foreignKey: 'jobSeekerUserId',
    as: 'jobSeeker'
});

Application.belongsTo(User, {
    foreignKey: 'employerUserId',
    as: 'employer'
});

Application.belongsTo(Job, {
    foreignKey: 'jobId',
    as: 'job'
});

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true }); // Use alter: true for development, force: false for production
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Database synchronization error:', error);
    }
};

export { User, Job, Application, sequelize, syncDatabase };