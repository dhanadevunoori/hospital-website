const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../database/hospital.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      available_days TEXT NOT NULL,
      experience TEXT DEFAULT '',
      image TEXT DEFAULT ''
    )
  `);

  db.run(`
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
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed default admin
  const adminExists = db.exec("SELECT * FROM admins WHERE username='admin'");
  if (!adminExists[0] || adminExists[0].values.length === 0) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', hash]);
  }

  // Seed sample doctors
  const doctorsExist = db.exec("SELECT COUNT(*) as c FROM doctors");
  const count = doctorsExist[0].values[0][0];
  if (count === 0) {
    const sampleDoctors = [
      ['Dr. Aisha Sharma', 'Cardiologist', 'Monday, Wednesday, Friday', '12 years'],
      ['Dr. Ravi Patel', 'Neurologist', 'Tuesday, Thursday, Saturday', '8 years'],
      ['Dr. Priya Mehta', 'Pediatrician', 'Monday, Tuesday, Thursday', '15 years'],
      ['Dr. Sanjay Kumar', 'Orthopedic Surgeon', 'Wednesday, Friday, Saturday', '10 years'],
      ['Dr. Kavitha Reddy', 'Dermatologist', 'Monday, Wednesday, Saturday', '6 years'],
      ['Dr. Arjun Nair', 'General Physician', 'Monday, Tuesday, Wednesday, Thursday, Friday', '20 years'],
    ];
    sampleDoctors.forEach(([name, spec, days, exp]) => {
      db.run("INSERT INTO doctors (name, specialization, available_days, experience) VALUES (?, ?, ?, ?)",
        [name, spec, days, exp]);
    });
  }

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

function query(sql, params = []) {
  const result = db.exec(sql.replace(/\?/g, () => {
    const val = params.shift();
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  }));
  if (!result[0]) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function run(sql, params = []) {
  let replaced = sql;
  const p = [...params];
  replaced = replaced.replace(/\?/g, () => {
    const val = p.shift();
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  });
  db.run(replaced);
  saveDb();
  // Return last insert rowid
  const r = db.exec("SELECT last_insert_rowid() as id");
  return r[0] ? r[0].values[0][0] : null;
}

module.exports = { getDb, query, run, saveDb };
