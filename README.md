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
* Support hourly and monthly pay configura
