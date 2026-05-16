# API Documentation - Smart Attendance System

Base URL: `http://localhost:3001/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

---

## Authentication Endpoints

### POST /auth/login
Login with username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin User",
    "email": "admin@college.edu",
    "role": "admin"
  }
}
```

**Errors:**
- `400` - Missing username or password
- `401` - Invalid credentials

---

### GET /auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "admin",
  "name": "Admin User",
  "email": "admin@college.edu",
  "role": "admin"
}
```

**Errors:**
- `401` - No token provided
- `403` - Invalid token
- `404` - User not found

---

## Student Endpoints

### GET /students
Get all students.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "roll_number": "CS2024001",
    "class": "CS-A",
    "section": "A",
    "user_id": 4,
    "name": "John Smith",
    "email": "john.smith@student.edu",
    "username": "student1"
  }
]
```

---

### GET /students/:id
Get a specific student by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "roll_number": "CS2024001",
  "class": "CS-A",
  "section": "A",
  "user_id": 4,
  "name": "John Smith",
  "email": "john.smith@student.edu",
  "username": "student1"
}
```

**Errors:**
- `404` - Student not found

---

### POST /students
Create a new student. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@student.edu",
  "username": "johndoe",
  "password": "password123",
  "rollNumber": "CS2024001",
  "class": "CS-A",
  "section": "A"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 4,
  "name": "John Doe",
  "email": "john.doe@student.edu",
  "username": "johndoe",
  "rollNumber": "CS2024001",
  "class": "CS-A",
  "section": "A"
}
```

**Errors:**
- `400` - Missing required fields
- `403` - Insufficient permissions
- `409` - Username, email, or roll number already exists

---

### PUT /students/:id
Update a student. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (all fields optional)
```json
{
  "name": "John Updated",
  "email": "john.updated@student.edu",
  "rollNumber": "CS2024002",
  "class": "CS-B",
  "section": "B"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "roll_number": "CS2024002",
  "class": "CS-B",
  "section": "B",
  "user_id": 4,
  "name": "John Updated",
  "email": "john.updated@student.edu",
  "username": "johndoe"
}
```

**Errors:**
- `403` - Insufficient permissions
- `404` - Student not found
- `409` - Email or roll number already exists

---

### DELETE /students/:id
Delete a student. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Student deleted successfully"
}
```

**Errors:**
- `403` - Insufficient permissions
- `404` - Student not found

---

## Teacher Endpoints

### GET /teachers
Get all teachers.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "employee_id": "T001",
    "department": "Computer Science",
    "user_id": 2,
    "name": "Dr. Sarah Johnson",
    "email": "sarah.johnson@college.edu",
    "username": "teacher1"
  }
]
```

---

### GET /teachers/:id
Get a specific teacher by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "employee_id": "T001",
  "department": "Computer Science",
  "user_id": 2,
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@college.edu",
  "username": "teacher1"
}
```

**Errors:**
- `404` - Teacher not found

---

### POST /teachers
Create a new teacher. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Dr. Jane Doe",
  "email": "jane.doe@college.edu",
  "username": "janedoe",
  "password": "password123",
  "employeeId": "T004",
  "department": "Mathematics"
}
```

**Response:** `201 Created`
```json
{
  "id": 4,
  "user_id": 10,
  "name": "Dr. Jane Doe",
  "email": "jane.doe@college.edu",
  "username": "janedoe",
  "employeeId": "T004",
  "department": "Mathematics"
}
```

**Errors:**
- `400` - Missing required fields
- `403` - Insufficient permissions
- `409` - Username, email, or employee ID already exists

---

### PUT /teachers/:id
Update a teacher. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (all fields optional)
```json
{
  "name": "Dr. Jane Updated",
  "email": "jane.updated@college.edu",
  "employeeId": "T005",
  "department": "Physics"
}
```

**Response:** `200 OK`

**Errors:**
- `403` - Insufficient permissions
- `404` - Teacher not found
- `409` - Email or employee ID already exists

---

### DELETE /teachers/:id
Delete a teacher. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Teacher deleted successfully"
}
```

**Errors:**
- `403` - Insufficient permissions
- `404` - Teacher not found

---

## Subject Endpoints

### GET /subjects
Get all subjects.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Data Structures",
    "code": "CS201",
    "class": "CS-A",
    "teacher_id": 1,
    "employee_id": "T001",
    "teacher_name": "Dr. Sarah Johnson"
  }
]
```

---

### GET /subjects/:id
Get a specific subject by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

**Errors:**
- `404` - Subject not found

---

