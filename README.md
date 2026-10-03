# 📚 Library Management System

A modern, full-stack **Library Management System** designed to digitize
and simplify the management of books, physical book copies, members,
users, authors, categories, borrowings, returns, fines, and library
reports.

The project follows a **REST API + React frontend** architecture, with a
Flask backend connected to MySQL and a responsive web-based
administration dashboard.

------------------------------------------------------------------------

## ✨ Overview

The Library Management System provides a centralized platform for
librarians and administrators to manage day-to-day library operations.

It replaces manual record keeping with a structured digital system that
helps manage:

-   📖 Books and physical book copies
-   👥 Library members
-   👤 System users and roles
-   ✍️ Authors
-   🏷️ Book categories
-   📚 Borrowing records
-   🔄 Returns
-   💰 Fines
-   📊 Dashboard statistics
-   📑 Library reports
-   🔐 Authentication and role-based access control

------------------------------------------------------------------------

## 🎯 Project Objectives

The main objectives of this project are to:

1.  Digitize common library management operations.
2.  Reduce manual data entry and record-keeping errors.
3.  Maintain accurate book and copy availability.
4.  Manage borrowing and return transactions efficiently.
5.  Provide role-based access to administrative features.
6.  Provide useful dashboard statistics and reports.
7.  Build a maintainable full-stack application using modern development
    practices.

------------------------------------------------------------------------

## 🏗️ System Architecture

``` text
┌───────────────────────────────┐
│        React Frontend         │
│      React + Vite + Axios     │
└───────────────┬───────────────┘
                │
                │ HTTP / REST API
                ▼
┌───────────────────────────────┐
│        Flask Backend          │
│   REST API + JWT + SQLAlchemy │
└───────────────┬───────────────┘
                │
                │ SQLAlchemy / MySQL
                ▼
┌───────────────────────────────┐
│          MySQL 8              │
│     Library Database          │
└───────────────────────────────┘
```

------------------------------------------------------------------------

## 🛠️ Technology Stack

### Frontend

-   **React**
-   **Vite**
-   **React Router**
-   **Axios**
-   CSS3
-   JavaScript / JSX

### Backend

-   **Python**
-   **Flask**
-   **Flask-SQLAlchemy**
-   **Flask-JWT-Extended**
-   **Flask-Migrate**
-   **Werkzeug Security**
-   RESTful API architecture

### Database

-   **MySQL 8**

### Development Tools

-   Visual Studio Code
-   Git
-   GitHub
-   PowerShell
-   Python Virtual Environment
-   MySQL

------------------------------------------------------------------------

## 🚀 Main Features

### 🔐 Authentication & Authorization

The system uses JWT-based authentication and role-based authorization.

Supported roles:

-   **ADMIN**
-   **LIBRARIAN**

Protected endpoints require a valid JWT access token.

Example authorization header:

``` http
Authorization: Bearer <access_token>
```

------------------------------------------------------------------------

### 📊 Dashboard

The administration dashboard provides an overview of the library system,
including:

-   Total books
-   Total physical book copies
-   Total members
-   Total system users
-   Total borrowing records
-   Total fine records

The dashboard retrieves statistics directly from the backend API.

------------------------------------------------------------------------

### 📚 Book Management

Administrators and librarians can manage book records.

Book information includes:

-   Book title
-   ISBN
-   Author
-   Category
-   Publisher
-   Publication year
-   Total copies
-   Available copies
-   Shelf/location information

The system also validates ISBN uniqueness and maintains copy
availability.

------------------------------------------------------------------------

### 📦 Book Copy Management

The system distinguishes between a **book title** and its individual
physical copies.

Each physical copy can have its own:

-   Accession number
-   Shelf location
-   Availability status

Supported copy statuses include:

``` text
AVAILABLE
BORROWED
LOST
DAMAGED
MAINTENANCE
```

This allows the system to track individual physical copies accurately.

------------------------------------------------------------------------

### 👥 Member Management

Library members can be managed through the system.

Member operations include:

-   Create member
-   View members
-   Update member
-   Activate/deactivate member
-   View member information
-   Manage member borrowing history

