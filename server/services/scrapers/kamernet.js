const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Kamernet for rental listings
 */
async function scrapeKamernet(settings) {
  try {
    const url = process.env.KAMERNET_SEARCH_URL || 'https://kamernet.nl/en/for-rent/rooms-netherlands';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const listings = [];
    
    // Kamernet uses links with pattern /en/for-rent/{type}-{city}/{street}/{id}
    $('a[href*="/for-rent/"]').each((i, elem) => {
      try {
        const $elem = $(elem);
        const href = $elem.attr('href');
        
        // Skip navigation and non-listing links
        if (!href || href.includes('properties-') || !href.match(/\/(room|apartment|studio|house)-/)) {
          return;
        }
        
        const url = href.startsWith('http') ? href : `https://kamernet.nl${href}`;
        
        // Extract text content
        const text = $elem.text().trim();
        
        // Parse price from text like "€775" or "775 euro" — require ≥3 digits to
        // avoid matching unrelated numbers (e.g. "1 reaction", "1 month available").
        // Also accept 2 digits but only when followed by a clear monthly suffix.
        const priceMatch =
          text.match(/€\s*(\d{3,5})|(\d{3,5})\s*euro/i) ||
          text.match(/€\s*(\d{2,5})\s*\/?\s*(?:month|maand|p\/?m)/i) ||
          text.match(/(\d{2,5})\s*euro\s*\/?\s*(?:month|maand|p\/?m)/i);
        const price = priceMatch ? parseInt(priceMatch[1] || priceMatch[2]) : 0;
        
        // Parse size from text like "18 m²" or "18m2"
        const sizeMatch = text.match(/(\d+)\s*m[²2]/i);
        const size = sizeMatch ? `${sizeMatch[1]} m2` : 'N/A';
        
        // Extract location (city name) from text or URL
        const cityMatch = text.match(/,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
        const location = cityMatch ? cityMatch[1] : (href.split('/')[3] || 'Unknown');
        
        // Title is the street name or full text
        const streetMatch = href.match(/\/([^\/]+)\/[^\/]+$/);
        const title = streetMatch ? streetMatch[1].replace(/-/g, ' ') : text.substring(0, 50);
        
        // Generate stable ID from URL
        const id = `kamernet-${href.split('/').slice(-1)[0]}`;
        
        // Sanity floor: realistic NL rents start well above €50/month.
        // Anything below is almost certainly a parse error (deposit, fee, time-ago, etc.).
        if (price >= 50 && title) {
          listings.push({
            id,
            title,
            price,
            url,
            location,
            size,
            imageUrl: '' // We could parse images but keeping it simple
          });
        }
      } catch (err) {
        // Skip parsing errors for individual listings
      }
    });
    
    // Deduplicate by ID (same listing may appear in featured and regular lists)
    const unique = Array.from(new Map(listings.map(l => [l.id, l])).values());
    
    return filterListings(unique, settings);
  } catch (error) {
    console.error('Kamernet scraping error:', error.message);
    return [];
  }
}

function filterListings(listings, settings) {
  if (!settings.filters) return listings;
  
  return listings.filter(listing => {
    const price = listing.price || 0;
    const size = parseInt(listing.size) || 0;
    
    if (settings.filters.minPrice && price < settings.filters.minPrice) return false;
    if (settings.filters.maxPrice && price > settings.filters.maxPrice) return false;
    if (settings.filters.minSize && size < settings.filters.minSize) return false;
    if (settings.filters.maxSize && size > settings.filters.maxSize) return false;
    
    return true;
  });
}

module.exports = {
  scrapeKamernet
};