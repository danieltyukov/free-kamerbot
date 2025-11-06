const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

function normalizeUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function extractPriceNear($, el) {
  // Look up through a few parents and scan text for euro amounts
  const maxDepth = 3;
  let depth = 0;
  let node = el;
  while (node && depth <= maxDepth) {
    const text = $(node).text();
    const match = text && text.match(/[€\$]\s*([0-9][0-9\.,\s]+)/);
    if (match) {
      const n = parseInt(match[1].replace(/[^0-9]/g, ''));
      if (!isNaN(n)) return n;
    }
    node = node.parent;
    depth += 1;
  }
  return 0;
}

function extractSizeNear($, el) {
  const maxDepth = 3;
  let depth = 0;
  let node = el;
  while (node && depth <= maxDepth) {
    const text = $(node).text();
    const match = text && text.match(/([0-9]{1,4})\s?m²|([0-9]{1,4})\s?m2/i);
    const val = (match && (match[1] || match[2])) ? parseInt((match[1] || match[2]), 10) : null;
    if (val) return `${val} m2`;
    node = node.parent;
    depth += 1;
  }
  return 'N/A';
}

function guessLocationNear($, el) {
  // Try common class names
  const candidates = ['.city', '.location', '[data-test*="city"]', '[class*="city"]', '[class*="location"]'];
  for (const sel of candidates) {
    const t = $(el).closest('*').find(sel).first().text().trim();
    if (t) return t;
  }
  return 'Unknown';
}

function looksLikeListing(anchorHref, anchorText) {
  const href = (anchorHref || '').toLowerCase();
  const text = (anchorText || '').toLowerCase();
  const tokens = ['huur', 'rent', 'woning', 'apartment', 'studio', 'kamer', 'room', 'te-huur', 'huurwoning'];
  return tokens.some(t => href.includes(t) || text.includes(t));
}

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const it of arr) {
    const k = keyFn(it);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}

async function scrapeOne(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8'
    },
    timeout: 12000
  });
  const $ = cheerio.load(response.data);
  const anchors = $('a[href]');
  const base = url;
  const sameHost = new URL(url).host;
  const items = [];

  anchors.each((_, a) => {
    const $a = $(a);
    const hrefRaw = $a.attr('href');
    const full = normalizeUrl(hrefRaw, base);
    if (!full) return;
    if (new URL(full).host !== sameHost) return; // keep within site

    const text = $a.text().trim() || $a.attr('title') || '';
    if (!looksLikeListing(full, text)) return;

    // Try to get a reasonable container around the anchor
    const container = $a.closest('article, li, .card, .listing, .property, .result, div');
    const price = extractPriceNear($, container.length ? container : a);
    const size = extractSizeNear($, container.length ? container : a);
    const location = guessLocationNear($, container.length ? container : a);
    const img = (container.length ? container : $a.closest('div')).find('img').first().attr('src') || '';

    const idSlug = full.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const id = `extra-${idSlug}`; // stable id by URL

    items.push({
      id,
      title: text || 'Listing',
      price: price || 0,
      url: full,
      location,
      size,
      imageUrl: img
    });
  });

  return uniqueBy(items, it => it.id);
}

async function scrapeExtraSources(settings) {
  const urls = (settings.sources && Array.isArray(settings.sources.extraUrls)) ? settings.sources.extraUrls.filter(Boolean) : [];
  if (!urls.length) return [];

  const all = [];
  for (const u of urls) {
    try {
      const items = await scrapeOne(u);
      all.push(...items);
    } catch (err) {
      console.error(`Extra source scrape failed for ${u}:`, err.message);
    }
  }
  // Optional: apply filters if we have price/size data
  if (!settings.filters) return all;
  return all.filter(listing => {
    const price = listing.price || 0;
    const size = parseInt(listing.size) || 0;
    if (settings.filters.minPrice && price < settings.filters.minPrice) return false;
    if (settings.filters.maxPrice && price > settings.filters.maxPrice) return false;
    if (settings.filters.minSize && size < settings.filters.minSize) return false;
    if (settings.filters.maxSize && size > settings.filters.maxSize) return false;
    return true;
  });
}

module.exports = { scrapeExtraSources };
