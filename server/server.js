// server.js
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));  // Increase limit for large database files

// Database connection function
const getDbConnection = async () => {
  return open({
    filename: './mydb.db',
    driver: sqlite3.Database
  });
};

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await getDbConnection();
  const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

  if (user) {
    const dbPath = path.resolve(__dirname, 'mydb.db');
    res.sendFile(dbPath);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Sync route
app.post('/sync', async (req, res) => {
  const { dbFile } = req.body;
  const dbPath = path.resolve(__dirname, './mydb.db');

  // Convert the JSON string of the database file back into a buffer
  const buffer = Buffer.from(JSON.parse(dbFile));

  fs.writeFileSync(dbPath, buffer);
  res.json({ message: 'Database synced successfully' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
