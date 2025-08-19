# Collectible Card Scanner App

A React Native mobile application that uses AI to scan and identify collectible cards, automatically retrieve pricing information, and manage digital collections.

## Features

- **Multi-card Scanning**: Scan multiple cards simultaneously using the device camera
- **AI-Powered Recognition**: Uses Google Cloud Vision API for text extraction and card detection
- **Automatic Pricing**: Integrates with multiple free APIs (Scryfall, Pokémon TCG, Yu-Gi-Oh!, Sports Cards, Marvel) to get real-time market prices
- **Collection Management**: Store, organize, and manage your card collection digitally
- **Search & Filter**: Find cards by name, set, or other criteria
- **Export/Import**: Backup and restore your collection data
- **Offline Support**: Basic functionality works without internet connection

## Technology Stack

- **Frontend**: React Native with Expo
- **Camera**: Expo Camera with real-time processing
- **AI/ML**: Google Cloud Vision API for image analysis
- **Pricing Data**: Multiple free APIs (Scryfall for MTG, Pokémon TCG API, Yu-Gi-Oh! API, Sports Card Database, Marvel Comics API)
- **Database**: SQLite for local storage
- **UI**: React Native Paper components

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- Google Cloud Platform account
- Optional: Pokémon TCG API key (free tier available)
- Optional: Marvel Comics API key (free tier available)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collectible-scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo CLI globally** (if not already installed)
   ```bash
   npm install -g @expo/cli
   ```

4. **Configure API Keys**

   **⚠️ SECURITY WARNING: Never commit API keys to version control!**

   Run the setup script to create your environment file:
   ```bash
   npm run setup-env
   ```

   Or manually copy the example environment file:
   ```bash
   cp env.example .env
   ```

   Then edit `.env` with your actual API keys:
   ```env
   # Required for card detection
   EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key_here
   
   # Optional - for enhanced Pokémon card data
   POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key_here
   
   # Optional - for Marvel card data
   MARVEL_API_KEY=your_marvel_api_key_here
   ```

   **Google Cloud Vision API Setup:**
   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select existing one
   3. Enable the Cloud Vision API
   4. Create credentials (API Key)
   5. Add the API key to your `.env` file

   **Pokémon TCG API Setup (Optional):**
   1. Visit [Pokémon TCG Developer Portal](https://dev.pokemontcg.io/)
   2. Register for a free API key
   3. Add the API key to your `.env` file
   4. Note: The app works without this key, but with limited Pokémon card data

   **Marvel Comics API Setup (Optional):**
   1. Visit [Marvel Developer Portal](https://developer.marvel.com/)
   2. Register for a free account
   3. Get your API key, hash, and timestamp
   4. Add them to your `.env` file
   5. Note: The app works without this key, but with limited Marvel card data

   **Other APIs (No Setup Required):**
   - **Scryfall API**: Free, no authentication required for Magic: The Gathering cards
   - **Yu-Gi-Oh! API**: Free, no authentication required for Yu-Gi-Oh! cards
   - **Sports Card Database API**: Free, no authentication required for Baseball and Basketball cards

5. **API Configuration**

   The app is already configured to use environment variables. The API keys are automatically loaded from your `.env` file.

## Security

### API Key Management
- **Never commit API keys to version control**
- Use environment variables for all API keys
- The `.env` file is automatically ignored by git
- For production, use secure key management services

### Environment Variables
- `EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY`: Required for card detection
- `POKEMON_TCG_API_KEY`: Optional for enhanced Pokémon card data
- `MARVEL_API_KEY`: Optional for Marvel card data

### Best Practices
1. Keep your `.env` file secure and never share it
2. Rotate API keys regularly
3. Use API key restrictions in Google Cloud Console
4. Monitor API usage to prevent abuse

## Running the App

### Development Mode

1. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

2. **Run on device/simulator**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Building for Production

1. **Build for iOS**
   ```bash
   expo build:ios
   ```

2. **Build for Android**
   ```bash
   expo build:android
   ```

## Project Structure

```
collectible-scanner/
├── App.tsx                 # Main app component with navigation
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── src/
│   ├── screens/
│   │   ├── ScannerScreen.tsx    # Camera and scanning functionality
│   │   ├── CollectionScreen.tsx # Collection management
│   │   └── ProfileScreen.tsx    # Settings and profile
│   └── services/
│       ├── aiService.ts         # AI/ML and API integration
│       └── collectionService.ts # Database and collection management
└── assets/                # Images and static assets
```

## Key Components

### ScannerScreen
- Camera integration with Expo Camera
- Real-time card detection overlay
- Image processing and optimization
- Multi-card detection and recognition

### CollectionScreen
- Display and manage card collection
- Search and filtering capabilities
- Collection statistics
- Card editing and removal

### aiService
- Google Cloud Vision API integration
- Multiple card game APIs (Scryfall, Pokémon TCG, Yu-Gi-Oh!, Sports Cards, Marvel)
- Card name extraction and validation
- Mock data for development/testing

### collectionService
- SQLite database operations
- Collection CRUD operations
- Import/export functionality
- Statistics calculation

## API Integration

### Google Cloud Vision API
Used for:
- Text extraction from card images
- Object detection to identify card boundaries
- Web detection for card recognition

### Multiple Card Game APIs
**Scryfall API (Magic: The Gathering):**
- Card information retrieval
- Real-time pricing data
- Set and rarity information
- Free, no authentication required

**Pokémon TCG API:**
- Pokémon card information
- Market pricing data
- Set and rarity information
- Free tier available

**Yu-Gi-Oh! API:**
- Yu-Gi-Oh! card information
- Market pricing data
- Set and rarity information
- Free, no authentication required

**Sports Card Database API:**
- Baseball and Basketball card information
- Market pricing data
- Set and rarity information
- Free, no authentication required

**Marvel Comics API:**
- Marvel character information
- Character images and details
- Comic book data
- Free tier available

## Customization

### Adding New Card Games
1. Add a new API integration function in `aiService.ts` (similar to `getMTGCardInfo`)
2. Update the `getCardInfo` function to include the new game type
3. Update the card recognition patterns for the new game
4. Add the game type to the `CardInfo` interface

### Custom AI Models
1. Replace Google Cloud Vision with your custom model
2. Update the `detectCards` function
3. Implement your own card recognition logic

### UI Theming
1. Modify the theme in `App.tsx`
2. Update colors and styles in individual components
3. Add dark mode support

## Troubleshooting

### Common Issues

1. **Camera permissions not working**
   - Ensure camera permissions are properly configured in `app.json`
   - Check device settings for camera access

2. **API calls failing**
   - Verify API keys are correctly set
   - Check network connectivity
   - Ensure API quotas haven't been exceeded

3. **Build errors**
   - Clear Expo cache: `expo r -c`
   - Delete node_modules and reinstall
   - Check for conflicting dependencies

### Performance Optimization

1. **Image processing**
   - Optimize image quality settings
   - Implement image compression
   - Use appropriate resolution for scanning

2. **Database operations**
   - Implement pagination for large collections
   - Use indexes for frequently queried fields
   - Optimize SQL queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## Roadmap

- [ ] Offline card recognition using TensorFlow Lite
- [ ] Barcode scanning for faster card identification
- [ ] Cloud sync for collections
- [ ] Social features (trading, sharing)
- [ ] Advanced analytics and insights
- [ ] Multi-language support
- [ ] AR features for card overlay
- [ ] Integration with more card game APIs
