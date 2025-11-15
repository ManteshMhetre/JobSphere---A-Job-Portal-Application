# NaukriWala - Job Portal

A full-stack job portal application built with React.js frontend and Node.js backend using PostgreSQL database.

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (Neon DB recommended)

### 1. Get PostgreSQL Database URL

#### Option A: Using Neon DB (Recommended - Free)
1. Go to [Neon.tech](https://neon.tech/)
2. Sign up for a free account
3. Create a new project
4. Copy your connection string from the dashboard
   - It should look like: `postgresql://username:password@host:port/database?sslmode=require`

#### Option B: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database
3. Get your connection string: `postgresql://username:password@localhost:5432/your_database`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create config file
# Edit backend/config/config.env and add your database URL:
DATABASE_URL=your_postgresql_connection_string_here
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
PORT=4000
NODE_ENV=development

# Required for file uploads (get from Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 📝 Environment Variables

Create `backend/config/config.env` with the following variables:

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT (REQUIRED)
JWT_SECRET=your_super_secure_random_string_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Server
PORT=4000
NODE_ENV=development

# File Upload (REQUIRED for resume uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Optional - for newsletters)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Cron Jobs
RUN_CRON=true
```

## 🗄️ Database

The application uses PostgreSQL with the following main tables:
- `users` - User accounts (job seekers and employers)
- `jobs` - Job postings
- `applications` - Job applications
