import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'seo-link-indexer-secret-key';
const PORT = process.env.PORT || 3000;

async function initDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      daily_limit INTEGER DEFAULT 100,
      total_limit INTEGER DEFAULT 1000,
      total_submitted INTEGER DEFAULT 0,
      access_expiry_date DATETIME,
      is_active INTEGER DEFAULT 0
    )
  `);

  // Logs Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      url TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT,
      day DATE DEFAULT (DATE('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Connections Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_url TEXT,
      api_key TEXT
    )
  `);

  // Settings Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      retention_days INTEGER DEFAULT 30,
      max_per_submit INTEGER DEFAULT 50,
      cooldown_minutes INTEGER DEFAULT 1,
      help_text TEXT,
      quota_msg_enabled INTEGER DEFAULT 1,
      quota_msg TEXT,
      auto_authorize_new_users INTEGER DEFAULT 1
    )
  `);

  // Initialize default settings
  const settings = await db.get('SELECT * FROM settings WHERE id = 1');
  if (!settings) {
    await db.run(`
      INSERT INTO settings (id, retention_days, max_per_submit, cooldown_minutes, help_text, quota_msg_enabled, quota_msg, auto_authorize_new_users)
      VALUES (1, 30, 50, 1, 'Paste your URLs here. One per line.', 1, 'Your quota is running low!', 1)
    `);
  }

  // Create default admin if not exists
  const admin = await db.get("SELECT * FROM users WHERE role = 'admin'");
  if (!admin) {
    const hash = await bcrypt.hash('admin123', 10);
    await db.run(`
      INSERT INTO users (username, email, password_hash, role, is_active, daily_limit, total_limit)
      VALUES ('admin', 'admin@example.com', ?, 'admin', 1, 999999, 999999)
    `, hash);
  }

  return db;
}

async function startServer() {
  const db = await initDb();
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Log Cleanup Cron job
  cron.schedule('0 0 * * *', async () => {
    const settings = await db.get('SELECT retention_days FROM settings WHERE id = 1');
    const days = settings?.retention_days || 30;
    await db.run("DELETE FROM logs WHERE submitted_at < datetime('now', '-' || ? || ' days')", days);
    console.log('Old logs purged');
  });

  // Middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hash = await bcrypt.hash(password, 10);
      const settings = await db.get('SELECT auto_authorize_new_users FROM settings WHERE id = 1');
      const isActive = settings?.auto_authorize_new_users ? 1 : 0;
      const expiry = settings?.auto_authorize_new_users 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
        : null;

      const result = await db.run(
        'INSERT INTO users (username, email, password_hash, is_active, access_expiry_date) VALUES (?, ?, ?, ?, ?)',
        [username, email, hash, isActive, expiry]
      );
      res.json({ id: result.lastID, isActive });
    } catch (err) {
      res.status(400).json({ error: 'Username or email already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account pending approval' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });

  // User Routes
  app.get('/api/user/profile', authenticateToken, async (req, res) => {
    const user = await db.get('SELECT id, username, email, role, daily_limit, total_limit, total_submitted, access_expiry_date, is_active FROM users WHERE id = ?', req.user.id);
    const todaySubmitted = await db.get("SELECT COUNT(*) as count FROM logs WHERE user_id = ? AND day = DATE('now')", req.user.id);
    res.json({ ...user, today_submitted: todaySubmitted.count });
  });

  app.post('/api/broadcast', authenticateToken, async (req, res) => {
    const { urls } = req.body;
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.user.id);
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');

    // Basic Validation
    if (!user.is_active) return res.status(403).json({ error: 'User inactive' });
    if (new Date(user.access_expiry_date) < new Date()) return res.status(403).json({ error: 'Subscription expired' });

    const todaySubmitted = (await db.get("SELECT COUNT(*) as count FROM logs WHERE user_id = ? AND day = DATE('now')", req.user.id)).count;
    
    if (todaySubmitted + urls.length > user.daily_limit) return res.status(400).json({ error: 'Daily limit reached' });
    if (user.total_submitted + urls.length > user.total_limit) return res.status(400).json({ error: 'Total limit reached' });

    // Cooldown check
    const lastLog = await db.get('SELECT submitted_at FROM logs WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1', req.user.id);
    if (lastLog) {
      const cooldownMs = settings.cooldown_minutes * 60 * 1000;
      if (Date.now() - new Date(lastLog.submitted_at).getTime() < cooldownMs) {
        return res.status(400).json({ error: `Please wait ${settings.cooldown_minutes} minutes between submissions.` });
      }
    }

    const connections = await db.all('SELECT * FROM connections');
    const results = [];

    for (const url of urls) {
      // Log locally first
      await db.run('INSERT INTO logs (user_id, url, status) VALUES (?, ?, ?)', [user.id, url, 'sent']);
      await db.run('UPDATE users SET total_submitted = total_submitted + 1 WHERE id = ?', user.id);
    }

    // Broadcast
    for (const conn of connections) {
      try {
        axios.post(`${conn.master_url}/wp-json/arch-master/v1/receive`, {
          api_key: conn.api_key,
          user_login: user.username,
          links: urls
        }).catch(err => console.error(`Failed broadcast to ${conn.master_url}:`, err.message));
      } catch (err) {
        console.error(`Broadcast error: ${err.message}`);
      }
    }

    res.json({ success: true, submitted: urls.length });
  });

  app.get('/api/user/logs', authenticateToken, async (req, res) => {
    const logs = await db.all('SELECT * FROM logs WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 150', req.user.id);
    res.json(logs);
  });

  // Admin Routes
  app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    const today = await db.get("SELECT COUNT(*) as count FROM logs WHERE day = DATE('now')");
    const yesterday = await db.get("SELECT COUNT(*) as count FROM logs WHERE day = DATE('now', '-1 day')");
    const week = await db.get("SELECT COUNT(*) as count FROM logs WHERE day >= DATE('now', '-7 days')");
    const month = await db.get("SELECT COUNT(*) as count FROM logs WHERE day >= DATE('now', '-30 days')");
    res.json({ today: today.count, yesterday: yesterday.count, week: week.count, month: month.count });
  });

  app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
     const users = await db.all('SELECT id, username, email, role, daily_limit, total_limit, total_submitted, access_expiry_date, is_active FROM users');
     res.json(users);
  });

  app.post('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const { daily_limit, total_limit, access_expiry_date, is_active } = req.body;
    await db.run(
      'UPDATE users SET daily_limit = ?, total_limit = ?, access_expiry_date = ?, is_active = ? WHERE id = ?',
      [daily_limit, total_limit, access_expiry_date, is_active, req.params.id]
    );
    res.json({ success: true });
  });

  app.get('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');
    res.json(settings);
  });

  app.post('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
    const { retention_days, max_per_submit, cooldown_minutes, help_text, quota_msg_enabled, quota_msg, auto_authorize_new_users } = req.body;
    await db.run(
      'UPDATE settings SET retention_days = ?, max_per_submit = ?, cooldown_minutes = ?, help_text = ?, quota_msg_enabled = ?, quota_msg = ?, auto_authorize_new_users = ? WHERE id = 1',
      [retention_days, max_per_submit, cooldown_minutes, help_text, quota_msg_enabled, quota_msg, auto_authorize_new_users]
    );
    res.json({ success: true });
  });

  app.get('/api/admin/connections', authenticateToken, isAdmin, async (req, res) => {
    const conns = await db.all('SELECT * FROM connections');
    res.json(conns);
  });

  app.post('/api/admin/connections', authenticateToken, isAdmin, async (req, res) => {
    const { connections } = req.body; // Expecting raw text to parse
    await db.run('DELETE FROM connections');
    const lines = connections.split('\n');
    for (const line of lines) {
      const [url, key] = line.split('|').map(s => s.trim());
      if (url && key) {
        await db.run('INSERT INTO connections (master_url, api_key) VALUES (?, ?)', [url, key]);
      }
    }
    res.json({ success: true });
  });

  app.get('/api/admin/logs', authenticateToken, isAdmin, async (req, res) => {
    const logs = await db.all('SELECT l.*, u.username FROM logs l JOIN users u ON l.user_id = u.id ORDER BY l.submitted_at DESC LIMIT 1000');
    res.json(logs);
  });

  app.post('/api/admin/logs/purge', authenticateToken, isAdmin, async (req, res) => {
    await db.run('DELETE FROM logs');
    res.json({ success: true });
  });

  // Vite / Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
