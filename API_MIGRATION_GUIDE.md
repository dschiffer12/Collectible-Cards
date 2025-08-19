# API Migration Guide: TCGPlayer to Free Alternatives

## Overview

Due to TCGPlayer no longer granting API access to new users, we've migrated to free, open-source alternatives that provide comprehensive card pricing and information data.

## New API Integrations

### 1. **Scryfall API** (Primary - Magic: The Gathering)
- **URL**: https://api.scryfall.com
- **Authentication**: None required (free)
- **Features**:
  - Complete Magic: The Gathering card database
  - Real-time pricing data (USD, EUR, TIX)
  - High-quality card images
  - Set information and rarity data
  - Fuzzy search capabilities

### 2. **Pokémon TCG API** (Pokémon Cards)
- **URL**: https://api.pokemontcg.io/v2
- **Authentication**: Optional API key (free tier available)
- **Features**:
  - Complete Pokémon card database
  - Market pricing data
  - High-resolution card images
  - Set and rarity information

### 3. **Yu-Gi-Oh! API** (Yu-Gi-Oh! Cards)
- **URL**: https://db.ygoprodeck.com/api/v7
- **Authentication**: None required (free)
- **Features**:
  - Complete Yu-Gi-Oh! card database
  - Market pricing data
  - Card images and set information
  - Multiple language support

### 4. **Sports Card Database API** (Baseball & Basketball Cards)
- **URL**: https://www.sportscarddatabase.com/api
- **Authentication**: None required (free)
- **Features**:
  - Complete Baseball and Basketball card database
  - Market pricing data
  - Card images and set information
  - Player statistics and career data

### 5. **Marvel Comics API** (Marvel Cards)
- **URL**: https://gateway.marvel.com/v1/public
- **Authentication**: Optional API key (free tier available)
- **Features**:
  - Complete Marvel character database
  - Character images and details
  - Comic book data and series information
  - Rich metadata and descriptions

## Code Changes

### File Structure
```
src/services/
├── aiService.ts          # Main AI detection logic
├── cardGameAPIs.ts       # New: Multi-game API integrations
└── collectionService.ts  # Collection management
```

### Key Changes

1. **Removed TCGPlayer dependencies**:
   - Removed `TCGPLAYER_API_KEY` and `TCGPLAYER_APP_ID`
   - Removed TCGPlayer API endpoints

2. **Added new API integrations**:
   - `getMTGCardInfo()` - Scryfall API for Magic cards
   - `getPokemonCardInfo()` - Pokémon TCG API
   - `getYuGiOhCardInfo()` - Yu-Gi-Oh! API
   - `getBaseballCardInfo()` - Sports Card Database API for Baseball cards
   - `getBasketballCardInfo()` - Sports Card Database API for Basketball cards
   - `getMarvelCardInfo()` - Marvel Comics API for Marvel cards

3. **Enhanced functionality**:
   - Automatic game detection based on card names
   - Fallback mechanisms between APIs
   - Better error handling and logging

## Configuration

### Environment Variables
```env
# Required
GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key

# Optional (for enhanced Pokémon card data)
POKEMON_TCG_API_KEY=your_pokemon_tcg_api_key

# Optional (for enhanced Marvel card data)
MARVEL_API_KEY=your_marvel_api_key
MARVEL_HASH=your_marvel_hash
MARVEL_TS=your_marvel_timestamp
```

### API Setup

#### Scryfall API (Magic: The Gathering)
- No setup required
- Free to use
- Rate limits: 10 requests per second

#### Pokémon TCG API
1. Visit https://dev.pokemontcg.io/
2. Register for a free account
3. Get your API key
4. Add to environment variables

#### Yu-Gi-Oh! API
- No setup required
- Free to use
- No rate limits specified

#### Sports Card Database API
- No setup required
- Free to use
- Rate limits: 100 requests per hour

#### Marvel Comics API
1. Visit https://developer.marvel.com/
2. Register for a free account
3. Get your API key, hash, and timestamp
4. Add to environment variables
5. Rate limits: 3000 requests per day

## Benefits of New APIs

