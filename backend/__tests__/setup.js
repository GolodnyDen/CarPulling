const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test-db.json');

beforeEach(() => {
  // Создаём чистую тестовую БД
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ users: [], rides: [] }, null, 2));
});

afterEach(() => {
  // Очищаем после теста
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});