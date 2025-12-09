import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { db, uploadsDir } from './db.js';

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: allowedOrigin }))
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Helper to crop image to 450x350
async function cropImageIfProvided(filePath) {
  if (!filePath) return null;
  const ext = path.extname(filePath).toLowerCase();
  const outName = `${path.basename(filePath, ext)}-cropped${ext}`;
  const outPath = path.join(uploadsDir, outName);
  try {
    console.log('[image] cropping', { filePath, outPath })
    await sharp(filePath).resize(450, 350).toFile(outPath);
    try { fs.unlinkSync(filePath); } catch {}
    return `/uploads/${outName}`;
  } catch (err) {
    console.error('[image] crop failed, serving original', err)
    // Fallback: serve original file if cropping fails
    const servedPath = `/uploads/${path.basename(filePath)}`
    return servedPath;
  }
}

// One-time seed endpoint (protected by optional SEED_KEY)
const seedKey = process.env.SEED_KEY || null
app.post('/api/seed', async (req, res) => {
  try {
    if (seedKey) {
      const provided = req.headers['x-seed-key']
      if (!provided || provided !== seedKey) return res.status(403).json({ error: 'Forbidden' })
    }
    await import('./seed.js')
    res.json({ status: 'seeded' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Projects
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})
app.post('/api/projects', upload.single('image'), async (req, res) => {
  const { name, description } = req.body
  if (!name || !description) return res.status(400).json({ error: 'Missing fields' })
  const imageUrl = req.file ? await cropImageIfProvided(req.file.path) : null
  db.run('INSERT INTO projects (name, description, image) VALUES (?, ?, ?)', [name, description, imageUrl], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message })
      res.status(201).json(row)
    })
  })
})

// Debug: simple JSON insert for projects (no image)
app.post('/api/projects-json', (req, res) => {
  const { name, description } = req.body
  if (!name || !description) return res.status(400).json({ error: 'Missing fields' })
  db.run('INSERT INTO projects (name, description, image) VALUES (?, ?, ?)', [name, description, null], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message })
      res.status(201).json(row)
    })
  })
})

// Clients
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})
app.post('/api/clients', upload.single('image'), async (req, res) => {
  const { name, designation, description } = req.body
  if (!name || !designation || !description) return res.status(400).json({ error: 'Missing fields' })
  const imageUrl = req.file ? await cropImageIfProvided(req.file.path) : null
  db.run('INSERT INTO clients (name, designation, description, image) VALUES (?, ?, ?, ?)', [name, designation, description, imageUrl], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message })
      res.status(201).json(row)
    })
  })
})

// Contacts
app.get('/api/contacts', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})
app.post('/api/contacts', (req, res) => {
  const { fullName, email, mobile, city } = req.body
  if (!fullName || !email || !mobile || !city) return res.status(400).json({ error: 'Missing fields' })
  const createdAt = new Date().toISOString()
  db.run('INSERT INTO contacts (fullName, email, mobile, city, createdAt) VALUES (?, ?, ?, ?, ?)', [fullName, email, mobile, city, createdAt], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message })
      res.status(201).json(row)
    })
  })
})

// Subscriptions
app.get('/api/subscriptions', (req, res) => {
  db.all('SELECT * FROM subscriptions ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})
app.post('/api/subscriptions', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Missing email' })
  const createdAt = new Date().toISOString()
  db.run('INSERT INTO subscriptions (email, createdAt) VALUES (?, ?)', [email, createdAt], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    db.get('SELECT * FROM subscriptions WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message })
      res.status(201).json(row)
    })
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});