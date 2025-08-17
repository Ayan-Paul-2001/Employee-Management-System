# Employee Management System (EMS)

A modular NestJS-based Employee Management System with authentication, role-based access, HR, admin, employee, leave, notice, attendance, and reporting features.

---

## Table of Contents
- [Features](#features)
- [Setup](#setup)
- [Authentication & Registration](#authentication--registration)
- [API Documentation](#api-documentation)
  - [Auth](#auth)
  - [Admin](#admin)
  - [HR](#hr)
  - [Employee](#employee)
  - [Leave](#leave)
  - [Notice](#notice)
  - [Attendance](#attendance)
  - [Report](#report)

---

## Features
- User registration and email verification
- Role-based access: Admin, HR Manager, Department Manager, Employee
- Employee onboarding and management
- Leave requests and approvals
- Notice board for announcements
- Attendance tracking
- Reporting (CSV/PDF export)

---

## Setup
1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Create a `.env` file in the root directory with your DB and email credentials.
4. **Run the application**
   ```bash
   npm run start:dev
   ```
   The server runs on `http://localhost:4000` by default.

---

## Authentication & Registration

### Register (All Roles)
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password1",
    "role": "admin" // or "hr_manager", "department_manager", "employee"
  }
  ```
- **Response:** Verification code sent to email.

### Verify Email
- **POST** `/auth/verify`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "code": "123456"
  }
  ```
- **Response:** Account created and verified.

### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "Password1"
  }
  ```
- **Response:** JWT access token and user role.

### Password Reset (by Email)
- **POST** `/auth/requestreset` — Request reset code
- **POST** `/auth/verifyresetcode` — Verify code
- **POST** `/auth/resetpassword` — Set new password

---

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /auth/register | Register a new user (all roles) |
| POST   | /auth/verify   | Verify email with code |
| POST   | /auth/login    | Login and get JWT |
| POST   | /auth/requestreset | Request password reset code by email |
| POST   | /auth/verifyresetcode | Verify password reset code by email |
| POST   | /auth/resetpassword | Set new password by email |
| POST   | /auth/admin/:id/request-reset | Request reset for admin by ID |
| POST   | /auth/admin/:id/verify-reset-code | Verify reset code for admin by ID |
| POST   | /auth/admin/:id/reset-password | (Admin only) Reset password for admin by ID |

---

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| (No public endpoints currently defined) |

---

### HR
> All routes require JWT and HR_MANAGER role

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /hr/employees | Onboard a new employee |
| GET    | /hr/employees | List all employees |
| PATCH  | /hr/employees/:id | Update employee info |
| GET    | /hr/leave-requests | List all leave requests |
| PATCH  | /hr/leave-requests/:id | Approve/reject leave |
| POST   | /hr/reviews | Add performance review |
| GET    | /hr/reviews/:employeeId | Get reviews for employee |
| POST   | /hr/announcements | Post announcement |
| GET    | /hr/announcements | List all announcements |

---

### Employee
> All routes require JWT and ADMIN role

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /employee/create | Create employee |
| GET    | /employee/all | List all employees |
| GET    | /employee/:id | Get employee by ID |
| PATCH  | /employee/update/:id | Update employee |
| DELETE | /employee/delete/:id | Delete employee |

---

### Leave
> All routes require JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /leave/all | List all leave requests |
| GET    | /leave/:id | Get leave request by ID |
| PATCH  | /leave/status/:id | Update leave status (Pending/Approved/Rejected) |
| DELETE | /leave/delete/:id | Delete leave request |

---

### Notice
> All routes require JWT. Some require ADMIN role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /notice | (Admin) Create notice |
| GET    | /notice | List all notices |
| GET    | /notice/my | (Admin) List notices by admin |
| PATCH  | /notice/:id | (Admin) Update notice |
| DELETE | /notice/:id | (Admin) Delete notice |

---

### Attendance
> All routes require JWT and ADMIN role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /attendance | List all attendance records |
| GET    | /attendance/employee/:employeeId | Get attendance summary for employee |

---

### Report
> All routes require JWT and ADMIN role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /reports/notices | Export notice reports (CSV/PDF/JSON) |

---

## Example Usage

### Register as Admin
```bash
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Admin","email":"admin@email.com","password":"Admin123","role":"admin"}'
```

### Onboard Employee (HR)
```bash
curl -X POST http://localhost:4000/hr/employees \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Employee Name", ...}'
```

---

## Notes
- All protected routes require a valid JWT in the `Authorization` header.
- Use the `/auth/login` endpoint to obtain a JWT after registration and verification.
- Roles: `admin`, `hr_manager`, `department_manager`, `employee`
- For more details, see the source code for each module.
