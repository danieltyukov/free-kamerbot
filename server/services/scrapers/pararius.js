const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Pararius for rental listings
 */
async function scrapePararius(settings) {
  try {
    const url = process.env.PARARIUS_SEARCH_URL || 'https://www.pararius.com/apartments';
    
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
    
    // Pararius listing selectors
    $('.search-list__item, .listing-search-item').each((i, elem) => {
      try {
        const $elem = $(elem);
        const title = $elem.find('.listing-search-item__link--title, h2').first().text().trim();
        const priceText = $elem.find('.listing-search-item__price, .price').first().text().trim();
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const link = $elem.find('a').first().attr('href');
        const url = link?.startsWith('http') ? link : `https://www.pararius.com${link}`;
        
        // URL pattern: /apartment-for-rent/{city}/{hash}/{street}
        // Use hash + street for unique ID (street alone causes collisions)
        const urlParts = url.split('/').filter(Boolean);
        const slug = urlParts.slice(-2).join('-') || Date.now().toString();
        const id = `pararius-${slug}`;
        
        // Sanity floor: realistic NL rents start well above €50/month.
        if (title && price >= 50) {
          listings.push({
            id,
            title,
            price,
            url,
            location: $elem.find('.listing-search-item__location, .location').first().text().trim() || 'Unknown',
            size: $elem.find('.listing-search-item__feature--surface-area, [class*="surface"]').first().text().trim() || 'N/A',
            imageUrl: $elem.find('img').first().attr('src') || ''
          });
        }
      } catch (err) {
        console.error('Error parsing Pararius listing:', err.message);
      }
    });
    
    return filterListings(listings, settings);
  } catch (error) {
    console.error('Pararius scraping error:', error.message);
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
  scrapePararius
};
