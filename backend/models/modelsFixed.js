import { config } from "dotenv";
config({ path: "./config/config.env" });

import { connectToDatabase } from '../database/serverless-pg-connection.js';
import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Initialize sequelize
const sequelize = await connectToDatabase();

// Define User model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
            len: {
                args: [3, 30],
                msg: "Name must contain at least 3 characters and cannot exceed 30 characters."
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Please provide valid email."
            }
        }
    },
    phone: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    firstNiche: {
        type: DataTypes.STRING,
        allowNull: true
    },
    secondNiche: {
        type: DataTypes.STRING,
        allowNull: true
    },
    thirdNiche: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8, 32],
                msg: "Password must contain at least 8 characters and cannot exceed 32 characters."
            }
        }
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
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('Job Seeker', 'Employer'),
        allowNull: false
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
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeSave: async (user, options) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Define Job model
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

// Define Application model
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

// Define associations
User.hasMany(Job, { foreignKey: 'postedBy', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'poster' });

User.hasMany(Application, { foreignKey: 'jobSeekerUserId', as: 'jobSeekerApplications' });
User.hasMany(Application, { foreignKey: 'employerUserId', as: 'employerApplications' });

Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });

Application.belongsTo(User, { foreignKey: 'jobSeekerUserId', as: 'jobSeeker' });
Application.belongsTo(User, { foreignKey: 'employerUserId', as: 'employer' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Instance methods for User
User.prototype.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.getJWTToken = function() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Sync database function
export const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force, alter: !force });
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database:', error);
        throw error;
    }
};

// Export models and sequelize instance
export { 
    sequelize,
    User, 
    Job, 
    Application 
};