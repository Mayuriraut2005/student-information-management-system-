# Design and Deployment of a Three-Tier Web Application Using Netlify, Render, and MongoDB Atlas

**Course:** Cloud Computing CA2 Practical Evaluation  
**Project Title:** Student Information Management System (SIMS)  
**Architecture:** Three-Tier Decoupled Cloud Architecture  

---

## 🏛️ System Architecture

The application strictly implements the **Three-Tier Architecture** pattern where the presentation layer, business logic layer, and database layer are hosted independently across specialized cloud platforms:

```
[ User Browser ]
       ↓ HTTPS
[ Tier 1: Presentation Tier ]  --> Netlify (HTML5, CSS3, Vanilla JavaScript)
       ↓ HTTPS REST API
[ Tier 2: Application Tier ]   --> Render Web Service (Node.js & Express REST API)
       ↓ Encrypted Mongoose TLS
[ Tier 3: Database Tier ]      --> MongoDB Atlas Cloud Cluster (studentDB.students)
```

```
[ Antigravity IDE (Local Dev) ]
       ↓ Read-Only Stdio
[ Official MongoDB MCP Server ] --> Directly inspects studentDB schema during development
```

---

## 📁 Project Directory Structure

```
student-information-management-system/
├── frontend/                     # Tier 1: Presentation Tier (Netlify)
│   ├── index.html                # Dashboard with system metrics & quick actions
│   ├── students.html             # Students directory with search & filters
│   ├── add-student.html          # Student registration form
│   ├── edit-student.html         # Student update form
│   ├── css/
│   │   └── style.css             # Responsive styling & themes
│   ├── js/
│   │   ├── config.js             # API base URL configuration (dev / prod)
│   │   ├── api.js                # Reusable fetch client & toast notifications
│   │   ├── students.js           # Directory table logic & modals
│   │   └── form.js               # Form validation & submission handlers
│   └── netlify.toml              # Netlify publish & security header configuration
├── backend/                      # Tier 2: Application Tier (Render Web Service)
│   ├── server.js                 # Express server & CORS configuration
│   ├── package.json              # Node.js dependencies & scripts
│   ├── .env.example              # Sanitized environment template
│   ├── config/
│   │   └── database.js           # Mongoose MongoDB Atlas connection
│   ├── models/
│   │   └── Student.js            # Mongoose Schema & validation rules
│   ├── routes/
│   │   └── studentRoutes.js      # REST API route endpoints
│   ├── controllers/
│   │   └── studentController.js  # CRUD business logic & health checks
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralized error handler (400, 404, 409, 500)
│   │   └── notFound.js           # 404 resource handler
│   └── tests/
│       └── students.test.js      # 14 automated integration tests (Jest + Supertest)
├── docs/                         # Academic Evaluation Documentation
│   ├── architecture.md           # System architecture & Mermaid sequence diagrams
│   ├── testing.md                # 14/14 automated test report & execution log
│   └── viva-questions.md         # 18 high-yield CA2 viva questions & model answers
├── .gitignore                    # Excludes node_modules and .env secrets
└── README.md                     # Comprehensive project documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology | Hosting Platform | Key Responsibility |
|---|---|---|---|
| **Tier 1: Presentation** | HTML5, CSS3, Vanilla JS | [Netlify](https://www.netlify.com/) | User interface, responsive tables, forms, validation feedback |
| **Tier 2: Application** | Node.js, Express.js | [Render](https://render.com/) | REST API, CORS security, business logic, Mongoose ODM |
| **Tier 3: Database** | MongoDB Atlas (NoSQL) | [MongoDB Atlas](https://www.mongodb.com/) | Persistent cloud storage (`studentDB.students`), unique indexes |
| **Dev-Time AI Tool** | `mongodb-mcp-server` | Antigravity IDE | Schema inspection & database verification in read-only mode |

---

## 📡 REST API Reference

All responses return standard JSON format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Health check verifying API & Atlas DB connection | `200`, `503` |
| `GET` | `/api/students` | Get all students (supports `?search=`, `?department=`, `?semester=`) | `200` |
| `GET` | `/api/students/:id` | Get single student by MongoDB `_id` or `studentId` | `200`, `404` |
| `POST` | `/api/students` | Register a new student (validates format & uniqueness) | `201`, `400`, `409` |
| `PUT` | `/api/students/:id` | Update existing student record | `200`, `400`, `404`, `409` |
| `DELETE` | `/api/students/:id` | Delete student record after confirmation | `200`, `404` |

---

## 💻 Local Development Setup (Windows / VS Code)

### Prerequisites:
- **Node.js:** v18.0.0 or higher (Installed: v24.22.0)
- **Git:** Installed (v2.56.0)
- **MongoDB Atlas Account:** Free Tier cluster (M0 Sandbox)

### Step 1: Clone or Navigate to Project
```powershell
cd C:\Users\NIKUNJ\.gemini\antigravity\scratch\student-information-management-system
```

### Step 2: Configure Backend Environment
Navigate into the `backend` folder and create your `.env` file:
```powershell
cd backend
copy .env.example .env
```
Edit `.env` and configure your credentials:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/studentDB?retryWrites=true&w=majority
FRONTEND_URL=http://127.0.0.1:5500,http://localhost:5500,http://localhost:8080
```

