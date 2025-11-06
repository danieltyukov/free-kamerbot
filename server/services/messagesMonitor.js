const puppeteer = require('puppeteer');
const fs = require('fs');
const { getDb } = require('../utils/database');

function resolveExecutablePath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Windows
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch (_) {}
  }
}

async function fetchKamernetMessages() {
  const db = getDb();
  const settings = db.get('settings').value();

  if (!settings.credentials.kamernet.email || !settings.credentials.kamernet.password) {
    console.log('⚠️  Kamernet messages: credentials not configured');
    return [];
  }

  // Kamernet login URL changed - disabling for now
  // TODO: Update login flow when Kamernet auth structure is confirmed
  console.log('⚠️  Kamernet messages monitoring temporarily disabled (login flow needs update)');
  return [];

  /* Commented out until login URL is fixed
  const headless = process.env.AUTO_REPLY_HEADLESS === 'false' ? false : 'new';
  const executablePath = resolveExecutablePath();

  let browser;
  try {
    browser = await puppeteer.launch({ headless, executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Login - NOTE: This URL returns 404 now, needs investigation
    await page.goto('https://kamernet.nl/en/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.type('input[name="email"], input[type="email"]', settings.credentials.kamernet.email, { delay: 10 });
    await page.type('input[name="password"], input[type="password"]', settings.credentials.kamernet.password, { delay: 10 });
    await Promise.all([
      page.click('button[type="submit"], input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    // Go to messages inbox
    await page.goto('https://kamernet.nl/en/messages', { waitUntil: 'networkidle2', timeout: 30000 });

    // Extract message previews
    const messages = await page.evaluate(() => {
      const items = [];
      const rows = document.querySelectorAll('[data-testid*="message"], .message-item, .conversation');
      rows.forEach((row, i) => {
        const from = row.querySelector('[class*="sender"], .from, .name')?.textContent?.trim();
        const subject = row.querySelector('[class*="subject"], .subject, .title')?.textContent?.trim();
        const preview = row.querySelector('[class*="preview"], .snippet')?.textContent?.trim();
        const time = row.querySelector('time, [class*="time"], .date')?.getAttribute('datetime') || row.querySelector('time, .date')?.textContent?.trim();
        if (from || subject || preview) {
          items.push({
            id: `km-msg-${Date.now()}-${i}`,
            from,
            subject,
            preview,
            timestamp: time || new Date().toISOString(),
            read: false
          });
        }
      });
      return items;
    });

    await browser.close();

    // Deduplicate by preview+timestamp basic heuristic
    const existing = db.get('messages').value();
    const existingKeys = new Set(existing.map(m => `${m.from}|${m.subject}|${m.preview}|${m.timestamp}`));
    const newOnes = messages.filter(m => !existingKeys.has(`${m.from}|${m.subject}|${m.preview}|${m.timestamp}`));

    if (newOnes.length) {
      newOnes.forEach(m => db.get('messages').unshift(m).write());
    }

    return newOnes;
  } catch (err) {
    if (browser) try { await browser.close(); } catch (_) {}
    console.error('Kamernet messages check error:', err.message);
    return [];
  }
  */
}

module.exports = { fetchKamernetMessages };
