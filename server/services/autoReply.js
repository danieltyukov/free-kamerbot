const puppeteer = require('puppeteer');
const fs = require('fs');
const { getDb } = require('../utils/database');

/**
 * Auto-reply to Kamernet listings
 */
async function autoReply(listing) {
  const db = getDb();
  const settings = db.get('settings').value();
  
  // Check if already replied
  const repliedListings = db.get('repliedListings').value();
  if (repliedListings.includes(listing.id)) {
    console.log(`⏭️  Already replied to ${listing.id}`);
    return { success: false, message: 'Already replied' };
  }
  
  if (!settings.credentials.kamernet.email || !settings.credentials.kamernet.password) {
    console.log('❌ Kamernet credentials not configured');
    return { success: false, message: 'Credentials not configured' };
  }
  
  try {
    console.log(`🤖 Auto-replying to: ${listing.title}`);

    // Determine executable path for system Chrome/Chromium if bundled Chromium is not available
    const candidatePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
      // macOS
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      // Windows
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ].filter(Boolean);

    let executablePath;
    for (const p of candidatePaths) {
      try {
        if (p && fs.existsSync(p)) { executablePath = p; break; }
      } catch (_) {}
    }

    const headless = process.env.AUTO_REPLY_HEADLESS === 'false' ? false : 'new';

    const browser = await puppeteer.launch({
      headless,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Login to Kamernet
    await page.goto('https://kamernet.nl/en/login', { waitUntil: 'networkidle2' });
    
    // Fill login form
    await page.type('input[name="email"], input[type="email"]', settings.credentials.kamernet.email);
    await page.type('input[name="password"], input[type="password"]', settings.credentials.kamernet.password);
    
    // Submit login
    await Promise.all([
      page.click('button[type="submit"], input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Check if login successful
    const loginFailed = await page.$('.error, .alert-danger');
    if (loginFailed) {
      await browser.close();
      return { success: false, message: 'Login failed' };
    }
    
    // Navigate to listing
    await page.goto(listing.url, { waitUntil: 'networkidle2' });
    
    // Wait for reply button/form
    await page.waitForSelector('textarea, .message-form, [name="message"]', { timeout: 5000 });
    
    // Fill message
    const message = settings.autoReply.message;
    await page.type('textarea, [name="message"]', message);
    
    // Send message
    await Promise.all([
      page.click('button[type="submit"], .send-button, .btn-primary'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    ]);
    
  await browser.close();
    
    // Mark as replied
    db.get('repliedListings').push(listing.id).write();
    
    console.log(`✅ Successfully replied to ${listing.title}`);
    return { success: true, message: 'Reply sent' };
    
  } catch (error) {
    console.error(`❌ Auto-reply error for ${listing.id}:`, error.message);
    return { success: false, message: error.message };
  }
}

module.exports = {
  autoReply
};