### Step 3: Install Backend Dependencies
```powershell
npm.cmd install
```

### Step 4: Run Automated Tests
Verify all 14 integration tests pass against the live database:
```powershell
npm.cmd test
```

### Step 5: Start the Backend Server
```powershell
npm.cmd start
```
The server will start on `http://localhost:5000`. Test the health check endpoint:
👉 Open in browser: `http://localhost:5000/api/health`

### Step 6: Serve the Frontend
Open another terminal in VS Code:
```powershell
cd ..\frontend
# Using VS Code Live Server extension (Right-click index.html -> "Open with Live Server")
# OR using a simple static server:
npx.cmd -y serve . -p 5500
```
Open `http://127.0.0.1:5500` in your web browser.

---

## 🚀 Cloud Deployment Guide

### 1. MongoDB Atlas Setup (Tier 3)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create an **M0 Free Shared Cluster** (e.g. AWS Mumbai region `ap-south-1`).
3. Under **Security > Database Access**:
   - Create a database user (e.g., `studentAdmin`) with `Read and write to any database` privileges.
4. Under **Security > Network Access**:
   - Add IP Address `0.0.0.0/0` (Allow access from anywhere, required for dynamic cloud containers on Render).
5. Click **Connect > Drivers > Node.js** and copy your connection string:
   ```text
   mongodb+srv://studentAdmin:<password>@cluster0.abcde.mongodb.net/studentDB?retryWrites=true&w=majority
   ```

### 2. Render Web Service Deployment (Tier 2)
1. Push your repository to **GitHub** (see Git instructions below).
2. Log in to [Render](https://render.com/) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Name:** `student-backend-service`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In the **Environment Variables** section, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *[Your real Atlas connection string with /studentDB]*
   - `FRONTEND_URL`: *[Your Netlify domain e.g. `https://student-management-cse.netlify.app`]*
6. Click **Deploy Web Service**.
7. Once deployed, test your live endpoint: `https://<render-service-name>.onrender.com/api/health`.

### 3. Netlify Deployment (Tier 1)
1. In `frontend/js/config.js`, update `API_BASE_URL` with your live Render backend URL:
   ```javascript
   return 'https://<your-render-service>.onrender.com/api';
   ```
2. Log in to [Netlify](https://www.netlify.com/) and click **Add new site > Import an existing project**.
3. Select your GitHub repository.
4. Set the build settings:
   - **Base directory:** `frontend`
   - **Publish directory:** `frontend` (or `.` if base directory is `frontend`)
   - **Build command:** *(Leave blank for static HTML/JS)*
5. Click **Deploy Site**.
6. Netlify will generate a live URL (e.g., `https://student-management-cse.netlify.app`).
7. Update `FRONTEND_URL` on Render to match your exact Netlify domain to satisfy CORS security rules!

---

## 🐙 GitHub Version Control

Initialize Git and commit the project safely without committing secrets:

```powershell
cd C:\Users\NIKUNJ\.gemini\antigravity\scratch\student-information-management-system

# Initialize Git
git init

# Verify that .env and node_modules are ignored
git status

# Stage and commit clean project files
git add .
git commit -m "feat: complete three-tier Student Information Management System for CA2"

# Link to GitHub and push
git branch -M main
git remote add origin https://github.com/<your-username>/student-information-management-system.git
git push -u origin main
```

---

