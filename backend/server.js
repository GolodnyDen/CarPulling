const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data', 'db.json');

if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}


if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], rides: [] }, null, 2));
}

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}


app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }

  const db = readDB();
  const userExists = db.users.some(u => u.email === email);
  if (userExists) {
    return res.status(409).json({ error: 'Пользователь уже существует' });
  }


  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword, 
    role,
  };

  db.users.push(newUser);
  writeDB(db);


  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ error: 'Неверный email или пароль' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

app.get('/api/rides', (req, res) => {
  const db = readDB();
  res.json(db.rides);
});

app.post('/api/rides', (req, res) => {
  const { driverId, from, to, dateTime, seatsAvailable } = req.body;

  if (!driverId || !from || !to || !dateTime || seatsAvailable == null) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  const db = readDB();
  const ride = {
    id: Date.now().toString(),
    driverId,
    from,
    to,
    dateTime,
    seatsAvailable: parseInt(seatsAvailable, 10),
    passengers: [],
  };
  db.rides.push(ride);
  writeDB(db);
  res.status(201).json(ride);
});

app.post('/api/rides/:id/join', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Требуется userId' });
  }

  const db = readDB();
  const ride = db.rides.find(r => r.id === id);
  if (!ride) return res.status(404).json({ error: 'Поездка не найдена' });
  if (ride.seatsAvailable <= 0) return res.status(400).json({ error: 'Нет мест' });

  ride.seatsAvailable -= 1;
  ride.passengers.push(userId);
  writeDB(db);
  res.json(ride);
});

app.listen(PORT, () => {
  console.log(`Бэкенд запущен на http://localhost:${PORT}`);
});