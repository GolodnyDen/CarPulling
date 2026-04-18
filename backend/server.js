const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const sitemapRoutes = require('./routes/sitemap');

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'carpool_secret_12345';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sitemapRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения JPEG, PNG, WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

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

function filterAndPaginate(items, filters, searchFields = []) {
  let result = [...items];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(item =>
      searchFields.some(field =>
        item[field]?.toLowerCase().includes(search)
      )
    );
  }
  
  if (filters.from) {
    result = result.filter(r => r.from.toLowerCase().includes(filters.from.toLowerCase()));
  }
  if (filters.to) {
    result = result.filter(r => r.to.toLowerCase().includes(filters.to.toLowerCase()));
  }
  if (filters.minSeats) {
    result = result.filter(r => r.seatsAvailable >= filters.minSeats);
  }
  if (filters.driverId) {
    result = result.filter(r => r.driverId === filters.driverId);
  }
  
  if (filters.sortBy) {
    const { sortBy, sortOrder = 'asc' } = filters;
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'dateTime') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit) || 10));
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);
  
  return {
    data: paginated,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
  };
}

function validatePaginationParams(req, res, next) {
  const { page, limit, sortBy, sortOrder } = req.query;
  
  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({ error: 'Некорректный номер страницы' });
  }
  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({ error: 'Лимит должен быть от 1 до 100' });
  }
  if (sortBy && !['dateTime', 'seatsAvailable', 'from', 'to', 'createdAt'].includes(sortBy)) {
    return res.status(400).json({ error: 'Недопустимое поле сортировки' });
  }
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    return res.status(400).json({ error: 'Порядок сортировки: asc или desc' });
  }
  
  next();
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
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
    avatar: null,
    rating: 0,
    ratingCount: 0,
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Неверные данные' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Неверные данные' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

app.get('/api/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/me', authenticateToken, (req, res) => {
  const { name, email, role } = req.body;
  const db = readDB();
  
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: 'Пользователь не найден' });
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }
  if (role && !['driver', 'passenger', 'admin', 'guest'].includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' });
  }
  
  if (name) db.users[userIndex].name = name;
  if (email) db.users[userIndex].email = email;
  if (role) db.users[userIndex].role = role;
  
  writeDB(db);
  const { password, ...safeUser } = db.users[userIndex];
  res.json(safeUser);
});

app.delete('/api/me', authenticateToken, (req, res) => {
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) return res.status(404).json({ error: 'Пользователь не найден' });
  
  db.rides = db.rides.filter(r => r.driverId !== req.user.id);
  db.users.splice(userIndex, 1);
  
  writeDB(db);
  res.json({ message: 'Аккаунт удалён' });
});


app.get('/api/rides', validatePaginationParams, (req, res) => {
  const db = readDB();
  
  const filters = {
    search: req.query.search,
    from: req.query.from,
    to: req.query.to,
    minSeats: req.query.minSeats ? parseInt(req.query.minSeats) : undefined,
    driverId: req.query.driverId,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    page: req.query.page,
    limit: req.query.limit,
  };
  
  const result = filterAndPaginate(db.rides, filters, ['from', 'to']);
  res.json({ success: true, ...result });
});

app.post('/api/rides', authenticateToken, (req, res) => {
  const { from, to, dateTime, seatsAvailable, seatsTotal, description } = req.body;
  if (!from || !to || !dateTime || seatsAvailable == null) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  const db = readDB();
  const ride = {
    id: Date.now().toString(),
    driverId: req.user.id,
    driverName: req.user.name,
    from,
    to,
    dateTime,
    seatsAvailable: parseInt(seatsAvailable, 10),
    seatsTotal: seatsTotal ? parseInt(seatsTotal, 10) : parseInt(seatsAvailable, 10),
    passengers: [],
    description: description || '',
    routeImage: null,
    createdAt: new Date().toISOString(),
  };
  db.rides.push(ride);
  writeDB(db);
  res.status(201).json(ride);
});

