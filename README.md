# 🚀 Talent Bridge

> An AI-powered Recruitment & Talent Management Platform that streamlines the hiring process through automation, intelligent resume analysis, and professional resume building.

---

## 📖 Overview

Talent Bridge is a full-stack recruitment platform designed to bridge the gap between recruiters and job seekers. It simplifies hiring by automating candidate management, resume screening, and recruitment workflows while providing candidates with powerful tools to build and optimize their resumes.

The platform offers secure role-based access, allowing administrators, recruiters, and candidates to efficiently manage recruitment activities from a single application.

---

## ✨ Features

### 👤 Candidate
- User Registration & Authentication
- AI Resume Builder
- Resume Upload
- Resume Analyzer
- Profile Management
- Job Applications
- Application Tracking

### 💼 Recruiter
- Recruiter Dashboard
- Job Posting & Management
- Candidate Search
- Resume Screening
- Application Management
- Shortlisting Candidates

### 🛠 Admin
- Dashboard & Analytics
- User Management
- Recruiter Management
- Job Management
- Platform Monitoring
- Role-Based Access Control (RBAC)

---

## 🤖 AI Features

- AI Resume Analysis
- Resume Scoring
- Resume Suggestions
- Resume Builder
- Resume Parsing
- Candidate Profile Optimization

---

## 🛠 Tech Stack

### Frontend
- React.js
- Vite
- HTML5
- CSS3
- JavaScript (ES6+)
- Axios

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Authentication
- JWT (JSON Web Tokens)
- Password Hashing (bcrypt)

### APIs & Services
- REST API
- File Upload Handling
- Resume Processing

---

## 📂 Project Structure

```
TalentBridge/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/Encegen-Ai-Labs/TalentBridge-.git
```

```bash
cd TalentBridge-
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🗄 Database Configuration

Create a MySQL database.

Example:

```sql
CREATE DATABASE talent_bridge;
```

Configure your `.env` file inside the backend directory.

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=talent_bridge

JWT_SECRET=your_secret_key
```

---

## ▶️ Running the Application

### Backend

```bash
cd backend
npm start
```

or

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5000
```

---

## 🔐 Authentication

- JWT Authentication
- Secure Password Hashing
- Protected Routes
- Role-Based Authorization

---

## 📌 API Modules

- Authentication
- Users
- Candidates
- Recruiters
- Jobs
- Applications
- Resume Builder
- Resume Analyzer
- Dashboard
- Admin

---

## 🗃 Database

MySQL is used as the primary relational database.

Key entities include:

- Users
- Candidates
- Recruiters
- Jobs
- Applications
- Resumes
- Skills
- Education
- Experience

---

## 🚀 Future Enhancements

- AI Interview Assistant
- Resume Match Score
- Email Notifications
- Interview Scheduling
- Company Profiles
- Real-time Notifications
- Advanced Analytics
- Chat System
- Video Interview Integration

---

## 📸 Screenshots

Add screenshots of the application here.

```
/screenshots/login.png
/screenshots/dashboard.png
/screenshots/resume-builder.png
/screenshots/resume-analyzer.png
```

---

## 👩‍💻 Developed By

**Encegen AI Labs**

Building intelligent solutions powered by AI and modern web technologies.

---

## 📄 License

This project is intended for educational and commercial use by **Encegen AI Labs**. Unauthorized distribution or reproduction without permission is prohibited.

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub!