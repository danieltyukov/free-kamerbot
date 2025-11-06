const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/db.json');
const adapter = new FileSync(dbPath);
const db = low(adapter);

function initDatabase() {
  // Set default data structure
  db.defaults({
    listings: [],
    messages: [],
    settings: {
      sources: { extraUrls: [] },
      searchAreas: [],
      autoReply: {
        enabled: false,
        message: "Hi, I'm interested in this property. Could we schedule a viewing? Best regards"
      },
      filters: {
        minPrice: 0,
        maxPrice: 2000,
        minSize: 0,
        maxSize: 200
      },
      notifications: {
        enabled: true,
        mobile: false
      },
      monitoring: {
        kamernet: { enabled: true, interval: parseInt(process.env.KAMERNET_INTERVAL || '3', 10) },
        funda: { enabled: true, interval: parseInt(process.env.FUNDA_INTERVAL || '3', 10) },
        pararius: { enabled: true, interval: parseInt(process.env.PARARIUS_INTERVAL || '3', 10) },
        messages: { enabled: true, interval: parseInt(process.env.MESSAGES_INTERVAL || '5', 10) }
      },
      credentials: {
        kamernet: {
          email: process.env.KAMERNET_EMAIL || '',
          password: process.env.KAMERNET_PASSWORD || ''
        }
      }
    },
    repliedListings: []
  }).write();

  console.log('✅ Database initialized');
}

function getDb() {
  return db;
}

module.exports = {
  initDatabase,
  getDb
};
