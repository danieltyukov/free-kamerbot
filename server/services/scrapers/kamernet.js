const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Kamernet for rental listings
 * Note: This is a simplified scraper. You may need to adjust selectors
 * based on Kamernet's current HTML structure.
 */
async function scrapeKamernet(settings) {
  try {
    // Kamernet requires authentication for most features
    // This is a basic example - you'll need to implement proper authentication
    const url = process.env.KAMERNET_SEARCH_URL || 'https://kamernet.nl/en/for-rent/rooms-netherlands';
    
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
    
    // This is a placeholder - actual selectors will vary
    $('.room-listing, .tile-wrapper, [data-testid="listing-card"]').each((i, elem) => {
      try {
        const $elem = $(elem);
        const title = $elem.find('.listing-title, .tile-title, h2, h3').first().text().trim();
        const priceText = $elem.find('.price, .tile-price, [class*="price"]').first().text().trim();
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const link = $elem.find('a').first().attr('href');
        const url = link?.startsWith('http') ? link : `https://kamernet.nl${link}`;
        
        // Extract ID from URL or generate one
  const id = `kamernet-${url.split('/').pop() || Date.now()}`;
        
        if (title && price) {
          listings.push({
            id,
            title,
            price,
            url,
            location: $elem.find('.location, .tile-city').first().text().trim() || 'Unknown',
            size: $elem.find('.size, [class*="size"]').first().text().trim() || 'N/A',
            imageUrl: $elem.find('img').first().attr('src') || ''
          });
        }
      } catch (err) {
        console.error('Error parsing listing:', err.message);
      }
    });
    
    return filterListings(listings, settings);
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
