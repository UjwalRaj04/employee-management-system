# ShiftMate — Workforce Management SaaS

A MERN-stack workforce management platform designed to simplify employee management, shift scheduling, attendance tracking, and payroll workflows for businesses.

ShiftMate is a multi-tenant SaaS project being developed to help businesses manage their workforce through a centralised system. The goal is to provide managers with better visibility into employee operations while streamlining day-to-day workforce administration.

The platform is being built with a focus on secure organisation-level data separation, role-based access control, maintainable backend architecture, and reliable workforce management workflows.

---

## 🚀 Project Overview

Managing employees, shifts, working hours, and payroll across multiple business locations can become complicated when information is scattered across different systems.

ShiftMate aims to bring these operations together in one platform, allowing businesses to manage their employees and workforce activities efficiently.

### Key Objectives

* Manage employees and their employment information.
* Support multiple organisations within one SaaS platform.
* Control access through authentication and role-based permissions.
* Manage job positions and pay rates.
* Schedule employee shifts and track attendance.
* Generate timesheets and support payroll workflows.
* Introduce AI-assisted scheduling in a future release.
* Provide a scalable foundation for subscription-based SaaS services.

---

## 🛠️ Technology Stack

| Technology            | Purpose                                    |
| --------------------- | ------------------------------------------ |
| MongoDB Atlas         | Cloud database                             |
| Express.js            | Backend API framework                      |
| React.js              | Frontend user interface                    |
| Node.js               | Backend runtime                            |
| Mongoose              | MongoDB object modelling                   |
| JSON Web Tokens (JWT) | Authentication                             |
| bcrypt                | Password hashing                           |
| REST APIs             | Communication between frontend and backend |
| Git & GitHub          | Version control and collaboration          |

Architecture: MERN Stack — MongoDB, Express.js, React.js and Node.js.

---

## ✨ Features & Development Progress

### 🔐 Authentication & Authorisation

* User registration and login.
* Password hashing using bcrypt.
* JWT-based authentication.
* Authentication middleware.
* Role-based access control.

### 🏢 Multi-Tenant Organisation Management

* Organisation registration and management foundations.
* Users associated with their respective organisations.
* Organisation-context middleware.
* Organisation-scoped employee operations.
* Database indexing for organisation-specific employee email uniqueness.
* Tenant-isolation testing and legacy-data migration in progress.

### 👥 Employee Management

* Create, retrieve, update and delete employee records through backend APIs.
* Store employee contact and employment information.
* Associate employees with job positions.
* Retrieve pay rates from position configuration.
* Scope employee operations to the relevant organisation.

### 💷 Position & Pay Configuration

* Manage job positions and their pay rates.
* Support hourly and monthly pay configurations.
* Retrieve pay information from configured positions rather than relying on manually supplied employee pay values.

### 📅 Business-Year & Payroll Foundations

* Business-year calculations.
* Annual pay-increase logic.
* Payroll and payslip functionality developed in the backend.
* Historical pay-rate handling.

Payroll integration with approved attendance and timesheets requires further validation as development progresses.

### 🏬 Branch Management

Planned development includes branch creation, employee-to-branch assignments, and organisation-scoped branch management.

### 🕒 Shift Scheduling & Attendance

Planned development includes:

* Employee shift scheduling.
* Kiosk-based clock-in and clock-out.
* PIN verification.
* Break tracking and break reasons.
* Photo verification at the workplace.

### 📊 Timesheets & Payroll Workflows

Planned development includes:

* Weekly timesheet generation.
* Worked-hours calculations.
* Manager approval workflows.
* Downloadable timesheets and payslips.

### 🤖 AI-Assisted Scheduling

A future enhancement is to introduce AI-assisted scheduling that considers employee availability, working-hour restrictions, approved leave, and staffing requirements.

---

## 🏗️ Architecture

ShiftMate follows a client-server architecture with a React frontend, an Express REST API, and MongoDB for data persistence.

```text
                    ShiftMate
                        |
            +-----------+-----------+
            |                       |
            v                       v
      React Frontend           Express API
                                    |
                      +-------------+-------------+
                      |             |             |
                      v             v             v
                Authentication  Middleware   Controllers
                      |             |             |
                      +-------------+-------------+
                                    |
                                    v
                                Mongoose
                                    |
                                    v
                              MongoDB Atlas
```

