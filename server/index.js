const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const moment = require('moment-timezone');

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

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({
        role: results[0].role,
        username: results[0].username,
        message: 'Login successful',
      });
    }
  );
});

// Toggle/Update Meal Status for TODAY
app.post('/api/meal', async (req, res) => {
  const { username, status, date } = req.body;

  try {
    const [userRows] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRows[0].id;
    const time = moment().tz('Asia/Kolkata').format('HH:mm:ss');


    const [existingRows] = await db.promise().query(
      'SELECT * FROM meal_status WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (existingRows.length > 0) {
      await db.promise().query(
        'UPDATE meal_status SET status = ?, time = ? WHERE user_id = ? AND date = ?',
        [status, time, userId, date]
      );
    } else {
      await db.promise().query(
        'INSERT INTO meal_status (user_id, date, status, time) VALUES (?, ?, ?, ?)',
        [userId, date, status, time]
      );
    }

    res.status(200).json({ message: 'Meal status updated' });

  } catch (err) {
    console.error('Error updating meal status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's or most recent meal status
app.get('/api/meal-status', (req, res) => {
  const { username, date } = req.query;

  if (!username || !date) {
    return res.status(400).json({ message: 'Missing data' });
  }

  const getUserIdQuery = 'SELECT id FROM users WHERE username = ?';
  db.query(getUserIdQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const userId = results[0].id;
    const now = moment().tz('Asia/Kolkata');
    const isAfter6PM = now.hour() >= 18;


    const queryParams = [userId, date];
    const timeCondition = isAfter6PM ? `AND TIME(time) <= '18:00:00'` : '';

    const todayStatusQuery = `
      SELECT status
      FROM meal_status
      WHERE user_id = ? AND date = ? ${timeCondition}
      ORDER BY time DESC
      LIMIT 1
    `;

    db.query(todayStatusQuery, queryParams, (err2, results2) => {
      if (err2) return res.status(500).json({ message: 'Database error' });

      if (results2.length > 0) {
        return res.json({ status: results2[0].status });
      }

      // If no suitable status for today, fallback to most recent overall
      const fallbackQuery = `
        SELECT status
        FROM meal_status
        WHERE user_id = ?
        ORDER BY date DESC, time DESC
        LIMIT 1
      `;

      db.query(fallbackQuery, [userId], (err3, fallbackResults) => {
        if (err3) return res.status(500).json({ message: 'Database error' });

        const status = fallbackResults.length > 0 ? fallbackResults[0].status : 'OFF';
        res.json({ status });
      });
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
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') AS date,
        TIME_FORMAT(time, '%r') AS time,  -- AM/PM format
        status
      FROM meal_status
      WHERE user_id = ?
      ORDER BY date DESC, time DESC
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

// Admin: Get all borders and their latest meal status (any date)
app.get('/api/admin/border-meal-status', (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.room,
      ms.status,
      DATE(ms.date) AS date,
      DATE_FORMAT(ms.time, '%h:%i %p') AS time
    FROM users u
    LEFT JOIN (
      SELECT ms1.*
      FROM meal_status ms1
      JOIN (
        SELECT user_id, MAX(CONCAT(date, ' ', time)) AS max_datetime
        FROM meal_status
        GROUP BY user_id
      ) ms2 
      ON ms1.user_id = ms2.user_id AND CONCAT(ms1.date, ' ', ms1.time) = ms2.max_datetime
    ) ms ON u.id = ms.user_id
    WHERE u.role = 'border'
    ORDER BY u.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching border meal status:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});


// guest meal status
app.post('/api/guest-meal', async (req, res) => {
  const { username, guest_name, status, date, time } = req.body;

  if (!username || !guest_name || !status || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Restrict updates after 6 PM
    const currentHourIST = moment().tz('Asia/Kolkata').hour();
    if (currentHourIST >= 18) {
  return res.status(403).json({ message: 'Guest meal status cannot be updated after 6:00 PM. Try again after midnight.' });
    } 


    // Get the user_id of the border
    const [userRows] = await db.promise().query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Border not found' });
    }

    const userId = userRows[0].id;

    // Check if a guest entry for the same guest and date already exists
    const [existingRows] = await db.promise().query(
      'SELECT id FROM guest_meals WHERE user_id = ? AND guest_name = ? AND date = ?',
      [userId, guest_name, date]
    );

    if (existingRows.length > 0) {
      // Update the existing record
      await db.promise().query(
        'UPDATE guest_meals SET status = ?, time = ? WHERE id = ?',
        [status, time, existingRows[0].id]
      );
    } else {
      // Insert new guest meal entry
      await db.promise().query(
        'INSERT INTO guest_meals (user_id, guest_name, status, date, time) VALUES (?, ?, ?, ?, ?)',
        [userId, guest_name, status, date, time]
      );
    }

    res.status(200).json({ message: 'Guest meal status saved/updated successfully' });
  } catch (err) {
    console.error("Error saving guest meal:", err);
    res.status(500).json({ message: 'Server error while saving guest meal' });
  }
});




/// Guest meal history
app.get('/api/guest-meal-history', async (req, res) => {
  const { username } = req.query;

  try {
    const [userResult] = await db.promise().query(
      'SELECT id FROM users WHERE username = ?', 
      [username]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userResult[0].id;

    const [guestMeals] = await db.promise().query(
      `SELECT 
         guest_name, 
         DATE_FORMAT(date, '%Y-%m-%d') AS date,
         TIME_FORMAT(time, '%r') AS time,  -- AM/PM format
         status
       FROM guest_meals 
       WHERE user_id = ?
       ORDER BY date DESC, time DESC
       LIMIT 30
      `,
      [userId]
    );

    res.json(guestMeals);

  } catch (err) {
    console.error("Error fetching guest meal history:", err);
    res.status(500).json({ message: 'Server error while fetching guest meal history' });
  }
});


// Admin: Get all guest meals with border name
app.get('/api/admin/guest-meal-status', async (req, res) => {
  try {
    const [results] = await db.promise().query(`
      SELECT gm.id, u.name AS border_name, u.room, gm.guest_name, gm.status,
             DATE_FORMAT(gm.date, '%Y-%m-%d') AS date,
             DATE_FORMAT(STR_TO_DATE(gm.time, '%H:%i:%s'), '%h:%i %p') AS time
      FROM guest_meals gm
      JOIN users u ON gm.user_id = u.id
      INNER JOIN (
        SELECT guest_name, MAX(CONCAT(date, ' ', time)) AS max_datetime
        FROM guest_meals
        WHERE date = CURDATE() -- Only consider today's date
        GROUP BY guest_name
      ) latest
      ON gm.guest_name = latest.guest_name
         AND CONCAT(gm.date, ' ', gm.time) = latest.max_datetime
      WHERE gm.date = CURDATE() -- Only consider today's date
      ORDER BY gm.date DESC, gm.time DESC
    `);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching guest meal status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//total guest meal count
app.get('/api/admin/guest-meals-count', async (req, res) => {
  try {
    const [result] = await db.promise().query(
      `SELECT COUNT(*) AS count FROM guest_meals WHERE date = CURDATE() AND status = 'ON'`
    );
    res.status(200).json({ count: result[0].count });
  } catch (err) {
    console.error('Error fetching guest meal count:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




// Get all guest meal entries with status = 'ON' for the current month
app.get('/api/admin/monthly-guest-meals', async (req, res) => {
  try {
    const selectedMonth = req.query.month; // format: YYYY-MM

    let query = `
      SELECT 
        gm.id, 
        u.name AS border_name, 
        gm.guest_name, 
        gm.status, 
        gm.date, 
        DATE_FORMAT(gm.time, '%h:%i %p') AS time
      FROM guest_meals gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.status = 'ON'
    `;
    
    let params = [];

    if (selectedMonth) {
      // Example: selectedMonth = "2025-04"
      const [year, month] = selectedMonth.split('-');
      query += ` AND YEAR(gm.date) = ? AND MONTH(gm.date) = ?`;
      params.push(year, month);
    } else {
      query += ` AND YEAR(gm.date) = YEAR(CURDATE()) AND MONTH(gm.date) = MONTH(CURDATE())`;
    }

    query += ` ORDER BY gm.date DESC, gm.time DESC`;

    const [rows] = await db.promise().query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching monthly guest meals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route: GET /api/admin/monthly-guest-meals-count each border
app.get('/api/admin/monthly-guest-meals-summary', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        u.name, 
        u.room, 
        gm.user_id, 
        SUM(
          CASE 
            WHEN TIME(gm.time) < '06:00:00' THEN 2 
            ELSE 1 
          END
        ) AS total_guest_meals
      FROM guest_meals gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.status = 'ON'
        AND MONTH(gm.date) = MONTH(CURDATE())
        AND YEAR(gm.date) = YEAR(CURDATE())
      GROUP BY gm.user_id
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching monthly guest meal summary:', err);
    res.status(500).json({ message: 'Server error fetching summary' });
  }
});






// Start server
app.listen(5000, () => {
  console.log('✅ Server running at http://localhost:5000');
});