import { DataTypes } from 'sequelize';
import validator from 'validator';
import { connectToDatabase } from '../database/serverless-pg-connection.js';

// Get the sequelize instance
const sequelize = await connectToDatabase();

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    // Job Seeker Info
    jobSeekerUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    jobSeekerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jobSeekerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: {
                msg: "Please provide a valid email."
            }
        }
    },
    jobSeekerPhone: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    jobSeekerAddress: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    resumePublicId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resumeUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    coverLetter: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    jobSeekerRole: {
        type: DataTypes.ENUM('Job Seeker'),
        allowNull: false
    },
    
    // Employer Info
    employerUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    employerRole: {
        type: DataTypes.ENUM('Employer'),
        allowNull: false
    },
    
    // Job Info
    jobId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'jobs',
            key: 'id'
        }
    },
    jobTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    // Deletion flags
    deletedByJobSeeker: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    deletedByEmployer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'applications',
    timestamps: true
});

export { Application };