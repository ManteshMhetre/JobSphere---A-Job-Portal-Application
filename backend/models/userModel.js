import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

let User = null;
let sequelize = null;

export const initUserModel = async (sequelizeInstance) => {
    sequelize = sequelizeInstance;

export const initUserModel = async (sequelizeInstance) => {
    sequelize = sequelizeInstance;

    User = sequelize.define('User', {
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

    // Instance methods
    User.prototype.comparePassword = async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    };

    User.prototype.getJWTToken = function() {
        return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });
    };

    return User;
};

export const getUser = () => User;