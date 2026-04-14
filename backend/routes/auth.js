const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const { readDB, writeDB } = require('../utils/db');

const router = express.Router();

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Имя обязательно'),
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Минимум 6 символов'),
    body('role').isIn(['passenger', 'driver']).withMessage('Невалидная роль')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    const db = readDB();

    if (db.users.some(u => u.email === email)) {
      return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser, token });
  }
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Неверные данные' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверные данные' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  }
);

router.get('/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;