### Multi-Tenant Data Isolation

The application is being developed so that employee operations are scoped to the authenticated user's organisation.

```text
ShiftMate
    |
    +-- Organisation A
    |       |
    |       +-- Users
    |       +-- Employees
    |       +-- Branches
    |       +-- Shifts
    |
    +-- Organisation B
            |
            +-- Users
            +-- Employees
            +-- Branches
            +-- Shifts
```

Each organisation should only be able to access its own authorised data. This is enforced at the backend level rather than relying solely on frontend restrictions.

Note: The architecture diagram illustrates the intended system design. Branches, shifts and other planned modules will be implemented and secured as development progresses.

---

## 📂 Project Structure

The backend follows a modular structure, separating models, routes, middleware, controllers and business logic.

```text
ShiftMate/
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── config/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/              # Frontend location, if configured
│
├── .gitignore
└── README.md
```

The structure above is illustrative. Adjust the frontend and backend paths to match the actual repository.

---

## ⚙️ Getting Started

### Prerequisites

Install the following before running the project:

* Node.js
* npm
* A MongoDB Atlas account or another supported MongoDB instance.
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/UjwalRaj04/employee-management-system.git
```

Navigate into the project:

```bash
cd ShiftMate
```

Replace the repository URL and folder name with the actual values for your GitHub project.

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Use the actual environment variable names required by your codebase. If the application uses additional configuration variables, add them as required.

Security: Never commit your `.env` file, database credentials, or JWT secrets to GitHub.

### 4. Start the Backend

Use the development script configured in `backend/package.json`. If the project defines a `dev` script, run:

```bash
npm run dev
```

Alternatively, if the configured entry point is `server.js`:

```bash
node server.js
```

The API should start on the configured port, such as `5000`.

### 5. Start the Frontend

Once the React frontend is configured, open another terminal and navigate to its actual directory.

For example:

```bash
cd frontend
npm install
npm run dev
```

The frontend commands depend on the tooling configured in its `package.json`.

---

## 🔒 Security Considerations

Security is a core part of the ShiftMate architecture.

Current implementation and ongoing development focus on:

* Password hashing rather than storing plain-text passwords.
* JWT-based authentication.
* Role-based authorisation.
* Organisation-scoped database queries.
* Organisation-specific employee email uniqueness.
* Protecting sensitive employee and payroll information.

Before production deployment, the application will also require comprehensive tenant-isolation testing, input validation, production secrets management, secure file storage, monitoring, backups, and appropriate personal-data protection measures.

---

## 🗺️ Roadmap

ShiftMate is being developed incrementally.

* [x] Backend foundation and database connectivity
* [x] Authentication and role-based authorisation
* [x] Organisation management foundations
* [x] Employee management APIs
* [x] Position and pay configuration
* [x] Business-year and payroll foundations
* [ ] Complete multi-tenant data migration and isolation testing
* [ ] Complete branch management
* [ ] Implement shift scheduling
* [ ] Implement kiosk attendance and break tracking
* [ ] Integrate timesheets with payroll workflows
* [ ] Build and integrate the React frontend
* [ ] Complete security and end-to-end testing
* [ ] Deploy the production application
* [ ] Introduce SaaS subscriptions and billing
* [ ] Explore AI-assisted scheduling

Checkboxes reflect the development history currently recorded for the project; verify each feature against the current code before marking it complete in the repository.

---

## 🎯 Project Goals

The long-term goal is to develop ShiftMate into a practical workforce management SaaS platform for businesses that need a centralised way to manage employees, schedules, attendance and payroll-related workflows.

The project also serves as a practical exploration of:

* Full-stack development with the MERN stack.
* REST API design and backend architecture.
* Authentication and role-based authorisation.
* Multi-tenant SaaS architecture.
* MongoDB data modelling and indexing.
* Business logic for pay rates and payroll.
* Secure handling of organisation-specific data.
* Incremental software development, testing and deployment.

---

## 👨‍💻 Development

ShiftMate is an actively developed project. Features are being implemented and tested incrementally, with a focus on understanding the underlying code, maintaining a clear architecture, and validating each major component before moving towards production.

Contributions, feedback and suggestions are welcome.

---

## 📄 License

A license has not yet been specified. Add a `LICENSE` file before publishing the project under an open-source license.

---

ShiftMate — Simplifying workforce management, one shift at a time.