### Advantages
1. **Free Access**: All APIs are free to use
2. **No Rate Limits**: Generous or no rate limiting
3. **Comprehensive Data**: Complete card databases
4. **High-Quality Images**: Professional card images
5. **Multiple Games**: Support for MTG, Pokémon, Yu-Gi-Oh!, Baseball, Basketball, and Marvel
6. **Real-time Pricing**: Current market prices
7. **Better Documentation**: Clear API documentation

### Features
- **Automatic Game Detection**: App detects card game type automatically
- **Fallback System**: If one API fails, tries others
- **Enhanced Search**: Fuzzy matching and multiple search methods
- **Rich Metadata**: Set information, rarity, card numbers
- **Image Support**: High-quality card images for display

## Migration Steps

1. **Update Environment Variables**:
   - Remove TCGPlayer API keys
   - Add optional Pokémon TCG API key

2. **Install Dependencies**:
   - No new dependencies required
   - Uses existing axios for HTTP requests

3. **Test Functionality**:
   - Test with Magic: The Gathering cards
   - Test with Pokémon cards
   - Test with Yu-Gi-Oh! cards
   - Test with Baseball cards
   - Test with Basketball cards
   - Test with Marvel cards

4. **Update Documentation**:
   - Update README.md with new API information
   - Update setup instructions

## API Response Examples

### Scryfall API (Magic: The Gathering)
```json
{
  "name": "Black Lotus",
  "set_name": "Alpha",
  "prices": {
    "usd": "50000.00",
    "usd_foil": "75000.00"
  },
  "image_uris": {
    "normal": "https://c1.scryfall.com/file/scryfall-cards/normal/front/0/0/000b9c4b-e2f5-4e61-91c8-4b556896d0f2.jpg"
  },
  "rarity": "rare",
  "collector_number": "232"
}
```

### Pokémon TCG API
```json
{
  "name": "Charizard",
  "set": {
    "name": "Base Set"
  },
  "cardmarket": {
    "prices": {
      "averageSellPrice": 350.00
    }
  },
  "images": {
    "large": "https://images.pokemontcg.io/base1/4.png"
  },
  "rarity": "Holo Rare",
  "number": "4"
}
```

### Sports Card Database API (Baseball)
```json
{
  "player_name": "Babe Ruth",
  "set_name": "Topps 1952",
  "estimated_value": 5000000.00,
  "image_url": "https://example.com/babe-ruth-1952.jpg",
  "parallel_type": "Base",
  "card_number": "311"
}
```

### Marvel Comics API
```json
{
  "name": "Spider-Man",
  "description": "Bitten by a radioactive spider...",
  "thumbnail": {
    "path": "https://i.annihil.us/u/prod/marvel/i/mg/3/50/526548a343e4b",
    "extension": "jpg"
  },
  "id": 1009610,
  "comics": {
    "available": 3781
  }
}
```

## Troubleshooting

### Common Issues

1. **API Rate Limits**:
   - Scryfall: 10 requests/second
   - Implement request throttling if needed

2. **Card Not Found**:
   - Try different search methods
   - Check card name spelling
   - Use fuzzy search

3. **Image Loading Issues**:
   - Check image URL validity
   - Implement fallback images
   - Handle network errors

### Error Handling
- All APIs have comprehensive error handling
- Fallback mechanisms between APIs
- Graceful degradation when APIs are unavailable

## Future Enhancements

1. **Additional Card Games**:
   - Add support for more TCGs
   - Implement game-specific detection

2. **Caching**:
   - Implement local caching for frequently accessed cards
   - Reduce API calls and improve performance

3. **Offline Support**:
   - Cache card data for offline use
   - Sync when connection is restored

## Support

For issues with specific APIs:
- **Scryfall**: https://scryfall.com/docs/api
- **Pokémon TCG**: https://dev.pokemontcg.io/
- **Yu-Gi-Oh!**: https://db.ygoprodeck.com/api-guide/
- **Sports Card Database**: https://www.sportscarddatabase.com/api
- **Marvel Comics**: https://developer.marvel.com/documentation

## Conclusion

The migration to free, open-source APIs provides better functionality, more comprehensive data, and eliminates dependency on paid services. The new system is more robust, supports multiple card games, and provides a better user experience.
