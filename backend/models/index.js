const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.js');



const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  port: dbConfig.PORT,
  pool: dbConfig.pool
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('./user.model.js')(sequelize, Sequelize);

db.log = require('./log.model.js')(sequelize, Sequelize);
db.user.hasMany(db.log, { foreignKey: 'userId' });
db.log.belongsTo(db.user, { foreignKey: 'userId' });


module.exports = db;

const express = require('express');
const bcrypt = require('bcryptjs');
const client = require('../db.js');

const app = express();
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check user exists
    const existing = await client.query('SELECT * FROM users WHERE username=$1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Insert user
    await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed]);
    res.json({ msg: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
const jwt = require('jsonwebtoken');

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userData = await client.query('SELECT * FROM users WHERE username=$1', [username]);
    if (userData.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const user = userData.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
