const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Dummy login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // TEMP: hardcoded logic
  if (username === 'admin' && password === 'admin123') {
    return res.json({ role: 'admin', message: 'Login successful' });
  } else if (username === 'border' && password === 'border123') {
    return res.json({ role: 'border', message: 'Login successful' });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