app.get('/api/rides/:id', (req, res) => {
  const db = readDB();
  const ride = db.rides.find(r => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Поездка не найдена' });
  res.json(ride);
});

app.put('/api/rides/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const rideIndex = db.rides.findIndex(r => r.id === req.params.id);
  
  if (rideIndex === -1) return res.status(404).json({ error: 'Поездка не найдена' });
  if (db.rides[rideIndex].driverId !== req.user.id) {
    return res.status(403).json({ error: 'Нет прав' });
  }
  
  const { from, to, dateTime, seatsAvailable, description } = req.body;
  if (from) db.rides[rideIndex].from = from;
  if (to) db.rides[rideIndex].to = to;
  if (dateTime) db.rides[rideIndex].dateTime = dateTime;
  if (seatsAvailable != null) db.rides[rideIndex].seatsAvailable = parseInt(seatsAvailable, 10);
  if (description != null) db.rides[rideIndex].description = description;
  
  writeDB(db);
  res.json(db.rides[rideIndex]);
});

app.delete('/api/rides/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const rideIndex = db.rides.findIndex(r => r.id === req.params.id);
  
  if (rideIndex === -1) return res.status(404).json({ error: 'Поездка не найдена' });
  if (db.rides[rideIndex].driverId !== req.user.id) {
    return res.status(403).json({ error: 'Нет прав' });
  }
  
  db.rides.splice(rideIndex, 1);
  writeDB(db);
  res.json({ message: 'Поездка удалена' });
});

app.post('/api/rides/:id/join', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const rideIndex = db.rides.findIndex(r => r.id === id);
  
  if (rideIndex === -1) return res.status(404).json({ error: 'Поездка не найдена' });
  if (db.rides[rideIndex].seatsAvailable <= 0) {
    return res.status(400).json({ error: 'Нет мест' });
  }
  if (db.rides[rideIndex].passengers.includes(req.user.id)) {
    return res.status(400).json({ error: 'Вы уже записаны' });
  }

  db.rides[rideIndex].seatsAvailable -= 1;
  db.rides[rideIndex].passengers.push(req.user.id);
  writeDB(db);
  res.json(db.rides[rideIndex]);
});

app.post('/api/users/avatar', authenticateToken, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: 'Пользователь не найден' });
  
  const avatarUrl = `/uploads/${req.file.filename}`;
  db.users[userIndex].avatar = avatarUrl;
  writeDB(db);
  
  res.json({ avatar: avatarUrl });
});

app.post('/api/rides/:id/image', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  
  const { id } = req.params;
  const db = readDB();
  const rideIndex = db.rides.findIndex(r => r.id === id);
  
  if (rideIndex === -1) return res.status(404).json({ error: 'Поездка не найдена' });
  if (db.rides[rideIndex].driverId !== req.user.id) {
    return res.status(403).json({ error: 'Нет прав' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  db.rides[rideIndex].routeImage = imageUrl;
  writeDB(db);
  
  res.json({ routeImage: imageUrl });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.delete('/api/files/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Файл не найден' });
  }
  
  const db = readDB();
  const userOwnsFile = db.users.some(u => u.avatar === `/uploads/${filename}` && u.id === req.user.id) ||
                       db.rides.some(r => r.routeImage === `/uploads/${filename}` && r.driverId === req.user.id);
  
  if (!userOwnsFile) {
    return res.status(403).json({ error: 'Нет прав на удаление' });
  }
  
  fs.unlinkSync(filePath);
  
  db.users.forEach(u => { if (u.avatar === `/uploads/${filename}`) u.avatar = null; });
  db.rides.forEach(r => { if (r.routeImage === `/uploads/${filename}`) r.routeImage = null; });
  writeDB(db);
  
  res.json({ message: 'Файл удалён' });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  next();
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
app.listen(PORT, () => {
  console.log(`✅ Бэкенд запущен на http://localhost:${PORT}`);
});