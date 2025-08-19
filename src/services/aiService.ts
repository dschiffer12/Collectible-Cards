import axios from 'axios';
import { getCardInfoWithDetection, CardInfo } from './cardGameAPIs';

// Configuration - Replace with your actual API keys
const GOOGLE_CLOUD_VISION_API_KEY = 'AIzaSyBTumhFlzjb0NT2WxHBDIs3svJ4Laacsgs';

interface DetectedCard {
  id: string;
  name: string;
  set: string;
  price: number;
  image: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Google Cloud Vision API for text extraction and object detection
export const detectCards = async (imageBase64: string): Promise<DetectedCard[]> => {
  try {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 50,
              },
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 10,
              },
            ],
          },
        ],
      }
    );

    const textAnnotations = response.data.responses[0]?.textAnnotations || [];
    const objectAnnotations = response.data.responses[0]?.localizedObjectAnnotations || [];

    // Extract potential card names from text
    const potentialCardNames = extractCardNames(textAnnotations);
    
    // Find card-like objects (rectangular shapes)
    const cardObjects = objectAnnotations.filter((obj: any) => 
      obj.name === 'Rectangle' || obj.name === 'Card'
    );

    const detectedCards: DetectedCard[] = [];

    // For each potential card name, try to get card information
    for (const cardName of potentialCardNames) {
      try {
        const cardInfo = await getCardInfoWithDetection(cardName);
        if (cardInfo) {
          detectedCards.push({
            id: generateId(),
            name: cardInfo.name,
            set: cardInfo.set,
            price: cardInfo.price,
            image: cardInfo.imageUrl,
            confidence: 0.85, // Default confidence
            boundingBox: {
              x: 0,
              y: 0,
              width: 100,
              height: 140,
            },
          });
        }
      } catch (error) {
        console.error(`Error getting info for card ${cardName}:`, error);
      }
    }

    return detectedCards;
  } catch (error) {
    console.error('Error detecting cards:', error);
    throw new Error('Failed to detect cards in image');
  }
};

// Extract potential card names from OCR text
const extractCardNames = (textAnnotations: any[]): string[] => {
  const potentialNames: string[] = [];
  
  if (textAnnotations.length === 0) return potentialNames;

  // Get all text content
  const fullText = textAnnotations[0].description;
  const lines = fullText.split('\n');

  // Look for patterns that might be card names
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines, numbers, and very short text
    if (trimmedLine.length < 3 || trimmedLine.length > 50) continue;
    
    // Skip lines that are likely not card names
    if (/^\d+$/.test(trimmedLine)) continue; // Just numbers
    if (/^[A-Z\s]+$/.test(trimmedLine) && trimmedLine.length < 10) continue; // All caps short text
    
    // Look for patterns that suggest card names
    if (
      /^[A-Z][a-z]+/.test(trimmedLine) || // Starts with capital letter
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(trimmedLine) || // Multiple capitalized words
      /^[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+/.test(trimmedLine) // Three or more capitalized words
    ) {
      potentialNames.push(trimmedLine);
    }
  }

  return potentialNames.slice(0, 5); // Limit to 5 potential names
};

// Re-export the getCardInfo function from cardGameAPIs for backward compatibility
export { getCardInfo } from './cardGameAPIs';

// Recognize a specific card from an image
export const recognizeCard = async (imageBase64: string): Promise<DetectedCard | null> => {
  try {
    // Use Google Cloud Vision API for more detailed analysis
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: 'WEB_DETECTION',
                maxResults: 5,
              },
              {
                type: 'TEXT_DETECTION',
                maxResults: 10,
              },
            ],
          },
        ],
      }
    );

    const webDetection = response.data.responses[0]?.webDetection;
    const textAnnotations = response.data.responses[0]?.textAnnotations || [];

    // Extract text for card name
    const cardName = extractBestCardName(textAnnotations, webDetection);
    
    if (cardName) {
      const cardInfo = await getCardInfoWithDetection(cardName);
      if (cardInfo) {
        return {
          id: generateId(),
          name: cardInfo.name,
          set: cardInfo.set,
          price: cardInfo.price,
          image: cardInfo.imageUrl,
          confidence: 0.9,
          boundingBox: {
            x: 0,
            y: 0,
            width: 100,
            height: 140,
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error recognizing card:', error);
    throw new Error('Failed to recognize card');
  }
};

// Extract the best card name from OCR and web detection
const extractBestCardName = (textAnnotations: any[], webDetection: any): string | null => {
  // First, try to find card names in web detection
  if (webDetection?.webEntities) {
    for (const entity of webDetection.webEntities) {
      if (entity.description && entity.score > 0.7) {
        // Check if it looks like a card name
        if (isLikelyCardName(entity.description)) {
          return entity.description;
        }
      }
    }
  }

  // Fall back to OCR text
  if (textAnnotations.length > 0) {
    const lines = textAnnotations[0].description.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (isLikelyCardName(trimmedLine)) {
        return trimmedLine;
      }
    }
  }

  return null;
};

// Check if a string is likely to be a card name
const isLikelyCardName = (text: string): boolean => {
  if (text.length < 3 || text.length > 50) return false;
  
  // Common card name patterns
  const cardNamePatterns = [
    /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/, // Multiple capitalized words
    /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+[A-Z][a-z]+$/, // At least 3 capitalized words
  ];

  return cardNamePatterns.some(pattern => pattern.test(text));
};

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Mock function for development/testing without API keys
export const detectCardsMock = async (imageBase64: string): Promise<DetectedCard[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return [
    {
      id: '1',
      name: 'Black Lotus',
      set: 'Alpha',
      price: 50000,
      image: 'https://c1.scryfall.com/file/scryfall-cards/normal/front/0/0/000b9c4b-e2f5-4e61-91c8-4b556896d0f2.jpg?1562944156',
      confidence: 0.95,
      boundingBox: { x: 0, y: 0, width: 100, height: 140 },
    },
    {
      id: '2',
      name: 'Lightning Bolt',
      set: 'Beta',
      price: 150,
      image: 'https://c1.scryfall.com/file/scryfall-cards/normal/front/0/0/000b9c4b-e2f5-4e61-91c8-4b556896d0f3.jpg?1562944156',
      confidence: 0.88,
      boundingBox: { x: 120, y: 0, width: 100, height: 140 },
    },
    {
      id: '3',
      name: 'Charizard',
      set: 'Base Set',
      price: 350,
      image: 'https://images.pokemontcg.io/base1/4.png',
      confidence: 0.92,
      boundingBox: { x: 240, y: 0, width: 100, height: 140 },
    },
    {
      id: '4',
      name: 'Babe Ruth',
      set: 'Topps 1952',
      price: 5000000,
      image: 'https://example.com/babe-ruth-1952.jpg',
      confidence: 0.94,
      boundingBox: { x: 360, y: 0, width: 100, height: 140 },
    },
    {
      id: '5',
      name: 'Michael Jordan',
      set: 'Fleer 1986',
      price: 1500000,
      image: 'https://example.com/michael-jordan-1986.jpg',
      confidence: 0.91,
      boundingBox: { x: 480, y: 0, width: 100, height: 140 },
    },
    {
      id: '6',
      name: 'Spider-Man',
      set: 'Marvel Comics',
      price: 250,
      image: 'https://example.com/spider-man-card.jpg',
      confidence: 0.89,
      boundingBox: { x: 600, y: 0, width: 100, height: 140 },
    },
  ];
};
