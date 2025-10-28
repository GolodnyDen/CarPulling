const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Регистрация
app.post('/api/register', (req, res) => {
  const { name, email, role } = req.body; // role: 'driver' или 'passenger'

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  const db = readDB();
  const userExists = db.users.some(u => u.email === email);
  if (userExists) {
    return res.status(409).json({ error: 'Пользователь уже существует' });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    role,
  };

  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

// Получить все поездки
app.get('/api/rides', (req, res) => {
  const db = readDB();
  res.json(db.rides);
});

// Создать поездку
app.post('/api/rides', (req, res) => {
  const { driverId, from, to, dateTime, seatsAvailable } = req.body;

  const db = readDB();
  const ride = {
    id: Date.now().toString(),
    driverId,
    from,
    to,
    dateTime,
    seatsAvailable: parseInt(seatsAvailable),
    passengers: [],
  };
  db.rides.push(ride);
  writeDB(db);
  res.status(201).json(ride);
});

// Записаться на поездку
app.post('/api/rides/:id/join', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const db = readDB();
  const ride = db.rides.find(r => r.id === id);
  if (!ride) return res.status(404).json({ error: 'Поездка не найдена' });
  if (ride.seatsAvailable <= 0) return res.status(400).json({ error: 'Нет мест' });

  ride.seatsAvailable -= 1;
  ride.passengers.push(userId);
  writeDB(db);
  res.json(ride);
});

app.post('/api/login', (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email и роль обязательны' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email === email && u.role === role);

  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  res.json(user);
});
app.listen(PORT, () => {
  console.log(`Бэкенд запущен на http://localhost:${PORT}`);
});