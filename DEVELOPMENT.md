# FreeKamerBot Development & Troubleshooting

## Development

### Project Structure
```
freekamerbot/
├── server/              # Backend (Node.js/Express)
│   ├── index.js        # Main server file
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   │   ├── scrapers/   # Platform scrapers
│   │   ├── monitor.js  # Monitoring service
│   │   ├── autoReply.js
│   │   └── notifications.js
│   └── utils/          # Utilities
├── client/             # Frontend (React)
│   ├── src/
│   │   ├── pages/      # React pages
│   │   └── utils/      # Frontend utilities
│   └── public/
├── data/               # Local database
└── .env                # Configuration
```

### Running in Development Mode

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

Both (recommended):
```bash
npm start
```

### Customizing Scrapers

The scrapers in `server/services/scrapers/` are basic implementations. You'll need to:

1. **Update CSS selectors** - Websites change their HTML frequently
2. **Add authentication** - For Kamernet, implement proper login
3. **Handle pagination** - To get more results
4. **Add error handling** - For rate limiting, captchas, etc.

Example for Kamernet:
```javascript
// server/services/scrapers/kamernet.js
// Update selectors based on current HTML structure
const title = $elem.find('.actual-title-class').text();
```

### Testing Scrapers

Test individual scrapers:
```bash
node -e "
const { scrapeKamernet } = require('./server/services/scrapers/kamernet');
scrapeKamernet({}).then(console.log);
"
```

## Troubleshooting

### Common Issues

**1. Scrapers not finding listings**
- Website HTML structure may have changed
- Update CSS selectors in scraper files
- Check if website requires authentication
- Use browser DevTools to inspect current HTML

**2. Auto-reply not working**
- Verify Kamernet credentials in `.env`
- Check if Kamernet login page has changed
- Update Puppeteer selectors in `server/services/autoReply.js`
- Enable headless: false in Puppeteer to see what's happening

**3. Notifications not showing**
- Check browser notification permissions
- Enable notifications in Settings page
- Check browser console for errors

**4. Port already in use**
- Change PORT in `.env` file
- Or kill process using the port: `lsof -ti:3001 | xargs kill`

### Advanced Configuration

**Rate Limiting**
To avoid being blocked, increase monitoring intervals:
```env
KAMERNET_INTERVAL=10
FUNDA_INTERVAL=15
PARARIUS_INTERVAL=15
```

**Proxy Support**
Add proxy configuration to scrapers:
```javascript
const response = await axios.get(url, {
  proxy: {
    host: 'proxy.example.com',
    port: 8080
  }
});
```

**Custom Search URLs**
Edit scraper files to use specific search URLs:
```javascript
// For specific city, price range, etc.
const url = 'https://kamernet.nl/en/for-rent/rooms-amsterdam?minPrice=500&maxPrice=1000';
```

## Legal & Ethical Considerations

⚠️ **Important**:
- Web scraping may violate terms of service
- Use reasonable request intervals
- Don't overwhelm servers
- This tool is for educational/personal use only
- Consider using official APIs when available
- Respect robots.txt files

## Production Deployment

For production use:

1. **Environment**:
   - Set `NODE_ENV=production`
   - Build frontend: `npm run build`
   - Use process manager (PM2)

2. **Security**:
   - Use strong passwords
   - Enable HTTPS
   - Implement rate limiting
   - Add authentication

3. **Database**:
   - Consider PostgreSQL/MongoDB for production
   - Current setup uses LowDB (file-based)

4. **Monitoring**:
   - Add logging (Winston, Bunyan)
   - Error tracking (Sentry)
   - Uptime monitoring

## Contributing

To improve this project:

1. Update scrapers for current website structures
2. Add more platforms (Facebookhousing groups, etc.)
3. Improve error handling
4. Add tests
5. Enhance UI/UX

## Support

Common resources:
- Puppeteer docs: https://pptr.dev/
- Cheerio docs: https://cheerio.js.org/
- React docs: https://react.dev/
- Material-UI: https://mui.com/
