# API Setup Guide

## Quick Fix for 403 Errors

The 403 error you're seeing means the Google Cloud Vision API key is missing or invalid. Here's how to fix it:

### Option 1: Use Mock Data (Quick Start)
The app will now automatically use mock data if no API key is found, so you can test the app immediately.

### Option 2: Set Up Google Cloud Vision API (Recommended)

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable the Cloud Vision API**
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click on it and press "Enable"

3. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Set Up Environment Variables**
   ```bash
   # Run the setup script
   npm run setup-env
   
   # Or manually create .env file
   cp env.example .env
   ```

5. **Add Your API Key**
   Edit the `.env` file and replace the placeholder:
   ```env
   EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=your_actual_api_key_here
   ```

6. **Restart the App**
   ```bash
   npm start
   ```

### Option 3: API Key Restrictions (Security Best Practice)

For better security, restrict your API key:

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your domain or use "None" for development
5. Under "API restrictions", select "Restrict key"
6. Select "Cloud Vision API" from the list

### Troubleshooting

- **403 Error**: API key missing, invalid, or API not enabled
- **400 Error**: Invalid request format
- **429 Error**: Rate limit exceeded (free tier has limits)

### Free Tier Limits

Google Cloud Vision API free tier includes:
- 1,000 requests per month
- 5 requests per second

For development and testing, this should be sufficient.

### Testing Without API Key

The app now includes mock data for testing:
- Magic: The Gathering cards (Black Lotus, Lightning Bolt)
- Pokémon cards (Charizard)
- Baseball cards (Babe Ruth)
- Basketball cards (Michael Jordan)
- Marvel cards (Spider-Man)

This allows you to test the app functionality without setting up API keys immediately.