### POST /subjects
Create a new subject. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Machine Learning",
  "code": "CS401",
  "class": "CS-A",
  "teacherId": 1
}
```

**Response:** `201 Created`

**Errors:**
- `400` - Missing required fields
- `403` - Insufficient permissions
- `404` - Teacher not found
- `409` - Subject code already exists

---

### PUT /subjects/:id
Update a subject. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (all fields optional)
```json
{
  "name": "Advanced Machine Learning",
  "code": "CS402",
  "class": "CS-B",
  "teacherId": 2
}
```

**Response:** `200 OK`

**Errors:**
- `403` - Insufficient permissions
- `404` - Subject or teacher not found
- `409` - Subject code already exists

---

### DELETE /subjects/:id
Delete a subject. **Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Subject deleted successfully"
}
```

**Errors:**
- `403` - Insufficient permissions
- `404` - Subject not found

---

## Attendance Endpoints

### POST /attendance/mark
Mark attendance for a single student. **Teacher/Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "studentId": 1,
  "subjectId": 1,
  "date": "2024-01-15",
  "status": "present"
}
```

**Status values:** `present`, `absent`, `late`

**Response:** `201 Created` or `200 OK` (if updating)
```json
{
  "id": 1,
  "date": "2024-01-15",
  "status": "present",
  "student_id": 1,
  "roll_number": "CS2024001",
  "student_name": "John Smith",
  "subject_id": 1,
  "subject_name": "Data Structures",
  "subject_code": "CS201"
}
```

**Errors:**
- `400` - Missing fields or invalid status
- `403` - Insufficient permissions
- `404` - Student or subject not found

---

### POST /attendance/bulk-mark
Mark attendance for multiple students. **Teacher/Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "attendanceRecords": [
    {
      "studentId": 1,
      "subjectId": 1,
      "date": "2024-01-15",
      "status": "present"
    },
    {
      "studentId": 2,
      "subjectId": 1,
      "date": "2024-01-15",
      "status": "absent"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "2 attendance records marked successfully"
}
```

**Errors:**
- `400` - Empty or invalid array
- `403` - Insufficient permissions

---

### GET /attendance/report
Get attendance report with optional filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `studentId` (optional) - Filter by student ID
- `subjectId` (optional) - Filter by subject ID
- `class` (optional) - Filter by class
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "attendance": [
    {
      "id": 1,
      "date": "2024-01-15",
      "status": "present",
      "student_id": 1,
      "roll_number": "CS2024001",
      "student_name": "John Smith",
      "class": "CS-A",
      "subject_id": 1,
      "subject_name": "Data Structures",
      "subject_code": "CS201",
      "marked_by_name": "Dr. Sarah Johnson"
    }
  ],
  "stats": {
    "total": 100,
    "present": 85,
    "absent": 10,
    "late": 5
  }
}
```

---

### GET /attendance/student/:studentId
Get attendance records for a specific student.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `subjectId` (optional) - Filter by subject
- `startDate` (optional) - Filter from date
- `endDate` (optional) - Filter to date

**Response:** `200 OK`
```json
{
  "student": {
    "id": 1,
    "roll_number": "CS2024001",
    "class": "CS-A",
    "name": "John Smith"
  },
  "attendance": [
    {
      "id": 1,
      "date": "2024-01-15",
      "status": "present",
      "subject_id": 1,
      "subject_name": "Data Structures",
      "subject_code": "CS201"
    }
  ],
  "subjectStats": [
    {
      "subjectName": "Data Structures",
      "subjectCode": "CS201",
      "total": 20,
      "present": 18,
      "absent": 1,
      "late": 1,
      "percentage": "95.00"
    }
  ]
}
```

**Errors:**
- `404` - Student not found

---

### GET /attendance/export/csv
Export attendance report as CSV. **Teacher/Admin only.**

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `class` (optional) - Filter by class
- `subjectId` (optional) - Filter by subject
- `startDate` (optional) - Filter from date
- `endDate` (optional) - Filter to date

**Note:** Either `class` or `subjectId` is required.

**Response:** `200 OK`
- Content-Type: `text/csv`
- Downloads CSV file

**CSV Format:**
```csv
Roll Number,Student Name,Class,Subject Code,Subject Name,Date,Status
CS2024001,John Smith,CS-A,CS201,Data Structures,2024-01-15,present
```

**Errors:**
- `400` - Missing required parameters
- `403` - Insufficient permissions
- `404` - No records found

---

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production.

## CORS

CORS is enabled for `http://localhost:5173` by default. Update `CORS_ORIGIN` in `.env` for production.