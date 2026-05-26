-- ============================================================
-- MediCare Hospital Database Schema
-- Compatible with: SQLite / MySQL / PostgreSQL
-- ============================================================

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  available_days TEXT NOT NULL,
  experience TEXT DEFAULT '',
  image TEXT DEFAULT ''
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  doctor_id INTEGER NOT NULL,
  appointment_date TEXT NOT NULL,
  message TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL  -- bcrypt hashed
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- Sample Data
-- ============================================================

INSERT INTO doctors (name, specialization, available_days, experience) VALUES
  ('Dr. Aisha Sharma', 'Cardiologist', 'Monday, Wednesday, Friday', '12 years'),
  ('Dr. Ravi Patel', 'Neurologist', 'Tuesday, Thursday, Saturday', '8 years'),
  ('Dr. Priya Mehta', 'Pediatrician', 'Monday, Tuesday, Thursday', '15 years'),
  ('Dr. Sanjay Kumar', 'Orthopedic Surgeon', 'Wednesday, Friday, Saturday', '10 years'),
  ('Dr. Kavitha Reddy', 'Dermatologist', 'Monday, Wednesday, Saturday', '6 years'),
  ('Dr. Arjun Nair', 'General Physician', 'Monday, Tuesday, Wednesday, Thursday, Friday', '20 years');

-- Default admin (password: admin123)
-- bcrypt hash of 'admin123'
INSERT INTO admins (username, password) VALUES
  ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
