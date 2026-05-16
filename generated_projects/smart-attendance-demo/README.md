# Smart Attendance System

A comprehensive attendance management system for colleges with role-based dashboards for administrators, teachers, and students.

## 🎯 Features

### Admin Dashboard
- Manage students (add, edit, delete)
- Manage teachers (add, edit, delete)
- Manage subjects and class assignments
- View comprehensive attendance reports
- Export attendance data as CSV

### Teacher Dashboard
- Mark attendance for assigned classes
- Bulk attendance marking
- View attendance reports
- Export attendance data

### Student Dashboard
- View personal attendance records
- Track attendance by subject
- View attendance statistics

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **csv-writer** for CSV export
- **Jest** and **Supertest** for testing

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project Directory

```bash
cd generated_projects/smart-attendance-demo
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (or use defaults):

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed the Database

```bash
npm run seed
```

This will create:
- 1 admin user
- 3 teachers
- 8 students
- 6 subjects
- Sample attendance records for the last 7 days

### 4. Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

### 6. Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👤 Default Credentials

After seeding the database, use these credentials to login:

### Admin
- **Username:** `admin`
- **Password:** `password123`

### Teacher
- **Username:** `teacher1`
- **Password:** `password123`

### Student
- **Username:** `student1`
- **Password:** `password123`

## 🧪 Running Tests

Backend tests are available for authentication, students, and attendance:

```bash
cd backend
npm test
```

## 📁 Project Structure

```
smart-attendance-demo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database configuration
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── studentController.js # Student management
│   │   │   ├── teacherController.js # Teacher management
│   │   │   ├── subjectController.js # Subject management
│   │   │   └── attendanceController.js # Attendance operations
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── teacherRoutes.js
│   │   │   ├── subjectRoutes.js
│   │   │   └── attendanceRoutes.js
│   │   ├── scripts/
│   │   │   └── seed.js              # Database seeding script
│   │   ├── app.js                   # Express app configuration
│   │   └── server.js                # Server entry point
│   ├── __tests__/                   # Test files
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StudentsPage.jsx
│   │   │   ├── AttendanceMarkPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── utils/
│   │   │   └── api.js               # Axios configuration
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create teacher (Admin only)
- `PUT /api/teachers/:id` - Update teacher (Admin only)
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Attendance
- `POST /api/attendance/mark` - Mark single attendance (Teacher/Admin)
- `POST /api/attendance/bulk-mark` - Mark bulk attendance (Teacher/Admin)
- `GET /api/attendance/report` - Get attendance report
- `GET /api/attendance/student/:studentId` - Get student attendance
- `GET /api/attendance/export/csv` - Export attendance as CSV (Teacher/Admin)

## 🎨 Features Implemented

✅ JWT-based authentication  
✅ Role-based access control (Admin, Teacher, Student)  
✅ Student management (CRUD operations)  
✅ Teacher management (CRUD operations)  
✅ Subject management (CRUD operations)  
✅ Attendance marking (single and bulk)  
✅ Attendance reports with filters  
✅ CSV export functionality  
✅ Responsive UI with Tailwind CSS  
✅ Protected routes  
✅ Backend tests (Auth, Students, Attendance)  

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes
- Role-based authorization
- SQL injection prevention with prepared statements

## 📝 Notes

- This is an MVP (Minimum Viable Product) built for demonstration purposes
- SQLite is used for simplicity; consider PostgreSQL or MySQL for production
- All passwords in seed data are hashed
- The system supports three user roles: admin, teacher, and student

## 🤝 Contributing

This project was generated by **BobForge** - an AI-powered blueprint-to-code generator.

## 📄 License

MIT

## 🆘 Troubleshooting

### Backend won't start
- Ensure port 3001 is not in use
- Check if `.env` file exists
- Run `npm install` again

### Frontend won't start
- Ensure port 5173 is not in use
- Check if backend is running
- Run `npm install` again

### Database errors
- Delete `database.sqlite` and run `npm run seed` again
- Check file permissions

### Login issues
- Ensure you're using the correct credentials from the seed data
- Check browser console for errors
- Verify backend is running and accessible

## 📧 Support

For issues or questions, please refer to the documentation files:
- `ARCHITECTURE.md` - System architecture details
- `API_DOCUMENTATION.md` - Complete API reference
- `TEST_PLAN.md` - Testing strategy and coverage