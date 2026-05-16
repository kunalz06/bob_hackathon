# Smart Attendance System - Architecture Documentation

## System Overview

The Smart Attendance System is a full-stack web application built with a modern architecture separating concerns between frontend and backend layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Application (Vite)                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Pages    │  │ Components │  │  Context   │    │  │
│  │  │  - Login   │  │  - Navbar  │  │  - Auth    │    │  │
│  │  │  - Dashboard│  │  - Protected│ │           │    │  │
│  │  │  - Students│  │    Route   │  │           │    │  │
│  │  │  - Attendance│ │           │  │           │    │  │
│  │  │  - Reports │  │           │  │           │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │         Axios API Client                    │    │  │
│  │  │  - JWT Token Management                     │    │  │
│  │  │  - Request/Response Interceptors            │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Express.js Server                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Routes   │  │Controllers │  │ Middleware │    │  │
│  │  │  - Auth    │  │  - Auth    │  │  - JWT     │    │  │
│  │  │  - Students│  │  - Students│  │  - CORS    │    │  │
│  │  │  - Teachers│  │  - Teachers│  │  - Error   │    │  │
│  │  │  - Subjects│  │  - Subjects│  │           │    │  │
│  │  │  - Attendance│ │ - Attendance│ │           │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SQLite Database                          │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │  │
│  │  │ Users  │  │Students│  │Teachers│  │Subjects│   │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘   │  │
│  │  ┌────────────────────────────────────────────┐   │  │
│  │  │          Attendance Records                 │   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: UI library for building component-based interfaces
- **Vite**: Fast build tool and development server
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **better-sqlite3**: SQLite database driver
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **csv-writer**: CSV export functionality
- **cors**: Cross-origin resource sharing

### Testing
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Students Table
```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  class TEXT NOT NULL,
  section TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Teachers Table
```sql
CREATE TABLE teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  department TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Subjects Table
```sql
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  class TEXT NOT NULL,
  teacher_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
)
```

### Attendance Table
```sql
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late')),
  marked_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE(student_id, subject_id, date)
)
```

## Authentication Flow

1. **Login Request**: User submits credentials to `/api/auth/login`
2. **Credential Verification**: Backend validates username and password
3. **Token Generation**: JWT token created with user info (id, username, role)
4. **Token Storage**: Frontend stores token in localStorage
5. **Authenticated Requests**: Token sent in Authorization header
6. **Token Verification**: Middleware validates token on protected routes
7. **Role Authorization**: Additional check for role-specific routes

## API Architecture

### RESTful Design Principles
- Resource-based URLs
- HTTP methods for CRUD operations
- JSON request/response format
- Stateless authentication with JWT
- Consistent error responses

### Middleware Stack
1. **CORS**: Enable cross-origin requests
2. **Body Parser**: Parse JSON request bodies
3. **Authentication**: Verify JWT tokens
4. **Authorization**: Check user roles
5. **Error Handler**: Catch and format errors

## Frontend Architecture

### Component Hierarchy
```
App
├── AuthProvider (Context)
│   ├── LoginPage
│   └── ProtectedRoute
│       ├── Navbar
│       ├── DashboardPage
│       ├── StudentsPage (Admin only)
│       ├── AttendanceMarkPage (Teacher/Admin)
│       └── ReportsPage
```

### State Management
- **Authentication State**: Managed by AuthContext
- **Component State**: Local state with useState
- **API State**: Managed per component with useEffect

### Routing Strategy
- Public routes: `/login`
- Protected routes: All others
- Role-based routes: Admin-only, Teacher-only
- Redirect logic: Unauthenticated → Login, Authenticated → Dashboard

## Security Considerations

### Backend Security
- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- SQL injection prevention (prepared statements)
- Input validation on all endpoints
- Role-based access control

### Frontend Security
- Token stored in localStorage
- Automatic token refresh on API calls
- Protected routes with authentication check
- Role-based component rendering
- XSS prevention (React's built-in escaping)

## Performance Optimizations

### Backend
- Database indexes on frequently queried fields
- Prepared statements for query reuse
- Efficient JOIN queries
- Pagination support (can be added)

### Frontend
- Code splitting with React Router
- Lazy loading of components (can be added)
- Optimized re-renders with React hooks
- Tailwind CSS purging for smaller bundle

## Scalability Considerations

### Current Limitations
- SQLite (single-file database)
- No caching layer
- No load balancing
- No horizontal scaling

### Future Improvements
- Migrate to PostgreSQL/MySQL
- Add Redis for caching
- Implement API rate limiting
- Add database connection pooling
- Containerize with Docker
- Deploy with load balancer

## Error Handling

### Backend
- Try-catch blocks in all controllers
- Centralized error handling middleware
- Consistent error response format
- HTTP status codes for different errors

### Frontend
- API error interceptors
- User-friendly error messages
- Fallback UI for errors
- Console logging for debugging

## Testing Strategy

### Backend Tests
- Unit tests for controllers
- Integration tests for API endpoints
- Authentication flow tests
- Database operation tests

### Frontend Tests
- Component rendering tests (can be added)
- User interaction tests (can be added)
- Routing tests (can be added)

## Deployment Architecture

### Development
- Backend: `npm run dev` (port 3001)
- Frontend: `npm run dev` (port 5173)
- Database: Local SQLite file

### Production (Recommended)
- Backend: PM2 or Docker container
- Frontend: Static build served by Nginx
- Database: PostgreSQL with backups
- Reverse proxy: Nginx
- SSL/TLS: Let's Encrypt

## File Organization

### Backend Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── routes/          # Route definitions
│   ├── scripts/         # Utility scripts
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── __tests__/          # Test files
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React contexts
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
└── package.json
```

## Built by IBM Bob

This project was generated using **BobForge**, demonstrating IBM Bob's capability to:
- Design complete system architecture
- Generate production-ready code
- Implement best practices
- Create comprehensive documentation
- Build full-stack applications from requirements