The system protects historical borrowing records from unsafe deletion.

------------------------------------------------------------------------

### 👤 User Management

Administrators can manage system accounts.

Supported operations include:

-   View users
-   Create users
-   Update users
-   Change user roles
-   Change passwords
-   Activate users
-   Deactivate users

Supported roles:

``` text
ADMIN
LIBRARIAN
```

------------------------------------------------------------------------

### ✍️ Author Management

The system provides author management functionality for organizing books
by their authors.

------------------------------------------------------------------------

### 🏷️ Category Management

Books can be organized into categories such as:

-   Programming
-   Algorithms
-   Database
-   Networking
-   Computer Networks
-   Self Development

Duplicate category creation is prevented.

------------------------------------------------------------------------

### 📖 Borrowing Management

The borrowing module manages library transactions and tracks:

-   Member
-   Book
-   Physical copy
-   Issue date
-   Due date
-   Return information
-   Borrowing status

The system can use the borrowing information for reports and dashboard
statistics.

------------------------------------------------------------------------

### 🔄 Return Management

The return workflow is designed to update the status of borrowed
physical copies and maintain accurate availability information.

------------------------------------------------------------------------

### 💰 Fine Management

The system maintains fine records associated with library borrowing
operations.

Fine information can be used to track outstanding library penalties and
provide administrative reports.

------------------------------------------------------------------------

### 📑 Reports

The backend provides reporting endpoints for library information,
including book and member reports.

The reporting layer can be extended with additional reports as the
project grows.

------------------------------------------------------------------------

## 🗄️ Database Structure

The current database contains the following major entities:

``` text
users
members
authors
categories
books
book_copies
borrowings
fines
```

### High-Level Relationships

``` text
User
 │
 └── System Administration / Librarian

Author
 │
 └── Books
      │
      ├── Category
      │
      └── Book Copies
              │
              └── Borrowings
                     │
                     └── Fines

Member
 │
 └── Borrowings
```

------------------------------------------------------------------------

## 📁 Project Structure

``` text
Library Management System/
│
├── backend/
│   │
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── extensions.py
│   │   └── __init__.py
│   │
│   ├── migrations/
│   ├── tests/
│   ├── run.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

------------------------------------------------------------------------

# ⚙️ Installation & Setup

## 1. Clone the Repository

``` bash
git clone <your-github-repository-url>
cd "Library Management System"
```

------------------------------------------------------------------------

# 🐍 Backend Setup

## 2. Create a Virtual Environment

From the backend directory:

``` powershell
cd backend

python -m venv venv
```

Activate it on Windows:

``` powershell
.\venv\Scripts\Activate.ps1
```

------------------------------------------------------------------------

## 3. Install Backend Dependencies

``` powershell
pip install -r requirements.txt
```

If a requirements file has not yet been generated:

``` powershell
pip freeze > requirements.txt
```

------------------------------------------------------------------------

## 4. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

``` env
FLASK_APP=run.py
FLASK_DEBUG=True

DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@localhost/library_management_system

JWT_SECRET_KEY=your-secret-key
```

### Important

Do not commit your real `.env` file or secret keys to GitHub.

Add this to `.gitignore`:

``` gitignore
.env
venv/
__pycache__/
*.pyc
```

------------------------------------------------------------------------

# 🗄️ Database Setup

Create the MySQL database:

``` sql
CREATE DATABASE library_management_system;
```

Make sure MySQL is running before starting the backend.

If your project uses Flask-Migrate, apply migrations with:

``` powershell
flask db upgrade
```

------------------------------------------------------------------------

# ▶️ Start the Backend

From:

``` text
backend/
```

run:

``` powershell
python run.py
```

The backend should be available at:

``` text
http://127.0.0.1:5000
```

------------------------------------------------------------------------

# ⚛️ Frontend Setup

Open another terminal.

Navigate to:

``` powershell
cd frontend
```

Install dependencies:

``` powershell
npm install
```

Start the Vite development server:

``` powershell
npm run dev
```

The frontend will normally be available at:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 🔑 Authentication Flow

The application uses JWT authentication.

The general authentication flow is:

``` text
Login
  │
  ▼
