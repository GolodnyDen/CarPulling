const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test-db.json');
const ORIGINAL_DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

beforeAll(() => {
  const dataDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
});

beforeEach(() => {
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ users: [], rides: [] }, null, 2));
  
  jest.doMock('../server', () => {
    const originalModule = jest.requireActual('../server');
    return originalModule;
  }, { virtual: true });
});

afterEach(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});