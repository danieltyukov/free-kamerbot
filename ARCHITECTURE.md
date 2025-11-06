# FreeKamerBot - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│                        http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND (Port 3000)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Dashboard   │  │   Listings   │  │   Messages   │            │
│  │    Page      │  │     Page     │  │     Page     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │ Search Area  │  │   Settings   │                               │
│  │  (Map Page)  │  │     Page     │                               │
│  └──────────────┘  └──────────────┘                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │         Material-UI Components + Leaflet Maps        │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │              Service Worker (Notifications)          │         │
│  └──────────────────────────────────────────────────────┘         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Port 3001)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  API ROUTES:                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Listings   │  │   Messages   │  │   Settings   │            │
│  │    Routes    │  │    Routes    │  │    Routes    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│         └──────────────────┼──────────────────┘                     │
│                            ▼                                        │
│  ┌─────────────────────────────────────────────────────┐          │
│  │               BUSINESS LOGIC LAYER                   │          │
│  │                                                       │          │
│  │  ┌──────────────────────────────────────────────┐   │          │
│  │  │         Monitoring Service                   │   │          │
│  │  │  - Orchestrates scraping                     │   │          │
│  │  │  - Scheduled with node-cron                  │   │          │
│  │  │  - Manages scraper lifecycle                 │   │          │
│  │  └─────────────────┬────────────────────────────┘   │          │
│  │                    │                                 │          │
│  │                    ▼                                 │          │
│  │  ┌─────────────────────────────────────────────┐    │          │
│  │  │         Platform Scrapers                   │    │          │
│  │  │                                             │    │          │
│  │  │  ┌───────────┐ ┌───────────┐ ┌──────────┐ │    │          │
│  │  │  │ Kamernet  │ │   Funda   │ │ Pararius │ │    │          │
│  │  │  │  Scraper  │ │  Scraper  │ │ Scraper  │ │    │          │
│  │  │  └───────────┘ └───────────┘ └──────────┘ │    │          │
│  │  │                                             │    │          │
│  │  │  Uses: Axios + Cheerio for HTML parsing    │    │          │
│  │  └─────────────────────────────────────────────┘    │          │
│  │                                                       │          │
│  │  ┌──────────────────────────────────────────────┐   │          │
│  │  │         Auto-Reply Service                   │   │          │
│  │  │  - Puppeteer browser automation              │   │          │
│  │  │  - Kamernet login & messaging                │   │          │
│  │  │  - Reply tracking                            │   │          │
│  │  └──────────────────────────────────────────────┘   │          │
│  │                                                       │          │
│  │  ┌──────────────────────────────────────────────┐   │          │
│  │  │         Notification Service                 │   │          │
│  │  │  - Browser push notifications                │   │          │
│  │  │  - Web Push API integration                  │   │          │
│  │  └──────────────────────────────────────────────┘   │          │
│  └───────────────────────────────────────────────────────┘          │
│                            │                                        │
│                            ▼                                        │
│  ┌─────────────────────────────────────────────────────┐          │
│  │              Database Layer (LowDB)                  │          │
│  │                                                       │          │
│  │  data/db.json (File-based JSON storage)             │          │
│  │  - listings[]                                        │          │
│  │  - messages[]                                        │          │
│  │  - repliedListings[]                                 │          │
│  │  - settings{}                                        │          │
│  └─────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL PLATFORMS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  kamernet.nl │  │   funda.nl   │  │ pararius.com │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  Accessed via HTTP requests (Axios + Cheerio)                      │
│  Auto-reply via Puppeteer (headless Chrome)                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Monitoring Flow (Automatic)

```
┌─────────────┐
│  node-cron  │  Every N minutes (configurable)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Monitor Service │  Triggers scraping
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────┐
│   Platform Scrapers         │  Fetch & parse HTML
│  (Kamernet/Funda/Pararius)  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────┐
│ Filter Listings │  Apply price/size/area filters
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Check Duplicates│  Compare with existing listings
└──────┬──────────┘
       │
       ▼ (if new)
┌─────────────────┐
│  Save to DB     │  Add to data/db.json
└──────┬──────────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌────────────┐  ┌──────────────┐
│Send        │  │ Auto-Reply   │  (if enabled & Kamernet)
│Notification│  │  Service     │
└────────────┘  └──────────────┘
```

### 2. Auto-Reply Flow

```
┌──────────────────┐
│ New Kamernet     │
│ Listing Found    │
└────────┬─────────┘
         │
         ▼
┌────────────────────┐
│ Check if already   │
│ replied            │
└────────┬───────────┘
         │ (not replied)
         ▼
┌────────────────────┐
│ Launch Puppeteer   │  Headless Chrome
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Login to Kamernet  │  Using credentials from .env
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Navigate to        │  Open listing page
│ listing URL        │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Fill message form  │  Use template from settings
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Submit message     │  Click send button
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Mark as replied    │  Add to repliedListings[]
└────────────────────┘
```

