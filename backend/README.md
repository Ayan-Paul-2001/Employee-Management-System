# Employee Management System (EMS)

A comprehensive NestJS-based Employee Management System with authentication, role-based access, HR, admin, employee, leave, notice, attendance, and reporting features.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Setup](#setup)
- [API Documentation](#api-documentation)
  - [Auth](#auth)
  - [Admin](#admin)
  - [HR](#hr)
  - [Employee](#employee)
  - [Leave](#leave)
  - [Notice](#notice)
  - [Attendance](#attendance)
  - [Report](#report)
- [Example Usage](#example-usage)

---

## Overview

The Employee Management System (EMS) is a modular backend application built with NestJS and TypeORM. It provides a comprehensive solution for managing employees, attendance, leave requests, notices, and generating reports. The system implements role-based access control with different permissions for administrators, HR managers, department managers, and employees.

## Features

- **User Authentication**
  - Registration with email verification
  - JWT-based authentication
  - Password reset functionality
  - Role-based access control

- **User Roles**
  - Admin: Full system access
  - HR Manager: Employee management, leave approvals, performance reviews
  - Department Manager: Team management, attendance tracking
  - Employee: Personal profile, leave requests, attendance

- **Employee Management**
  - Employee onboarding and profile management
  - Department and position assignment
  - Performance reviews

- **Attendance Tracking**
  - Check-in and check-out recording
  - Late arrival and absence tracking
  - Attendance reports

- **Leave Management**
  - Multiple leave types (Annual, Sick, Maternity, etc.)
  - Leave request submission and approval workflow
  - Leave balance tracking

- **Notice Board**
  - Company-wide announcements
  - Department-specific notices
  - Categorized notifications

- **Reporting**
  - Export data in CSV and PDF formats
  - Customizable report filters
  - Performance and attendance analytics

## System Architecture

The application follows a modular architecture with the following components:

- **Core Modules**
  - Auth: Handles authentication, user registration, and role management
  - Admin: Administrative functions and system management
  - HR: HR-specific functions like employee onboarding and performance reviews
  - Employee: Employee profile management and self-service features

- **Feature Modules**
  - Attendance: Tracks employee check-ins and check-outs
  - Leave: Manages leave requests and approvals
  - Notice: Handles company announcements and notifications
  - Report: Generates reports and analytics

- **Database**
  - PostgreSQL with TypeORM for data persistence
  - Redis for caching and session management

---

## Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=yourpassword
   DB_DATABASE=employeemanagementsystem
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=1d
   
   # Email Configuration
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@example.com
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```
   The server runs on `http://localhost:4000` by default.

---

## API Documentation

### Auth

#### Registration and Verification

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST   | /auth/register | Register a new user | None |
| POST   | /auth/verify | Verify email with code | None |
| POST   | /auth/login | Login and get JWT | None |

#### Password Reset

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST   | /auth/requestreset | Request password reset by email | None |
| POST   | /auth/verifyresetcode | Verify reset code | None |
| POST   | /auth/resetpassword | Set new password | None |

#### Admin Password Management

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST   | /auth/admin/:id/request-reset | Request reset for admin | None |
| POST   | /auth/admin/:id/verify-reset-code | Verify reset code for admin | None |
| POST   | /auth/admin/:id/reset-password | Reset password for admin | Admin |

### Admin

The Admin module currently has no public endpoints but provides backend services for administrative functions.

### HR

> All routes require JWT and HR_MANAGER role

#### Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /hr/employees | List all employees |
| PATCH  | /hr/employees/:id | Update employee information |

#### Leave Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /hr/leave-requests | List all leave requests |
| PATCH  | /hr/leave-requests/:id | Approve/reject leave request |

#### Performance Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /hr/reviews | Add performance review |
| GET    | /hr/reviews/:employeeId | Get reviews for employee |

#### Announcements

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /hr/announcements | Post announcement |
| GET    | /hr/announcements | List all announcements |

### Employee

> All routes require JWT and ADMIN role

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /employee/create | Create employee |
| GET    | /employee/all | List all employees |
| GET    | /employee/:id | Get employee by ID |
| PATCH  | /employee/update/:id | Update employee |
| DELETE | /employee/delete/:id | Delete employee |

### Leave

> All routes require JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /leave/all | List all leave requests |
| GET    | /leave/:id | Get leave request by ID |
| PATCH  | /leave/status/:id | Update leave status |
| DELETE | /leave/delete/:id | Delete leave request |

### Notice

> All routes require JWT. Some require ADMIN role.

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST   | /notice | Create notice | Admin |
| GET    | /notice | List all notices | Any authenticated user |
| GET    | /notice/my | List notices by admin | Admin |
| PATCH  | /notice/:id | Update notice | Admin |
| DELETE | /notice/:id | Delete notice | Admin |

### Attendance

> All routes require JWT and appropriate roles

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET    | /attendance | List all attendance records | Admin |
| GET    | /attendance/employee/:employeeId | Get attendance for employee | Admin |
| POST   | /attendance | Create attendance record | Employee |

### Report

> All routes require JWT and ADMIN role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /reports/notices | Export notice reports (CSV/PDF/JSON) |

## Example Usage

### Register as Admin
```bash
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin123",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123"
  }'
```

### Create Employee (as Admin)
```bash
curl -X POST http://localhost:4000/employee/create \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "position": "Software Developer"
  }'
```

### Submit Leave Request (as Employee)
```bash
curl -X POST http://localhost:4000/leave/create \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "empId": 1,
    "name": "John Doe",
    "leaveType": "Annual",
    "department": "Engineering",
    "days": 5
  }'
```

### Generate Notice Report (as Admin)
```bash
curl -X GET 'http://localhost:4000/reports/notices?exportFormat=csv&startDate=2023-01-01&endDate=2023-12-31' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -o notice_report.csv
```
