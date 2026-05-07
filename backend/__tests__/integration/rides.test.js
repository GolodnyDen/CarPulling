const request = require('supertest');
const app = require('../../server');

let token;
let userId;

beforeAll(async () => {
  // Регистрируем и логиним тестового водителя
  await request(app).post('/api/register').send({
    name: 'Driver',
    email: 'driver@test.com',
    password: '123456',
    role: 'driver'
  });
  
  const login = await request(app).post('/api/login').send({
    email: 'driver@test.com',
    password: '123456'
  });
  
  token = login.body.token;
  userId = login.body.user.id;
});

describe('GET /api/rides', () => {
  test('возвращает список поездок', async () => {
    const res = await request(app).get('/api/rides');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('фильтрация по from', async () => {
    // Создаём тестовые поездки
    await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({
        from: 'Москва',
        to: 'СПб',
        dateTime: '2024-12-20T10:00',
        seatsAvailable: 3
      });
    
    await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${token}`)
      .send({
        from: 'Казань',
        to: 'Москва',
        dateTime: '2024-12-21T10:00',
        seatsAvailable: 2
      });

    const res = await request(app).get('/api/rides?from=Москва');
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
      .send({ from: 'X', to: 'Y', dateTime: '2024-12-25', seatsAvailable: 1 });
    
    expect(res.status).toBe(401);
  });
});