const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Funda for rental listings
 */
async function scrapeFunda(settings) {
  try {
    // Funda search URL (override with env if provided)
    const url = process.env.FUNDA_SEARCH_URL || 'https://www.funda.nl/en/huur/';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const listings = [];
    
    // Funda uses dynamic selectors - adjust as needed
    $('[data-test-id="search-result-item"], .search-result, .listing-search-item').each((i, elem) => {
      try {
        const $elem = $(elem);
        const title = $elem.find('[data-test-id="street-name-house-number"], h2, h3').first().text().trim();
        const priceText = $elem.find('[data-test-id="price-rent"], .search-result-price').first().text().trim();
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const link = $elem.find('a').first().attr('href');
        const url = link?.startsWith('http') ? link : `https://www.funda.nl${link}`;
        
  const id = `funda-${url.split('/').filter(Boolean).pop() || Date.now()}`;
        
        if (title && price) {
          listings.push({
            id,
            title,
            price,
            url,
            location: $elem.find('[data-test-id="city"], .search-result-city').first().text().trim() || 'Unknown',
            size: $elem.find('[data-test-id="surface-area"], [title*="Living area"]').first().text().trim() || 'N/A',
            imageUrl: $elem.find('img').first().attr('src') || ''
          });
        }
      } catch (err) {
        console.error('Error parsing Funda listing:', err.message);
      }
    });
    
    return filterListings(listings, settings);
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
