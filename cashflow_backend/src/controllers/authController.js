// src/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
    // (Kode dari jawaban sebelumnya)
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
      let user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length > 0) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const newUser = await db.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
        [email, password_hash, full_name]
      );

      res.status(201).json({
        msg: 'User registered successfully',
        user: newUser.rows[0],
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    // (Kode dari jawaban sebelumnya)
    const { email, password } = req.body;

    try {
      const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const user = userResult.rows[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: { id: user.id },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
};