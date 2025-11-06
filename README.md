# FreeKamerBot 🏠

A local web application to monitor Dutch housing platforms (Kamernet, Funda, and Pararius) with automatic replies and instant notifications.

## Features

✨ **All-in-One Monitoring**
- Monitor Kamernet, Funda, and Pararius in one place
- Real-time updates on new listings
- Track messages from landlords

🤖 **Automatic Replies**
- Automatically reply to new listings on Kamernet
- Customize your personal message template

📍 **Smart Search Area**
- Define your search area on an interactive map
- Filter listings by location

🔔 **Instant Notifications**
- Desktop notifications for new listings
- Desktop notifications for new messages
- Optional mobile notifications (PWA)

📊 **Dashboard**
- Overview of all your listings
- Message tracking
- Search area visualization

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm run install-all
```

3. Configure your settings:
```bash
cp .env.example .env
```
Edit `.env` file with your Kamernet credentials (optional, needed for auto-reply)

4. Start the application:
```bash
npm start
```

5. Open your browser and go to: `http://localhost:3000`

## Configuration

Edit the `.env` file to customize:

- **Kamernet Login**: Add your credentials to enable auto-reply
- **Monitoring Intervals**: How often to check for new listings (in minutes)
- **Auto-Reply**: Enable/disable and customize your message
- **Notifications**: Enable desktop and mobile notifications

## Usage

### Dashboard
- View all new listings from Kamernet, Funda, and Pararius
- Click on listings to view details
- Mark listings as favorite or hide them

### Search Area
- Click "Define Search Area" to draw your preferred locations on the map
- Set multiple search zones
- Adjust radius for each zone

### Auto-Reply
- Enable auto-reply in settings
- Customize your message template
- The bot will automatically respond to new Kamernet listings

### Messages
- View all messages from landlords
- Get notified when new messages arrive
- Quick reply directly from the dashboard

## Technical Details

### Backend
- Node.js with Express
- Puppeteer for web scraping
- LowDB for local data storage
- Node-cron for scheduled monitoring

### Frontend
- React
- Leaflet for maps
- Material-UI components
- Service Worker for notifications

## Important Notes

⚠️ **Disclaimer**: This tool is for personal use only. Make sure to:
- Respect the terms of service of each platform
- Use reasonable monitoring intervals to avoid overloading servers

🧭 Puppeteer/Chromium note:
 - The installer skips downloading Chromium to avoid long installs/hangs.
 - Ensure you have Chrome/Chromium installed locally.
 - If needed, set `PUPPETEER_EXECUTABLE_PATH` in `.env` to your Chrome/Chromium path.
- Use auto-reply responsibly and professionally

## Troubleshooting

**Notifications not working?**
- Make sure you've allowed notifications in your browser
- Check if notifications are enabled in settings

**Auto-reply not working?**
- Verify your Kamernet credentials in `.env`
- Check that `AUTO_REPLY_ENABLED=true`

**No listings appearing?**
- Check your internet connection
- Verify monitoring intervals aren't too high
- Check browser console for errors

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License - Use at your own risk
