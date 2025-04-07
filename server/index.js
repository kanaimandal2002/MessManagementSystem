const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Kanai@2003',
  database: 'mess_management',
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// ======== ROUTES ========

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ role: results[0].role, message: 'Login successful' });
  });
});

// Toggle/Update Meal Status for TODAY
app.post('/api/meal', (req, res) => {
  const { username, status, date } = req.body;

  if (!username || !status || !date) {
    return res.status(400).json({ message: 'Missing data' });
  }

  db.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userId = results[0].id;

    const query = `
      INSERT INTO meal_status (user_id, date, status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?
    `;

    db.query(query, [userId, date, status, status], (err2) => {
      if (err2) {
        console.error('DB insert/update error:', err2);
        return res.status(500).json({ message: 'Failed to save status' });
      }

      res.json({ message: 'Meal status updated for today' });
    });
  });
});

// Get today's meal status
app.get('/api/meal-status', (req, res) => {
  const { username, date } = req.query;

  if (!username || !date) {
    return res.status(400).json({ message: 'Missing data' });
  }

  db.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userId = results[0].id;

    db.query('SELECT status FROM meal_status WHERE user_id = ? AND date = ?', [userId, date], (err2, results2) => {
      if (err2) {
        return res.status(500).json({ message: 'Database error' });
      }

      const status = results2.length > 0 ? results2[0].status : null;
      res.json({ status });
    });
  });
});

// Get recent meal history
app.get('/api/meal-history', (req, res) => {
  const { username } = req.query;

  db.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userId = results[0].id;

    const query = `
      SELECT date, status
      FROM meal_status
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 30
    `;
    db.query(query, [userId], (err2, mealResults) => {
      if (err2) {
        return res.status(500).json({ message: 'Error fetching meal history' });
      }

      res.json(mealResults);
    });
  });
});

// Get current month's meal count
app.get('/api/monthly-meals', (req, res) => {
  const { username } = req.query;

  const query = `
    SELECT COUNT(*) AS mealCount 
    FROM meal_status 
    WHERE user_id = (SELECT id FROM users WHERE username = ?) 
      AND MONTH(date) = MONTH(CURRENT_DATE()) 
      AND YEAR(date) = YEAR(CURRENT_DATE()) 
      AND status = 'ON'
  `;

  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });

    res.json({ mealCount: results[0].mealCount });
  });
});

// Get user info (readonly)
app.get('/api/user-info', (req, res) => {
  const { username } = req.query;

  db.query(
    'SELECT name, address, phone, room, username FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (results.length === 0) return res.status(404).json({ message: 'User not found' });

      res.json(results[0]);
    }
  );
});

// Update username or password
app.post('/api/update-user-info', (req, res) => {
  const { oldUsername, newUsername, newPassword } = req.body;

  if (!oldUsername || (!newUsername && !newPassword)) {
    return res.status(400).json({ message: 'Missing update data' });
  }

  const updates = [];
  const values = [];

  if (newUsername) {
    updates.push('username = ?');
    values.push(newUsername);
  }

  if (newPassword) {
    updates.push('password = ?');
    values.push(newPassword);
  }

  const query = `UPDATE users SET ${updates.join(', ')} WHERE username = ?`;
  values.push(oldUsername);

  db.query(query, values, (err) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ message: 'Failed to update user info' });
    }

    res.json({ message: 'User info updated successfully' });
  });
});

// Start server
app.listen(5000, () => {
  console.log('✅ Server running at http://localhost:5000');
});
