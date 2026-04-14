const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { readDB, writeDB } = require('../utils/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = readDB();
  res.json(db.rides);
});

router.get('/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const ride = db.rides.find(r => r.id === req.params.id);
  
  if (!ride) {
    return res.status(404).json({ error: 'Поездка не найдена' });
  }
  
  res.json(ride);
});

router.post('/',
  authenticateToken,
  authorize('driver', 'admin'),
  [
    body('from').trim().notEmpty().withMessage('Откуда обязательно'),
    body('to').trim().notEmpty().withMessage('Куда обязательно'),
    body('dateTime').notEmpty().withMessage('Дата обязательна'),
    body('seatsAvailable').isInt({ min: 1, max: 6 }).withMessage('1-6 мест')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { from, to, dateTime, seatsAvailable } = req.body;
    const db = readDB();

    const ride = {
      id: Date.now().toString(),
      driverId: req.user.id,
      driverName: req.user.name,
      from,
      to,
      dateTime,
      seatsAvailable: parseInt(seatsAvailable, 10),
      passengers: [],
      createdAt: new Date().toISOString()
    };

    db.rides.push(ride);
    writeDB(db);
    res.status(201).json(ride);
  }
);

router.post('/:id/join',
  authenticateToken,
  authorize('passenger', 'driver', 'admin'),
  (req, res) => {
    const db = readDB();
    const ride = db.rides.find(r => r.id === req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    if (ride.driverId === req.user.id) {
      return res.status(400).json({ error: 'Нельзя записаться на свою поездку' });
    }

    if (ride.passengers.includes(req.user.id)) {
      return res.status(400).json({ error: 'Вы уже записаны на эту поездку' });
    }

    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ error: 'Нет свободных мест' });
    }

    ride.seatsAvailable -= 1;
    ride.passengers.push(req.user.id);
    writeDB(db);

    res.json(ride);
  }
);

router.post('/:id/leave',
  authenticateToken,
  authorize('passenger', 'driver', 'admin'),
  (req, res) => {
    const db = readDB();
    const ride = db.rides.find(r => r.id === req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    if (!ride.passengers.includes(req.user.id)) {
      return res.status(400).json({ error: 'Вы не записаны на эту поездку' });
    }

    ride.passengers = ride.passengers.filter(id => id !== req.user.id);
    ride.seatsAvailable += 1;
    writeDB(db);

    res.json(ride);
  }
);

router.delete('/:id',
  authenticateToken,
  authorize('driver', 'admin'),
  (req, res) => {
    const db = readDB();
    const rideIndex = db.rides.findIndex(r => r.id === req.params.id);

    if (rideIndex === -1) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    const ride = db.rides[rideIndex];

    if (req.user.role !== 'admin' && ride.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Можно удалить только свою поездку' });
    }

    db.rides.splice(rideIndex, 1);
    writeDB(db);

    res.json({ message: 'Поездка удалена' });
  }
);

router.get('/my/driving', authenticateToken, authorize('driver', 'admin'), (req, res) => {
  const db = readDB();
  const myRides = db.rides.filter(r => r.driverId === req.user.id);
  res.json(myRides);
});

router.get('/my/joined', authenticateToken, (req, res) => {
  const db = readDB();
  const joined = db.rides.filter(r => r.passengers.includes(req.user.id));
  res.json(joined);
});

module.exports = router;