const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Funda for rental listings
 * 
 * NOTE: Funda currently has anti-bot protection that blocks simple HTTP requests.
 * The page returns a challenge page instead of listings.
 * TODO: Implement one of these solutions:
 * - Use Puppeteer to render JavaScript (slower but works)
 * - Use rotating proxies + better headers
 * - Use Funda's API if available
 * - Parse RSS feed if they have one
 * 
 * For now, Funda scraping is disabled - Kamernet and Pararius work fine.
 */
async function scrapeFunda(settings) {
  try {
    const url = process.env.FUNDA_SEARCH_URL || 'https://www.funda.nl/en/zoeken/huur?selected_area=%5B%22nl%22%5D';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const listings = [];
    
    // Funda uses links with pattern /en/detail/huur/{city}/{type}-{street}/{id}
    $('a[href*="/detail/huur/"], a[href*="/detail/koophuur/"]').each((i, elem) => {
      try {
        const $elem = $(elem);
        const href = $elem.attr('href');
        
        if (!href || !href.includes('/detail/')) return;
        
        const url = href.startsWith('http') ? href : `https://www.funda.nl${href}`;
        
        // Get text content - Funda embeds price and address in link text or nearby
        const text = $elem.text().trim();
        const parent = $elem.closest('div, article, li');
        const allText = parent.text();
        
        // Parse price from text like "€ 3,500 /maand" or "€3500"
        const priceMatch = allText.match(/€\s*([\d,\.]+)\s*\/\s*maand|€\s*([\d,\.]+)/);
        const priceStr = priceMatch ? (priceMatch[1] || priceMatch[2]).replace(/[,\.]/g, '') : '0';
        const price = parseInt(priceStr) || 0;
        
        // Parse size from text like "129 m²"
        const sizeMatch = allText.match(/(\d+)\s*m²/);
        const size = sizeMatch ? `${sizeMatch[1]} m2` : 'N/A';
        
        // Extract address/title from URL or heading
        const heading = parent.find('h2, h3, [data-test-id="street-name-house-number"]').first().text().trim();
        const urlParts = href.split('/');
        const title = heading || urlParts[urlParts.length - 2]?.replace(/-/g, ' ') || 'Listing';
        
        // Extract city from URL
        const cityMatch = href.match(/\/detail\/[^\/]+\/([^\/]+)\//);
        const location = cityMatch ? cityMatch[1].replace(/-/g, ' ') : 'Unknown';
        
        // Generate stable ID from URL (use the numeric ID at end)
        const idMatch = href.match(/\/(\d+)\//);
        const id = idMatch ? `funda-${idMatch[1]}` : `funda-${href.split('/').slice(-2, -1)[0]}`;
        
        // Only include rental listings with price
        if (price > 0 && title && !href.includes('/koop/')) {
          listings.push({
            id,
            title,
            price,
            url,
            location,
            size,
            imageUrl: parent.find('img').first().attr('src') || ''
          });
        }
      } catch (err) {
        // Skip parsing errors
      }
    });
    
    // Deduplicate by ID
    const unique = Array.from(new Map(listings.map(l => [l.id, l])).values());
    
    return filterListings(unique, settings);
  } catch (error) {
    console.error('Funda scraping error:', error.message);
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
  scrapeFunda
};