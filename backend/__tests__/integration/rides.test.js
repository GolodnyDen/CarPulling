const request = require('supertest');
const server = require('../../server');
const app = server.app; // Извлекаем Express приложение

const fs = require('fs');
const path = require('path');
const TEST_DB_PATH = path.join(__dirname, '..', '..', 'data', 'test-db.json');

let token;
let userId;

const uniqueId = Date.now();
const testEmail = `driver_${uniqueId}@test.com`;

beforeAll(async () => {
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ users: [], rides: [] }, null, 2));

  const registerRes = await request(app)
    .post('/api/register')
    .send({
      name: 'Driver Test',
      email: testEmail,
      password: '123456',
      role: 'driver'
    });

  if (registerRes.status !== 201) {
    console.error('Registration failed:', registerRes.body);
    throw new Error(`Registration failed with status ${registerRes.status}`);
  }

  const loginRes = await request(app)
    .post('/api/login')
    .send({
      email: testEmail,
      password: '123456'
    });
  if (loginRes.status !== 200 || !loginRes.body.user) {
    console.error('Login failed:', loginRes.body);
    throw new Error(`Login failed with status ${loginRes.status}`);
  }

  token = loginRes.body.token;
  userId = loginRes.body.user.id;
  ;
});

afterEach(() => {
  const currentDb = JSON.parse(fs.readFileSync(TEST_DB_PATH, 'utf8'));
  const testUser = currentDb.users.find(u => u.id === userId);
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ 
    users: testUser ? [testUser] : [], 
    rides: [] 
  }, null, 2));
});

describe('GET /api/rides', () => {
  test('возвращает список поездок', async () => {
    const res = await request(app).get('/api/rides');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('фильтрация по from', async () => {
    const createRes = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({
        from: 'Москва',
        to: 'СПб',
        dateTime: '2024-12-20T10:00',
        seatsAvailable: 3
      });
    
    expect(createRes.status).toBe(201);

    const res = await request(app).get('/api/rides?from=Москва');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every(r => r.from === 'Москва')).toBe(true);
  });
});

describe('POST /api/rides', () => {
  test('создание поездки с авторизацией', async () => {
    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({
        from: 'Тест-откуда',
        to: 'Тест-куда',
        dateTime: '2024-12-25T15:00',
        seatsAvailable: 4
      });
    
    expect(res.status).toBe(201);
    expect(res.body.from).toBe('Тест-откуда');
    expect(res.body.driverId).toBe(userId);
  });

  test('создание без авторизации — 401', async () => {
    const res = await request(app)
      .post('/api/rides')
      .send({ 
        from: 'X', 
        to: 'Y', 
        dateTime: '2024-12-25T10:00', 
        seatsAvailable: 1 
      });
    
    expect(res.status).toBe(401);
  });
});