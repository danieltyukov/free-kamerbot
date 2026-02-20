const cron = require('node-cron');
const { getDb } = require('../utils/database');
const { scrapeKamernet } = require('./scrapers/kamernet');
const { scrapeFunda } = require('./scrapers/funda');
const { scrapePararius } = require('./scrapers/pararius');
const { scrapeExtraSources } = require('./scrapers/extraSources');
const { sendNotification } = require('./notifications');
const { autoReply } = require('./autoReply');
const { fetchKamernetMessages } = require('./messagesMonitor');

let monitoringJobs = [];

async function checkNewListings(platform, scraper) {
  try {
    console.log(`🔍 Checking ${platform} for new listings...`);
    const db = getDb();
    const settings = db.get('settings').value();
    
    const newListings = await scraper(settings);
    
    if (newListings && newListings.length > 0) {
      const existingListings = db.get('listings').value();
      const existingIds = new Set(existingListings.map(l => l.id));

      // Deduplicate: exclude already-stored IDs AND duplicates within the batch
      const seenInBatch = new Set();
      const trulyNewListings = newListings.filter(listing => {
        if (existingIds.has(listing.id) || seenInBatch.has(listing.id)) return false;
        seenInBatch.add(listing.id);
        return true;
      });
      
      if (trulyNewListings.length > 0) {
        console.log(`✨ Found ${trulyNewListings.length} new listings on ${platform}`);
        
        // Add to database
        trulyNewListings.forEach(listing => {
          db.get('listings')
            .push({
              ...listing,
              platform,
              discovered: new Date().toISOString(),
              read: false,
              favorite: false
            })
            .write();
        });
        
        // Send notifications
        if (settings.notifications.enabled) {
          trulyNewListings.forEach(listing => {
            sendNotification({
              title: `New listing on ${platform}`,
              body: listing.price ? `${listing.title} - €${listing.price}` : listing.title,
              url: listing.url
            });
          });
        }
        
        // Auto-reply for Kamernet
        if (platform === 'Kamernet' && settings.autoReply.enabled) {
          for (const listing of trulyNewListings) {
            await autoReply(listing);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error checking ${platform}:`, error.message);
  }
}

function startMonitoring() {
  const db = getDb();
  const settings = db.get('settings').value();
  
  // Clear existing jobs
  monitoringJobs.forEach(job => job.stop());
  monitoringJobs = [];
  
  // Kamernet monitoring
  if (settings.monitoring.kamernet.enabled) {
    const interval = settings.monitoring.kamernet.interval;
    const job = cron.schedule(`*/${interval} * * * *`, () => {
      checkNewListings('Kamernet', scrapeKamernet);
    });
    monitoringJobs.push(job);
    console.log(`📡 Kamernet monitoring started (every ${interval} minutes)`);
  }
  
  // Funda monitoring
  if (settings.monitoring.funda.enabled) {
    const interval = settings.monitoring.funda.interval;
    const job = cron.schedule(`*/${interval} * * * *`, () => {
      checkNewListings('Funda', scrapeFunda);
    });
    monitoringJobs.push(job);
    console.log(`📡 Funda monitoring started (every ${interval} minutes)`);
  }
  
  // Pararius monitoring
  if (settings.monitoring.pararius.enabled) {
    const interval = settings.monitoring.pararius.interval;
    const job = cron.schedule(`*/${interval} * * * *`, () => {
      checkNewListings('Pararius', scrapePararius);
    });
    monitoringJobs.push(job);
    console.log(`📡 Pararius monitoring started (every ${interval} minutes)`);
  }
 
  // Extra sources (agencies) monitoring
  const extraUrls = (settings.sources && Array.isArray(settings.sources.extraUrls)) ? settings.sources.extraUrls.filter(Boolean) : [];
  if (extraUrls.length) {
    const interval = settings.monitoring.pararius?.interval || 3; // reuse a 3-min default
    const job = cron.schedule(`*/${interval} * * * *`, () => {
      checkNewListings('Extra', scrapeExtraSources);
    });
    monitoringJobs.push(job);
    console.log(`📡 Extra sources monitoring started (every ${interval} minutes) — ${extraUrls.length} URLs`);
  }
  
  // Messages monitoring (Kamernet)
  if (settings.monitoring.messages && settings.monitoring.messages.enabled) {
    const interval = settings.monitoring.messages.interval;
    const job = cron.schedule(`*/${interval} * * * *`, async () => {
      try {
        console.log('📥 Checking for new messages...');
        const newMessages = await fetchKamernetMessages();
        if (newMessages.length) {
          console.log(`✉️  Found ${newMessages.length} new messages`);
          if (settings.notifications.enabled) {
            newMessages.forEach(m => sendNotification({
              title: 'New message',
              body: `${m.from || 'Landlord'}: ${m.subject || m.preview || ''}`
            }));
          }
        }
      } catch (err) {
        console.error('Message monitor error:', err.message);
      }
    });
    monitoringJobs.push(job);
    console.log(`📬 Messages monitoring started (every ${interval} minutes)`);
  }
  
  // Initial check
  setTimeout(() => {
    if (settings.monitoring.kamernet.enabled) checkNewListings('Kamernet', scrapeKamernet);
    if (settings.monitoring.funda.enabled) checkNewListings('Funda', scrapeFunda);
    if (settings.monitoring.pararius.enabled) checkNewListings('Pararius', scrapePararius);
    if (extraUrls.length) checkNewListings('Extra', scrapeExtraSources);
    if (settings.monitoring.messages && settings.monitoring.messages.enabled) fetchKamernetMessages().catch(() => {});
  }, 5000);
}

function stopMonitoring() {
  monitoringJobs.forEach(job => job.stop());
  monitoringJobs = [];
  console.log('🛑 Monitoring stopped');
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  checkNewListings
};
