require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_this';

// ------------------------------------------------------------
// GET /api/projects — list projects, with optional filters
// ------------------------------------------------------------
app.get('/api/projects', async (req, res) => {
  try {
    const { sector, state, riskLevel } = req.query;

    const riskRanges = {
      Low:      { min: 0,  max: 30 },
      Medium:   { min: 31, max: 55 },
      High:     { min: 56, max: 75 },
      Critical: { min: 76, max: 100 }
    };

    let query = `
      SELECT p.*, 
             dc.physical_pct, dc.financial_pct, dc.geographical_pct,
             dc.manpower_pct, dc.bureaucratic_pct, dc.other_pct
      FROM projects p
      LEFT JOIN delay_causes dc ON dc.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (sector) {
      params.push(sector);
      query += ` AND p.sector = $${params.length}`;
    }

    if (state) {
      params.push(state);
      query += ` AND p.state = $${params.length}`;
    }

    if (riskLevel && riskRanges[riskLevel]) {
      params.push(riskRanges[riskLevel].min);
      query += ` AND p.risk_score >= $${params.length}`;
      params.push(riskRanges[riskLevel].max);
      query += ` AND p.risk_score <= $${params.length}`;
    }

    query += ` ORDER BY p.risk_score DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ------------------------------------------------------------
// GET /api/projects/:id — single project detail
// ------------------------------------------------------------
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const causesResult = await pool.query('SELECT * FROM delay_causes WHERE project_id = $1', [id]);

    res.json({
      ...projectResult.rows[0],
      causes: causesResult.rows[0] || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// ------------------------------------------------------------
// POST /api/auth/login — JWT-based login
// (basic version now, fully wired with hashing on Day 5)
// ------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});