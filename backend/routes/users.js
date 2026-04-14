const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { readDB, writeDB } = require('../utils/db');

const router = express.Router();

router.get('/',
  authenticateToken,
  authorize('admin'),
  (req, res) => {
    const db = readDB();
    const users = db.users.map(u => {
      const { password: _, ...safeUser } = u;
      return safeUser;
    });
    res.json(users);
  }
);

router.patch('/:id/role',
  authenticateToken,
  authorize('admin'),
  [
    body('role').isIn(['passenger', 'driver', 'admin']).withMessage('Невалидная роль')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    db.users[userIndex].role = req.body.role;
    writeDB(db);

    const { password: _, ...safeUser } = db.users[userIndex];
    res.json({ message: 'Роль обновлена', user: safeUser });
  }
);

module.exports = router;