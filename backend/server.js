const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const { getDb, query, run } = require('./database');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'hospital_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, '../public')));

// ─── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.redirect('/pages/admin-login.html');
}

// ─── PAGE ROUTES ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/doctors', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/doctors.html')));
app.get('/appointments', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/appointments.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../public/pages/contact.html')));
app.get('/admin', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/pages/admin.html')));

// ─── API: DOCTORS ─────────────────────────────────────────────────────────────
app.get('/api/doctors', (req, res) => {
  try {
    const doctors = query('SELECT * FROM doctors ORDER BY name');
    res.json({ success: true, data: doctors });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/doctors/:id', (req, res) => {
  try {
    const doctors = query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (!doctors.length) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctors[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/doctors', requireAuth, (req, res) => {
  const { name, specialization, available_days, experience } = req.body;
  if (!name || !specialization || !available_days) {
    return res.status(400).json({ success: false, message: 'Name, specialization and available days are required' });
  }
  try {
    const id = run('INSERT INTO doctors (name, specialization, available_days, experience) VALUES (?, ?, ?, ?)',
      [name, specialization, available_days, experience || '']);
    res.json({ success: true, message: 'Doctor added successfully', id });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/doctors/:id', requireAuth, (req, res) => {
  const { name, specialization, available_days, experience } = req.body;
  if (!name || !specialization || !available_days) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  try {
    run('UPDATE doctors SET name=?, specialization=?, available_days=?, experience=? WHERE id=?',
      [name, specialization, available_days, experience || '', req.params.id]);
    res.json({ success: true, message: 'Doctor updated successfully' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/doctors/:id', requireAuth, (req, res) => {
  try {
    run('DELETE FROM doctors WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── API: APPOINTMENTS ────────────────────────────────────────────────────────
app.post('/api/appointments', (req, res) => {
  const { patient_name, phone, email, doctor_id, appointment_date, message } = req.body;

  if (!patient_name || !phone || !email || !doctor_id || !appointment_date) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }
  const phoneRegex = /^[0-9+\-\s]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  }
  const apptDate = new Date(appointment_date);
  if (apptDate < new Date()) {
    return res.status(400).json({ success: false, message: 'Appointment date must be in the future' });
  }

  try {
    const id = run(
      'INSERT INTO appointments (patient_name, phone, email, doctor_id, appointment_date, message) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_name, phone, email, doctor_id, appointment_date, message || '']
    );
    res.json({ success: true, message: 'Appointment booked successfully! We will confirm shortly.', id });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/appointments', requireAuth, (req, res) => {
  try {
    const appointments = query(`
      SELECT a.*, d.name as doctor_name, d.specialization
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: appointments });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/appointments/:id', requireAuth, (req, res) => {
  try {
    run('DELETE FROM appointments WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── API: STATS ───────────────────────────────────────────────────────────────
app.get('/api/stats', requireAuth, (req, res) => {
  try {
    const doctors = query('SELECT COUNT(*) as count FROM doctors');
    const appointments = query('SELECT COUNT(*) as count FROM appointments');
    const today = query("SELECT COUNT(*) as count FROM appointments WHERE date(appointment_date)=date('now')");
    res.json({
      success: true,
      data: {
        totalDoctors: doctors[0].count,
        totalAppointments: appointments[0].count,
        todayAppointments: today[0].count
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── API: CONTACT ─────────────────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required' });
  }
  try {
    run('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || '', message]);
    res.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── API: ADMIN AUTH ──────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  try {
    const admins = query('SELECT * FROM admins WHERE username=?', [username]);
    if (!admins.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const valid = bcrypt.compareSync(password, admins[0].password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    req.session.admin = { id: admins[0].id, username: admins[0].username };
    res.json({ success: true, message: 'Login successful' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.admin), admin: req.session.admin || null });
});

// ─── START ────────────────────────────────────────────────────────────────────
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅ Hospital Website running at http://localhost:${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/pages/admin-login.html`);
    console.log(`🔑 Admin login: username=admin, password=admin123\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
