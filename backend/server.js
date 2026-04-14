require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: false
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/users', require('./routes/users'));

app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Внутренняя ошибка сервера'
      : err.message
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Эндпоинт не найден' });
});

app.listen(PORT, () => {
  console.log(`🚗 Бэкенд запущен на http://localhost:${PORT}`);
  console.log(`📝 Режим: ${process.env.NODE_ENV || 'development'}`);
});