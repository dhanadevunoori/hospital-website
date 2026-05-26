# MediCare Hospital Website

A full-stack hospital website where patients can view doctor profiles, book appointments, and contact the hospital. Includes an admin dashboard for managing doctors and appointments.

## Tech Stack
| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | HTML, CSS, Vanilla JavaScript |
| Backend   | Node.js + Express.js          |
| Database  | MySQL (via mysql2)            |
| Auth      | express-session + bcrypt      |

## Setup Instructions
1. Start XAMPP and start Apache + MySQL
2. Open phpMyAdmin, create database called hospital_db
3. Click Import, select hospital.sql, click Go
4. Run: npm install
5. Run: npm start
6. Open: http://localhost:3000
7. Admin panel: http://localhost:3000/pages/admin-login.html
8. Admin login: username=admin password=admin123

## Database Schema
Doctors: id, name, specialization, available_days
Appointments: id, patient_name, phone, email, doctor_id, appointment_date, message, created_at

## Project Structure
hospital-website/
  server.js, db.js, hospital.sql, package.json, README.md
  public/index.html
  public/css/style.css
  public/pages/doctors.html, appointments.html, contact.html, admin-login.html, admin.html
