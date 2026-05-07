const request = require('supertest');
const server = require('../../server');
const app = server.app;
const fs = require('fs');
const path = require('path');
const TEST_DB_PATH = path.join(__dirname, '..', '..', 'data', 'test-db.json');

beforeEach(() => {
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ users: [], rides: [] }, null, 2));
});

afterEach(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});
describe('POST /api/register', () => {
  test('успешная регистрация', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        name: 'Тест',
        email: 'test@example.com',
        password: '123456',
        role: 'passenger'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.password).toBeUndefined(); // пароль не возвращается
  });

  test('регистрация с существующим email', async () => {
    // Сначала регистрируем
    await request(app).post('/api/register').send({
      name: 'Тест',
      email: 'exists@example.com',
      password: '123456',
      role: 'passenger'
    });

    // Пытаемся ещё раз
    const res = await request(app)
      .post('/api/register')
      .send({
        name: 'Тест2',
        email: 'exists@example.com',
        password: '123456',
        role: 'passenger'
      });
    
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('уже существует');
  });

  test('регистрация с невалидным email', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        name: 'Тест',
        email: 'невалидный',
        password: '123456',
        role: 'passenger'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Некорректный');
  });
});

describe('POST /api/login', () => {
  beforeEach(async () => {
    // Создаём тестового пользователя
    await request(app).post('/api/register').send({
      name: 'ЛогинТест',
      email: 'login@test.com',
      password: 'password123',
      role: 'driver'
    });
  });

  test('успешный вход', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'login@test.com',
        password: 'password123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('driver');
  });

  test('неверный пароль', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'login@test.com',
        password: 'wrong'
      });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Неверные');
  });
});