import axios from 'axios';

// API Base URLs
const SCRYFALL_API_BASE = 'https://api.scryfall.com';
const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2';
const YUGIOH_API_BASE = 'https://db.ygoprodeck.com/api/v7';
const SPORTS_CARD_API_BASE = 'https://www.sportscarddatabase.com/api';
const MARVEL_API_BASE = 'https://gateway.marvel.com/v1/public';

export interface CardInfo {
  name: string;
  set: string;
  price: number;
  imageUrl: string;
  rarity?: string;
  cardNumber?: string;
  game?: string; // 'mtg', 'pokemon', 'yugioh', 'baseball', 'basketball', 'marvel'
}

// Magic: The Gathering (Scryfall API)
export const getMTGCardInfo = async (cardName: string): Promise<CardInfo | null> => {
  try {
    // Search for the card using Scryfall's fuzzy search
    const searchResponse = await axios.get(
      `${SCRYFALL_API_BASE}/cards/named`,
      {
        params: {
          fuzzy: cardName,
        },
      }
    );

    if (!searchResponse.data) {
      return null;
    }

    const card = searchResponse.data;
    
    // Get pricing information from Scryfall
    const prices = card.prices;
    const marketPrice = prices?.usd ? parseFloat(prices.usd) : 
                       prices?.usd_foil ? parseFloat(prices.usd_foil) : 0;

    return {
      name: card.name,
      set: card.set_name || 'Unknown Set',
      price: marketPrice,
      imageUrl: card.image_uris?.normal || card.image_uris?.small || '',
      rarity: card.rarity,
      cardNumber: card.collector_number,
      game: 'mtg',
    };
  } catch (error) {
    console.error('Error getting MTG card info from Scryfall:', error);
    
    // Fallback: try alternative search methods
    try {
      const searchResponse = await axios.get(
        `${SCRYFALL_API_BASE}/cards/search`,
        {
          params: {
            q: `name:"${cardName}"`,
          },
        }
      );

      if (searchResponse.data.data && searchResponse.data.data.length > 0) {
        const card = searchResponse.data.data[0];
        const prices = card.prices;
        const marketPrice = prices?.usd ? parseFloat(prices.usd) : 
                           prices?.usd_foil ? parseFloat(prices.usd_foil) : 0;

        return {
          name: card.name,
          set: card.set_name || 'Unknown Set',
          price: marketPrice,
          imageUrl: card.image_uris?.normal || card.image_uris?.small || '',
          rarity: card.rarity,
          cardNumber: card.collector_number,
          game: 'mtg',
        };
      }
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
    }
    
    return null;
  }
};

