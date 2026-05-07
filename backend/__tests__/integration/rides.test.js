// backend/__tests__/integration/rides.test.js
const request = require('supertest');
const server = require('../../server');
const app = server.app;

const fs = require('fs');
const path = require('path');

const TEST_DB_DIR = path.join(__dirname, '..', '..', 'data');
const TEST_DB_PATH = path.join(TEST_DB_DIR, 'db.json');

let token;
let userId;
const uniqueId = Date.now();
const testEmail = `driver_${uniqueId}@test.com`;

function initTestDb() {
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
  const initialData = { users: [], rides: [] };
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify(initialData, null, 2));
}

beforeAll(async () => {
  // 1. Инициализируем чистую БД
  initTestDb();

  // 2. Регистрируем пользователя
  const registerRes = await request(app)
    .post('/api/register')
    .send({
      name: 'Driver Test',
      email: testEmail,
      password: '123456',
      role: 'driver'
    });

  if (registerRes.status !== 201) {
    throw new Error(`Registration failed: ${JSON.stringify(registerRes.body)}`);
  }

  // 3. Логинимся
  const loginRes = await request(app)
    .post('/api/login')
    .send({
      email: testEmail,
      password: '123456'
    });

  if (loginRes.status !== 200 || !loginRes.body.user) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  }

  token = loginRes.body.token;
  userId = loginRes.body.user.id;
});

afterEach(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      const currentDb = JSON.parse(fs.readFileSync(TEST_DB_PATH, 'utf8'));
      const testUser = currentDb.users.find(u => u.id === userId);
      fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ 
        users: testUser ? [testUser] : [], 
        rides: [] 
      }, null, 2));
    } catch (err) {
      initTestDb();
      fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ users: [], rides: [] }, null, 2));
    }
  } else {
    initTestDb();
  }
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
    
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some(r => r.from === 'Москва')).toBe(true);
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