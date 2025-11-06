# 🚀 Quick Start Guide

## Installation (First Time Only)

### Option 1: Automatic Installation (Recommended)

**Linux/Mac:**
```bash
./install.sh
```

**Windows:**
```bash
install.bat
```

### Option 2: Manual Installation

1. Install server dependencies:
```bash
PUPPETEER_SKIP_DOWNLOAD=1 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm install
```

2. Install client dependencies:
```bash
cd client
npm install
cd ..
```

3. Create configuration file:
```bash
cp .env.example .env
```

## Configuration

Edit the `.env` file with your preferences:

```env
# Optional: Add your Kamernet credentials for auto-reply
KAMERNET_EMAIL=your-email@example.com
KAMERNET_PASSWORD=your-password

# Enable/disable features
AUTO_REPLY_ENABLED=false
ENABLE_NOTIFICATIONS=true

# Adjust monitoring intervals (in minutes)
KAMERNET_INTERVAL=5
FUNDA_INTERVAL=10
PARARIUS_INTERVAL=10

# Optional: path to your Chrome/Chromium if needed for Puppeteer
PUPPETEER_EXECUTABLE_PATH=
AUTO_REPLY_HEADLESS=true
```

## Running the App

### Easy Launch (Recommended)

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

### Manual Launch

```bash
npm start
```

This will start both the backend server and frontend app.

## Accessing the Dashboard

Once started, open your browser and go to:
```
http://localhost:3000
```

The API server runs on:
```
http://localhost:3001
```

## First Steps

1. **Allow Notifications**: Click "Allow" when prompted for notifications
2. **Define Search Area**: Go to "Search Area" tab and click on the map to define your preferred locations
3. **Configure Settings**: 
   - Set your price and size filters
   - Add Kamernet credentials if you want auto-reply
   - Enable auto-reply with your message template
4. **Monitor**: The app will automatically start monitoring for new listings!

## Features Overview

### 📊 Dashboard
- View statistics of all listings
- See recent listings
- Check platform distribution

### 🏠 Listings
- Browse all discovered listings from Kamernet, Funda, and Pararius
- Filter by platform
- Search by location or title
- Mark favorites
- Auto-reply to Kamernet listings

### 💬 Messages
- Track messages from landlords
- Get notified about new messages

### 🗺️ Search Area
- Define multiple search zones on the map
- Set radius for each area
- Listings are filtered based on your areas

### ⚙️ Settings
- Configure Kamernet login for auto-reply
- Set up automatic reply message
- Adjust price and size filters
- Control monitoring intervals
- Enable/disable notifications

## Tips

1. **Start with conservative intervals** (5-10 minutes) to avoid being blocked
2. **Test auto-reply manually** first before enabling automatic mode
3. **Define search areas** to reduce noise and get relevant listings
4. **Enable notifications** to get instant alerts on new listings
5. **Check the console** for monitoring activity and any errors

## Stopping the App

Press `Ctrl+C` in the terminal to stop the application.

## Troubleshooting

**Problem**: No listings appearing
- Wait a few minutes for the first scan
- Check console for errors
- Verify your internet connection
- Website structures may have changed (see DEVELOPMENT.md)

**Problem**: Auto-reply not working
- Verify Kamernet credentials in `.env`
- Enable auto-reply in Settings
- Kamernet's HTML structure may have changed

**Problem**: Port already in use
- Change `PORT=3001` to a different port in `.env`
- Kill the process using port 3001

For more detailed troubleshooting, see `DEVELOPMENT.md`

## Next Steps

- Customize your search filters in Settings
- Set up search areas for your preferred locations
- Configure auto-reply message
- Star your favorite listings
- Keep the app running in the background to never miss a listing!

---

**Note**: This tool is for personal use only. Please use responsibly and respect the terms of service of each platform.