// Pokémon TCG API
export const getPokemonCardInfo = async (cardName: string): Promise<CardInfo | null> => {
  try {
    const searchResponse = await axios.get(
      `${POKEMON_TCG_API_BASE}/cards`,
      {
        params: {
          q: `name:"${cardName}"`,
          pageSize: 1,
        },
        headers: {
          'X-Api-Key': process.env.POKEMON_TCG_API_KEY || '', // Optional
        },
      }
    );

    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      const card = searchResponse.data.data[0];
      const prices = card.cardmarket?.prices;
      const marketPrice = prices?.averageSellPrice || prices?.lowPrice || 0;

      return {
        name: card.name,
        set: card.set.name || 'Unknown Set',
        price: marketPrice,
        imageUrl: card.images?.large || card.images?.small || '',
        rarity: card.rarity,
        cardNumber: card.number,
        game: 'pokemon',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Pokémon card info:', error);
    return null;
  }
};

// Yu-Gi-Oh! API
export const getYuGiOhCardInfo = async (cardName: string): Promise<CardInfo | null> => {
  try {
    const searchResponse = await axios.get(
      `${YUGIOH_API_BASE}/cardinfo.php`,
      {
        params: {
          fname: cardName,
        },
      }
    );

    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      const card = searchResponse.data.data[0];
      const prices = card.card_prices?.[0];
      const marketPrice = prices?.cardmarket_price || prices?.tcgplayer_price || 0;

      return {
        name: card.name,
        set: card.card_sets?.[0]?.set_name || 'Unknown Set',
        price: marketPrice,
        imageUrl: card.card_images?.[0]?.image_url || '',
        rarity: card.card_sets?.[0]?.set_rarity,
        cardNumber: card.card_sets?.[0]?.set_code,
        game: 'yugioh',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Yu-Gi-Oh! card info:', error);
    return null;
  }
};

// Baseball Cards API (Sports Card Database)
export const getBaseballCardInfo = async (cardName: string): Promise<CardInfo | null> => {
  try {
    const searchResponse = await axios.get(
      `${SPORTS_CARD_API_BASE}/search`,
      {
        params: {
          q: cardName,
          sport: 'baseball',
          limit: 1,
        },
      }
    );

    if (searchResponse.data.results && searchResponse.data.results.length > 0) {
      const card = searchResponse.data.results[0];
      
      return {
        name: card.player_name || cardName,
        set: card.set_name || 'Unknown Set',
        price: card.estimated_value || 0,
        imageUrl: card.image_url || '',
        rarity: card.parallel_type || 'Base',
        cardNumber: card.card_number,
        game: 'baseball',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Baseball card info:', error);
    return null;
  }
};

// Basketball Cards API (Sports Card Database)
export const getBasketballCardInfo = async (cardName: string): Promise<CardInfo | null> => {
  try {
    const searchResponse = await axios.get(
      `${SPORTS_CARD_API_BASE}/search`,
      {
        params: {
          q: cardName,
          sport: 'basketball',
          limit: 1,
        },
      }
    );

    if (searchResponse.data.results && searchResponse.data.results.length > 0) {
      const card = searchResponse.data.results[0];
      
      return {
        name: card.player_name || cardName,
        set: card.set_name || 'Unknown Set',
        price: card.estimated_value || 0,
        imageUrl: card.image_url || '',
        rarity: card.parallel_type || 'Base',
        cardNumber: card.card_number,
        game: 'basketball',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Basketball card info:', error);
    return null;
  }
};

// Marvel Cards API (Marvel Comics API)
export const getMarvelCardInfo = async (cardName: string): Promise<CardInfo | null> => {
  try {
    const searchResponse = await axios.get(
      `${MARVEL_API_BASE}/characters`,
      {
        params: {
          name: cardName,
          apikey: process.env.MARVEL_API_KEY || 'demo',
          hash: process.env.MARVEL_HASH || 'demo',
          ts: process.env.MARVEL_TS || '1',
        },
      }
    );

    if (searchResponse.data.data?.results && searchResponse.data.data.results.length > 0) {
      const character = searchResponse.data.data.results[0];
      
      return {
        name: character.name,
        set: 'Marvel Comics',
        price: 0, // Marvel API doesn't provide pricing
        imageUrl: `${character.thumbnail.path}.${character.thumbnail.extension}`,
        rarity: 'Common',
        cardNumber: character.id?.toString(),
        game: 'marvel',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Marvel card info:', error);
    return null;
  }
};

// Main function to get card info from multiple APIs
export const getCardInfo = async (cardName: string, gameType?: string): Promise<CardInfo | null> => {
  // Try different APIs based on game type or fallback to Magic: The Gathering
  const game = gameType || 'mtg';
  
  switch (game.toLowerCase()) {
    case 'mtg':
    case 'magic':
      return await getMTGCardInfo(cardName);
    case 'pokemon':
      return await getPokemonCardInfo(cardName);
    case 'yugioh':
      return await getYuGiOhCardInfo(cardName);
    case 'baseball':
      return await getBaseballCardInfo(cardName);
    case 'basketball':
      return await getBasketballCardInfo(cardName);
    case 'marvel':
      return await getMarvelCardInfo(cardName);
    default:
      // Try all APIs in order of preference
      const mtgCard = await getMTGCardInfo(cardName);
      if (mtgCard) return mtgCard;
      
      const pokemonCard = await getPokemonCardInfo(cardName);
      if (pokemonCard) return pokemonCard;
      
      const yugiohCard = await getYuGiOhCardInfo(cardName);
      if (yugiohCard) return yugiohCard;
      
      const baseballCard = await getBaseballCardInfo(cardName);
      if (baseballCard) return baseballCard;
      
      const basketballCard = await getBasketballCardInfo(cardName);
      if (basketballCard) return basketballCard;
      
      return await getMarvelCardInfo(cardName);
  }
};

// Utility function to detect card game type from card name patterns
export const detectCardGame = (cardName: string): string => {
  const name = cardName.toLowerCase();
  
  // Pokémon patterns
  if (name.includes('pikachu') || name.includes('charizard') || name.includes('pokemon')) {
    return 'pokemon';
  }
  
  // Yu-Gi-Oh! patterns
  if (name.includes('blue-eyes') || name.includes('dark magician') || name.includes('exodia')) {
    return 'yugioh';
  }
  
  // Baseball patterns
  if (name.includes('babe ruth') || name.includes('mickey mantle') || name.includes('mike trout') || 
      name.includes('baseball') || name.includes('mlb') || name.includes('topps') || name.includes('bowman')) {
    return 'baseball';
  }
  
  // Basketball patterns
  if (name.includes('michael jordan') || name.includes('lebron james') || name.includes('kobe bryant') || 
      name.includes('basketball') || name.includes('nba') || name.includes('panini') || name.includes('upper deck')) {
    return 'basketball';
  }
  
  // Marvel patterns
  if (name.includes('spider-man') || name.includes('iron man') || name.includes('captain america') || 
      name.includes('thor') || name.includes('hulk') || name.includes('marvel') || name.includes('avengers')) {
    return 'marvel';
  }
  
  // Default to Magic: The Gathering
  return 'mtg';
};

// Get card info with automatic game detection
export const getCardInfoWithDetection = async (cardName: string): Promise<CardInfo | null> => {
  const detectedGame = detectCardGame(cardName);
  return await getCardInfo(cardName, detectedGame);
};
