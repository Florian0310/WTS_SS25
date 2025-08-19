// Kleines Studentenprojekt - nicht perfekt, aber hoffentlich hilfreich
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();
const db = new sqlite3.Database('database.db');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'geheim',
    resave: false,
    saveUninitialized: false
}));

// Datenbanksetup
const initDB = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kundennr TEXT UNIQUE,
      name TEXT,
      plz TEXT,
      passwort TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zeit TEXT UNIQUE,
      art TEXT,
      belegt INTEGER DEFAULT 0,
      user_id INTEGER,
      bestaetigt INTEGER DEFAULT 0,
      token TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  });
};

initDB();


// Slots aus Datei einlesen
function loadSlots() {
  const file = path.join(__dirname, 'slots.json');
  if (!fs.existsSync(file)) return;
  const slots = JSON.parse(fs.readFileSync(file, 'utf8'));
  db.serialize(() => {
    slots.forEach(s => {
      db.run('INSERT OR IGNORE INTO slots (zeit) VALUES (?)', [s.zeit]);
    });
  });
}

loadSlots();

// Hilfsfunktionen
// Mails versenden (hier nur Demo-Konfiguration)
function sendMail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    // hier könnt ihr euren SMTP-Server eintragen
    host: 'localhost',
    port: 25,
    tls: { rejectUnauthorized: false }
  });
  return transporter.sendMail({ from: 'noreply@mostviertler-modellbahnhof.at', to, subject, text });
}

// Middleware für Logincheck
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Nicht eingeloggt' });
  next();
}

// GET: verfügbare Slots
app.get('/api/slots', (req, res) => {
  db.all('SELECT * FROM slots', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST: Registrierung
app.post('/api/register', (req, res) => {
  const { kundennr, name, plz, passwort } = req.body;
  db.run('INSERT INTO users (kundennr, name, plz, passwort) VALUES (?, ?, ?, ?)',
    [kundennr, name, plz, passwort],
    function(err) {
      if (err) return res.status(400).json({ error: 'User existiert schon?' });
      req.session.user = { id: this.lastID, kundennr, name };
      res.json({ ok: true, user: req.session.user });

    });
});

// POST: Login
app.post('/api/login', (req, res) => {
  const { kundennr, passwort } = req.body;
  db.get('SELECT * FROM users WHERE kundennr=? AND passwort=?', [kundennr, passwort], (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Login fehlgeschlagen' });
    req.session.user = { id: row.id, kundennr: row.kundennr, name: row.name };
    res.json({ ok: true, user: req.session.user });

  });
});

// POST: Buchung
app.post('/api/book', requireLogin, async (req, res) => {
  const { slotId, art, recaptchaToken } = req.body;
  // recaptcha check
  if (process.env.RECAPTCHA_SECRET) {
    try {
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`, { method: 'POST' });
      const data = await response.json();
      if (!data.success) return res.status(400).json({ error: 'reCAPTCHA fehlgeschlagen' });
    } catch (e) {
      return res.status(400).json({ error: 'reCAPTCHA Service nicht erreichbar' });
    }
  }
  db.get('SELECT * FROM slots WHERE id=?', [slotId], (err, row) => {
    if (err || !row || row.belegt) return res.status(400).json({ error: 'Slot nicht verfügbar' });
    const token = Math.random().toString(36).substring(2);
    db.run('UPDATE slots SET belegt=1, art=?, user_id=?, token=?, bestaetigt=0 WHERE id=?',
      [art, req.session.user.id, token, slotId], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        // Mail senden (hier nur Demo)
        sendMail('kunde@example.com', 'Terminbestätigung', `Bitte bestätigen: http://localhost:3000/api/confirm/${token}`)
          .then(() => res.json({ ok: true }))
          .catch(() => res.json({ ok: true, mail: false }));
      });
  });
});

// GET: Bestätigungslink
app.get('/api/confirm/:token', (req, res) => {
  db.run('UPDATE slots SET bestaetigt=1 WHERE token=?', [req.params.token], function(err) {
    if (err || this.changes === 0) return res.status(400).send('Fehler');
    res.send('Termin bestätigt!');
  });
});

// POST: Stornieren
app.post('/api/cancel', requireLogin, (req, res) => {
  const { slotId } = req.body;
  db.run('UPDATE slots SET belegt=0, user_id=NULL, bestaetigt=0, token=NULL WHERE id=? AND user_id=?', [slotId, req.session.user.id], function(err) {
    if (err || this.changes === 0) return res.status(400).json({ error: 'Konnte nicht stornieren' });
    res.json({ ok: true });
  });
});

// GET: Logout
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});


// GET: Aktueller Benutzer
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json(null);
  res.json(req.session.user);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server läuft auf Port', PORT));
