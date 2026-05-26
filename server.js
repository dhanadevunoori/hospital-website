// server.js — Hospital Website Backend (MySQL Version)
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'hospital_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect('/admin/login');
}

// ── PUBLIC PAGES ────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/doctors', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'doctors.html')));
app.get('/appointments', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'appointments.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'contact.html')));

// ── API — DOCTORS ────────────────────────────────────
app.get('/api/doctors', (req, res) => {
  db.query('SELECT * FROM doctors ORDER BY name', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: results });
  });
});

app.get('/api/doctors/:id', (req, res) => {
  db.query('SELECT * FROM doctors WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(results[0]);
  });
});

app.post('/api/doctors', requireAdmin, (req, res) => {
  const { name, specialization, available_days, phone, email, experience } = req.body;
  if (!name || !specialization || !available_days) {
    return res.status(400).json({ error: 'Name, specialization, and available days are required' });
  }
  db.query(
    'INSERT INTO doctors (name, specialization, available_days, phone, email, experience) VALUES (?, ?, ?, ?, ?, ?)',
    [name, specialization, available_days, phone || '', email || '', experience || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: result.insertId, message: 'Doctor added successfully' });
    }
  );
});

app.put('/api/doctors/:id', requireAdmin, (req, res) => {
  const { name, specialization, available_days, phone, email, experience } = req.body;
  db.query(
    'UPDATE doctors SET name=?, specialization=?, available_days=?, phone=?, email=?, experience=? WHERE id=?',
    [name, specialization, available_days, phone, email, experience, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Doctor updated successfully' });
    }
  );
});

app.delete('/api/doctors/:id', requireAdmin, (req, res) => {
  db.query('DELETE FROM doctors WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Doctor deleted successfully' });
  });
});

// ── API — APPOINTMENTS ───────────────────────────────
app.get('/api/appointments', requireAdmin, (req, res) => {
  const sql = `
    SELECT a.*, d.name AS doctor_name, d.specialization
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    ORDER BY a.appointment_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: results });
  });
});

app.post('/api/appointments', (req, res) => {
  const { patient_name, phone, email, doctor_id, appointment_date, message } = req.body;
  if (!patient_name || !phone || !email || !doctor_id || !appointment_date) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }
  db.query(
    'INSERT INTO appointments (patient_name, phone, email, doctor_id, appointment_date, message) VALUES (?, ?, ?, ?, ?, ?)',
    [patient_name, phone, email, doctor_id, appointment_date, message || ''],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: result.insertId, message: 'Appointment booked successfully!' });
    }
  );
});

app.put('/api/appointments/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  db.query('UPDATE appointments SET status=? WHERE id=?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Appointment updated' });
  });
});

app.delete('/api/appointments/:id', requireAdmin, (req, res) => {
  db.query('DELETE FROM appointments WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Appointment deleted' });
  });
});

// ── API — CONTACT ────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  res.json({ success: true, message: 'Message received! We will get back to you soon.' });
});

// ── API — ADMIN STATS ────────────────────────────────
app.get('/api/stats', requireAdmin, (req, res) => {
  const stats = {};
  db.query('SELECT COUNT(*) AS total FROM doctors', (err, r1) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalDoctors = r1[0].total;
    db.query('SELECT COUNT(*) AS total FROM appointments', (err, r2) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalAppointments = r2[0].total;
      db.query("SELECT COUNT(*) AS total FROM appointments WHERE status='pending'", (err, r3) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.pendingAppointments = r3[0].total;
        db.query("SELECT COUNT(*) AS total FROM appointments WHERE status='confirmed'", (err, r4) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.confirmedAppointments = r4[0].total;
          res.json(stats);
        });
      });
    });
  });
});

// also keep /api/admin/stats as alias
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.redirect('/api/stats');
});

// ── ADMIN AUTH API ───────────────────────────────────
app.get('/api/admin/check', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.admin) });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM admin_users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });
    req.session.admin = { id: admin.id, username: admin.username };
    res.json({ success: true, loggedIn: true });
  });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ── ADMIN PAGES ──────────────────────────────────────
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.admin) return res.redirect('/admin/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'pages', 'admin-login.html'));
});

app.get('/admin/dashboard', requireAdmin, (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'))
);

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ── START SERVER ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏥 Hospital Website running at http://localhost:${PORT}`);
  console.log(`🔐 Admin panel: http://localhost:${PORT}/admin/login`);
  console.log(`   Username: admin | Password: admin123\n`);
});
