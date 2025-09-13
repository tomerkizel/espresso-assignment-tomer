# Espresso Assignment - Issue Tracking System - Tomer Kizel

A full-stack web application for tracking and managing issues. Built with React frontend and Node.js/Express backend with MySQL database.

## Features

- Create, read, update, and delete issues
- Bulk import issues via CSV upload
- Filter issues by status, severity, title and site
- Pagination support for large datasets
- Real-time issue counts and statistics
- Responsive web interface

## Technology Stack

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- Sequelize ORM
- MySQL database
- Multer (file uploads)
- CSV Parser

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (version 16 or higher)
- npm package manager
- local MySQL server with username=root, db=espresso and no password

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tomerkizel/espresso-assignment-tomer.git
cd espresso_assignment
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application Locally

### 1. Start the Backend Server

```bash
cd server
npm run dev
```

The backend server will start on `http://localhost:3000`

### 2. Start the Frontend Development Server

Open a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the Application

Open your browser and navigate to `http://localhost:5173`

## API Endpoints

The backend provides the following REST API endpoints:

### Health Check
- **GET** `/health` - Server health check
- **GET** `/api/health` - API health check

### Issues Management

#### Get All Issues
```http
GET /api/issues
```

Query parameters:
- `filters`: (optional) JSON object containing 
```json
    {
        "title": "(optional String) Search title",
        "page": "(optional Number): Page number for pagination",
        "limit": "(optional Number): Number of items per page",
        "status": "(optional `open` | `in_progress` | `resolved`): Filter by status",
        "severity": "(optional `minor` | `major` | `critical`): Filter by severity ",
        "site": "(optional String): Filter by site name",
        "sortOrder": "(optional `asc` | `desc`): Sorting order ",
        "sortBy": "(optional String): Issue field to sort by"
    }
```
**Example:**
```bash
curl "http://localhost:3000/api/issues?page=1&limit=10&status=open"
```

#### Get Issue Counts
```http
GET /api/issues/count
```

**Example:**
```bash
curl "http://localhost:3000/api/issues/count"
```

**Response:**
```json
{
  "total": 150,
  "byStatus": {
    "open": 45,
    "in_progress": 30,
    "resolved": 75
  },
  "bySeverity": {
    "minor": 80,
    "major": 50,
    "critical": 20
  }
}
```

#### Create New Issue
```http
POST /api/issues
Content-Type: application/json
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/issues" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login page not responsive",
    "description": "The login form breaks on mobile devices",
    "site": "main-site",
    "status": "open",
    "severity": "major"
  }'
```

#### Update Issue
```http
PUT /api/issues?id={issueId}
Content-Type: application/json
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/issues?id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "description": "Updated description"
  }'
```

#### Delete Issue
```http
DELETE /api/issues?id={issueId}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/issues?id=1"
```

#### Bulk Import Issues (CSV)
```http
POST /api/issues/bulk
Content-Type: multipart/form-data
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/issues/bulk" \
  -F "file=@issues.csv"
```

CSV format should include columns: `title`, `description`, `site`, `status`, `severity`

## Project Structure

```
espresso_assignment/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── IssueCard.jsx
│   │   │   ├── IssueForm.jsx
│   │   │   ├── IssueList.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── Pagination.jsx
│   │   ├── services/        # API service layer
│   │   └── assets/          # Static assets
│   ├── dist/               # Built frontend files
│   └── package.json
├── server/                  # Express.js backend
│   ├── controllers/         # Request handlers
│   ├── routers/            # API routes
│   ├── services/           # Business logic
│   ├── db/                 # Database layer
│   │   ├── models/         # Sequelize models
│   │   └── service/        # Database services
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── package.json
├── issues.csv              # Sample CSV file
└── README.md
```

## Database Schema

### Issues Table
- `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- `title` (STRING, NOT NULL)
- `description` (TEXT, NOT NULL)
- `site` (STRING, NULLABLE)
- `status` (ENUM: 'open', 'in_progress', 'resolved')
- `severity` (ENUM: 'minor', 'major', 'critical')
- `createdAt` (DATE)
- `updatedAt` (DATE)

## Development

### Backend Development
- The server uses nodemon for auto-restart during development
- Database connection is configured for MySQL
- CORS is enabled for localhost:5173 (frontend dev server)

### Frontend Development
- Hot module replacement enabled via Vite
- ESLint configured for code quality
- Tailwind CSS for styling
- Component-based architecture

## Production Deployment

### Backend
1. ECS task + Cloudfront

### Frontend
1. S3 hosting + Cloudfront
