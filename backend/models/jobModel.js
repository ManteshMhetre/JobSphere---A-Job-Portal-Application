import { DataTypes } from 'sequelize';
import { connectToDatabase } from '../database/serverless-pg-connection.js';

// Get the sequelize instance
const sequelize = await connectToDatabase();

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jobType: {
        type: DataTypes.ENUM('Full-time', 'Part-time'),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    introduction: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    responsibilities: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    qualifications: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    offers: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hiringMultipleCandidates: {
        type: DataTypes.ENUM('Yes', 'No'),
        defaultValue: 'No'
    },
    personalWebsiteTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    personalWebsiteUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jobNiche: {
        type: DataTypes.STRING,
        allowNull: false
    },
    newsLettersSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    jobPostedOn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    postedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
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
    tableName: 'jobs',
    timestamps: true
});

export { Job };