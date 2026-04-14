const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    rides: []
  }, null, 2));
}

let dbLock = false;

async function withDB(callback) {
  while (dbLock) {
    await new Promise(res => setTimeout(res, 10));
  }
  dbLock = true;
  try {
    const db = readDB();
    const result = await callback(db);
    writeDB(db);
    return result;
  } finally {
    dbLock = false;
  }
}

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB, withDB, DB_PATH };