### 3. User Interaction Flow

```
┌──────────────┐
│ User opens   │
│ Dashboard    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ React Router     │  Navigation
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Page Component   │  Dashboard/Listings/etc.
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Axios HTTP       │  GET /api/listings
│ Request          │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Express Route    │  Routes handle request
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Database Query   │  LowDB read from db.json
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ JSON Response    │  Send data to frontend
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ React State      │  Update component state
│ Update           │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ UI Renders       │  Display in browser
└──────────────────┘
```

## File Responsibilities

### Backend Files

| File | Responsibility |
|------|---------------|
| `server/index.js` | Express server setup, middleware, routing |
| `server/routes/listings.js` | Listing CRUD operations API |
| `server/routes/messages.js` | Messages management API |
| `server/routes/settings.js` | Settings CRUD + monitoring control |
| `server/routes/autoReply.js` | Manual auto-reply trigger |
| `server/services/monitor.js` | Orchestrates scheduled scraping |
| `server/services/autoReply.js` | Puppeteer automation for replies |
| `server/services/notifications.js` | Send browser notifications |
| `server/services/scrapers/kamernet.js` | Scrape Kamernet listings |
| `server/services/scrapers/funda.js` | Scrape Funda listings |
| `server/services/scrapers/pararius.js` | Scrape Pararius listings |
| `server/utils/database.js` | LowDB initialization & access |

### Frontend Files

| File | Responsibility |
|------|---------------|
| `client/src/App.js` | Main app component, routing, navigation |
| `client/src/pages/Dashboard.js` | Statistics and overview |
| `client/src/pages/Listings.js` | Browse and manage listings |
| `client/src/pages/Messages.js` | View and manage messages |
| `client/src/pages/SearchArea.js` | Map-based area selection |
| `client/src/pages/Settings.js` | Configuration panel |
| `client/src/utils/notifications.js` | Browser notification helpers |
| `client/public/service-worker.js` | PWA service worker |

## Technology Choices & Rationale

| Technology | Why Used |
|------------|----------|
| **Express** | Lightweight, popular Node.js framework for REST APIs |
| **React** | Component-based UI, large ecosystem, great developer experience |
| **Material-UI** | Professional components, responsive, accessible |
| **LowDB** | Simple file-based DB, no setup, perfect for local app |
| **Puppeteer** | Browser automation for complex interactions (login, forms) |
| **Cheerio** | Fast HTML parsing for simple scraping |
| **Axios** | Promise-based HTTP client, clean API |
| **node-cron** | Reliable scheduled tasks with cron syntax |
| **Leaflet** | Open-source maps, no API keys needed |
| **Recharts** | Easy React charts, good defaults |

## Security Considerations

1. **Credentials Storage**: Stored in `.env` (local file, git-ignored)
2. **API Access**: No authentication (local use only)
3. **CORS**: Enabled for localhost development
4. **Data Privacy**: All data stored locally (no cloud)
5. **Web Scraping**: Respects rate limits, user-agent headers

## Scalability Notes

Current setup is optimized for:
- **Users**: 1 (single local user)
- **Listings**: Up to 10,000 (file-based DB)
- **Platforms**: 3 (easily extensible)
- **Requests**: Moderate (respectful intervals)

For production/multi-user:
- Replace LowDB with PostgreSQL/MongoDB
- Add user authentication (JWT)
- Implement rate limiting
- Add caching (Redis)
- Deploy to cloud (Heroku, AWS, etc.)

## Deployment Options

### Local (Current)
```bash
./start.sh
```
Runs on localhost, single user, all data local

### Server (PM2)
```bash
npm run build
pm2 start server/index.js
pm2 startup
pm2 save
```
Runs on server, always on, process management

### Docker (Future)
```dockerfile
# Could containerize for easy deployment
FROM node:18
WORKDIR /app
COPY . .
RUN npm run install-all
RUN npm run build
CMD ["npm", "start"]
```

## Extension Ideas

1. **More Platforms**: Add Kamernet.com, Facebook groups, Marktplaats
2. **Email Alerts**: Send email notifications via SendGrid
3. **Telegram Bot**: Integrate with Telegram for mobile alerts
4. **Price Prediction**: ML model to predict listing popularity
5. **Auto-Apply**: Fill application forms automatically
6. **Analytics Dashboard**: Trends, average prices, best times
7. **Export Data**: CSV/Excel export for analysis
8. **Saved Searches**: Multiple search configurations
9. **Collaboration**: Share findings with roommates
10. **Browser Extension**: Quick access from browser toolbar