Flask Authentication API
  │
  ▼
Validate username/password
  │
  ▼
Generate JWT
  │
  ▼
React stores access token
  │
  ▼
Axios sends:
Authorization: Bearer <token>
  │
  ▼
Protected Flask endpoint
  │
  ▼
JWT + Role Validation
```

------------------------------------------------------------------------

# 🔌 Example API Endpoints

## Authentication

``` http
POST /api/auth/login
POST /api/auth/member/login
GET  /api/auth/me
GET  /api/auth/admin-test
```

## Dashboard

``` http
GET /api/dashboard/statistics
```

## Users

``` http
GET    /api/users
GET    /api/users/<user_id>
POST   /api/users
PUT    /api/users/<user_id>
PATCH  /api/users/<user_id>/status
```

## Books

``` http
GET /api/books
GET /api/books/<book_id>
POST /api/books
PUT /api/books/<book_id>
DELETE /api/books/<book_id>
```

Additional endpoints are available for authors, categories, book copies,
members, borrowings, returns, fines, and reports.

------------------------------------------------------------------------

# 🧪 Testing

Backend tests can be executed with:

``` powershell
pytest
```

For a verbose test run:

``` powershell
pytest -v
```

To run a specific test:

``` powershell
pytest tests/<test_file>.py -v
```

API endpoints can also be tested using:

-   PowerShell `Invoke-RestMethod`
-   Postman
-   Insomnia
-   Browser-based frontend requests

------------------------------------------------------------------------

# 🔒 Security Considerations

The project includes several security mechanisms:

-   JWT authentication
-   Role-based access control
-   Password hashing
-   Protected administrative endpoints
-   Duplicate username validation
-   Duplicate ISBN validation
-   Input validation
-   Protected user management
-   Controlled member deletion
-   Environment-based configuration

Passwords are stored as password hashes rather than plain text.

------------------------------------------------------------------------

# 📈 Future Improvements

Possible future enhancements include:

-   📱 Fully responsive mobile interface
-   🔔 Notification system
-   📧 Email notifications for due dates
-   📊 Advanced analytics and charts
-   📅 Automatic overdue calculation
-   💳 Online fine/payment integration
-   📷 Barcode/QR-code scanning
-   📄 PDF report generation
-   📥 Excel/CSV report export
-   🔎 Advanced book search and filtering
-   👤 Member self-service portal
-   📚 Book reservation system
-   🔐 More granular permissions
-   📝 Audit logs
-   ☁️ Production deployment

------------------------------------------------------------------------

# 🎓 Academic Project

This project was developed as a university-level software engineering
project to demonstrate practical knowledge of:

-   Full-stack web development
-   REST API development
-   Database design
-   Object-relational mapping
-   Authentication and authorization
-   CRUD operations
-   Software architecture
-   Frontend/backend integration
-   Testing
-   Git and version control

------------------------------------------------------------------------

# 🤝 Contributing

Contributions and improvements are welcome.

### Suggested workflow

``` bash
git checkout -b feature/your-feature
```

Make your changes, test them, and commit:

``` bash
git add .
git commit -m "Add your feature"
```

Push the branch:

``` bash
git push origin feature/your-feature
```

Then create a Pull Request.

------------------------------------------------------------------------

# 📄 License

This project is available for educational and development purposes.

Add your preferred license here, such as:

``` text
MIT License
```

if you intend to distribute the project under the MIT License.

------------------------------------------------------------------------

# 👨‍💻 Author

**Muhammad Asif**

Computer Science Student\
Full-Stack Developer \| Python \| Flask \| React \| MySQL

------------------------------------------------------------------------

## ⭐ Project Highlights

``` text
Modern React Frontend
        +
RESTful Flask API
        +
MySQL Database
        +
JWT Authentication
        +
Role-Based Authorization
        +
Library Operations
        +
Reports & Dashboard
        =
Library Management System
```

If you find this project useful, consider giving the repository a ⭐ on
GitHub.
