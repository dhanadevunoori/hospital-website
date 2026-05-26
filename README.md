# 🏥 MediCare Hospital Website

A full-stack hospital website where patients can view doctor profiles, book appointments, and contact the hospital. Includes a secure admin dashboard for managing doctors and appointments.

---

## 🛠 Tech Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend  | Node.js + Express.js          |
| Database | MySQL (via mysql2)            |
| Auth     | express-session + bcrypt      |

---

## 📁 Project Structure

```
hospital-website/
├── backend/
│   ├── server.js              # Express server + all API routes
│   └── database.js            # MySQL database connection
├── database/
│   └── hospital.sql           # SQL schema + sample data
├── public/
│   ├── index.html             # Home page
│   ├── css/
│   │   └── style.css          # All styles
│   └── pages/
│       ├── doctors.html       # Doctors listing
│       ├── appointments.html  # Appointment booking form
│       ├── contact.html       # Contact page
│       ├── admin-login.html   # Admin login
│       └── admin.html         # Admin dashboard
├── db.js
├── server.js
├── hospital.sql
├── package.json
└── README.md
```

---

## ⚡ Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org) v16 or higher
- [XAMPP](https://www.apachefriends.org) (for MySQL)

### Steps

1. Start XAMPP and turn on **Apache** and **MySQL**
2. Open **phpMyAdmin** → create a database called `hospital_db`
3. Click **Import** → select `hospital.sql` → click **Go**
4. In the project folder, run:
   ```
   npm install
   ```
5. Start the server:
   ```
   npm start
   ```
6. Open in browser: [http://localhost:3000](http://localhost:3000)
7. Admin panel: [http://localhost:3000/pages/admin-login.html](http://localhost:3000/pages/admin-login.html)

---

## 🔑 Admin Credentials

| Field    | Value     |
| -------- | --------- |
| Username | admin     |
| Password | admin123  |

---

## 🌐 Pages

| Page             | URL                                              |
| ---------------- | ------------------------------------------------ |
| Home             | http://localhost:3000                            |
| Doctors          | http://localhost:3000/pages/doctors.html         |
| Book Appointment | http://localhost:3000/pages/appointments.html    |
| Contact          | http://localhost:3000/pages/contact.html         |
| Admin Login      | http://localhost:3000/pages/admin-login.html     |
| Admin Dashboard  | http://localhost:3000/pages/admin.html           |

---

## 🗄️ Database Schema

### `doctors`
| Column         | Type    | Description        |
| -------------- | ------- | ------------------ |
| id             | INT     | Primary key        |
| name           | VARCHAR | Doctor's full name |
| specialization | VARCHAR | Medical specialty  |
| available_days | VARCHAR | Available weekdays |

### `appointments`
| Column           | Type     | Description         |
| ---------------- | -------- | ------------------- |
| id               | INT      | Primary key         |
| patient_name     | VARCHAR  | Patient's full name |
| phone            | VARCHAR  | Phone number        |
| email            | VARCHAR  | Email address       |
| doctor_id        | INT      | FK → doctors.id     |
| appointment_date | DATE     | Requested date      |
| message          | TEXT     | Problem description |
| created_at       | DATETIME | Booking timestamp   |

---

## ✨ Features

### Patient Features
- Hospital info, services overview on home page
- Browse doctors with specialization and available days
- Book appointments with doctor selection and date picker
- Contact hospital via contact form
- Success/error messages after all form submissions

### Admin Features
- Secure login with session-based authentication
- Dashboard showing total doctors and total appointments
- Add, edit, and delete doctors
- View all appointments with full patient details
- Delete appointments

---

## 🔌 API Endpoints

### Public
| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| GET    | /api/doctors      | List all doctors    |
| POST   | /api/appointments | Book an appointment |
| POST   | /api/contact      | Send contact form   |

### Admin (requires login)
| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| GET    | /api/stats            | Dashboard statistics  |
| POST   | /api/doctors          | Add a doctor          |
| PUT    | /api/doctors/:id      | Edit a doctor         |
| DELETE | /api/doctors/:id      | Delete a doctor       |
| GET    | /api/appointments     | View all appointments |
| DELETE | /api/appointments/:id | Delete an appointment |
| POST   | /api/admin/login      | Admin login           |
| POST   | /api/admin/logout     | Admin logout          |

---

## 📝 Project Explanation

MediCare Hospital Website is a complete full-stack web application built with Node.js and Express.js on the backend and plain HTML, CSS, and JavaScript on the frontend. Patient and doctor data is stored in a MySQL database using the `mysql2` library. The admin dashboard is protected by session-based authentication with bcrypt-hashed passwords. All appointment booking forms include both client-side and server-side validation to ensure data integrity.
