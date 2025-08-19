import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

interface CollectionCard {
  id: string;
  name: string;
  set: string;
  price: number;
  image: string;
  confidence: number;
  dateAdded: string;
  condition?: string;
  quantity: number;
  notes?: string;
  tags?: string[];
}

interface CollectionStats {
  totalCards: number;
  totalValue: number;
  uniqueCards: number;
  mostValuableCard: CollectionCard | null;
  recentAdditions: CollectionCard[];
}

// Initialize SQLite database
const db = SQLite.openDatabase('collection.db');

// Initialize database tables
export const initializeDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cards (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          set_name TEXT NOT NULL,
          price REAL NOT NULL,
          image_url TEXT,
          confidence REAL NOT NULL,
          date_added TEXT NOT NULL,
          condition TEXT,
          quantity INTEGER DEFAULT 1,
          notes TEXT,
          tags TEXT
        );`,
        [],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Save a card to the collection
export const saveCardToCollection = async (card: any): Promise<void> => {
  try {
    await initializeDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO cards 
           (id, name, set_name, price, image_url, confidence, date_added, quantity) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            card.id,
            card.name,
            card.set,
            card.price,
            card.image,
            card.confidence,
            new Date().toISOString(),
            1
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error saving card to collection:', error);
    throw error;
  }
};

// Get all cards in the collection
export const getCollection = async (): Promise<CollectionCard[]> => {
  try {
    await initializeDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cards ORDER BY date_added DESC',
          [],
          (_, { rows }) => {
            const cards: CollectionCard[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              cards.push({
                id: row.id,
                name: row.name,
                set: row.set_name,
                price: row.price,
                image: row.image_url,
                confidence: row.confidence,
                dateAdded: row.date_added,
                condition: row.condition,
                quantity: row.quantity,
                notes: row.notes,
                tags: row.tags ? JSON.parse(row.tags) : [],
              });
            }
            resolve(cards);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
};

// Search cards in collection
export const searchCollection = async (query: string): Promise<CollectionCard[]> => {
  try {
    await initializeDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM cards 
           WHERE name LIKE ? OR set_name LIKE ? OR notes LIKE ?
           ORDER BY date_added DESC`,
          [`%${query}%`, `%${query}%`, `%${query}%`],
          (_, { rows }) => {
            const cards: CollectionCard[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              cards.push({
                id: row.id,
                name: row.name,
                set: row.set_name,
                price: row.price,
                image: row.image_url,
                confidence: row.confidence,
                dateAdded: row.date_added,
                condition: row.condition,
                quantity: row.quantity,
                notes: row.notes,
                tags: row.tags ? JSON.parse(row.tags) : [],
              });
            }
            resolve(cards);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error searching collection:', error);
    throw error;
  }
};

// Update card information
export const updateCard = async (cardId: string, updates: Partial<CollectionCard>): Promise<void> => {
  try {
    await initializeDatabase();
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.set !== undefined) {
      updateFields.push('set_name = ?');
      values.push(updates.set);
    }
    if (updates.price !== undefined) {
      updateFields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.condition !== undefined) {
      updateFields.push('condition = ?');
      values.push(updates.condition);
    }
    if (updates.quantity !== undefined) {
      updateFields.push('quantity = ?');
      values.push(updates.quantity);
    }
    if (updates.notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.tags !== undefined) {
      updateFields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    
    if (updateFields.length === 0) return;
    
    values.push(cardId);
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE cards SET ${updateFields.join(', ')} WHERE id = ?`,
          values,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

// Remove card from collection
export const removeCardFromCollection = async (cardId: string): Promise<void> => {
  try {
    await initializeDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM cards WHERE id = ?',
          [cardId],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error removing card from collection:', error);
    throw error;
  }
};

// Get collection statistics
export const getCollectionStats = async (): Promise<CollectionStats> => {
  try {
    const cards = await getCollection();
    
    const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
    const totalValue = cards.reduce((sum, card) => sum + (card.price * card.quantity), 0);
    const uniqueCards = cards.length;
    const mostValuableCard = cards.length > 0 
      ? cards.reduce((max, card) => card.price > max.price ? card : max)
      : null;
    const recentAdditions = cards.slice(0, 5);
    
    return {
      totalCards,
      totalValue,
      uniqueCards,
      mostValuableCard,
      recentAdditions,
    };
  } catch (error) {
    console.error('Error getting collection stats:', error);
    throw error;
  }
};

// Export collection data
export const exportCollection = async (): Promise<string> => {
  try {
    const cards = await getCollection();
    const exportData = {
      exportDate: new Date().toISOString(),
      totalCards: cards.length,
      cards: cards,
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting collection:', error);
    throw error;
  }
};

// Import collection data
export const importCollection = async (jsonData: string): Promise<void> => {
  try {
    const importData = JSON.parse(jsonData);
    const cards = importData.cards || [];
    
    await initializeDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Clear existing data
        tx.executeSql('DELETE FROM cards', [], () => {
          // Insert imported cards
          let completed = 0;
          const total = cards.length;
          
          if (total === 0) {
            resolve();
            return;
          }
          
          cards.forEach((card: CollectionCard) => {
            tx.executeSql(
              `INSERT INTO cards 
               (id, name, set_name, price, image_url, confidence, date_added, condition, quantity, notes, tags) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                card.id,
                card.name,
                card.set,
                card.price,
                card.image,
                card.confidence,
                card.dateAdded,
                card.condition,
                card.quantity,
                card.notes,
                card.tags ? JSON.stringify(card.tags) : null,
              ],
              () => {
                completed++;
                if (completed === total) {
                  resolve();
                }
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });
      });
    });
  } catch (error) {
    console.error('Error importing collection:', error);
    throw error;
  }
};

// Get cards by set
export const getCardsBySet = async (setName: string): Promise<CollectionCard[]> => {
  try {
    await initializeDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cards WHERE set_name = ? ORDER BY name',
          [setName],
          (_, { rows }) => {
            const cards: CollectionCard[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              cards.push({
                id: row.id,
                name: row.name,
                set: row.set_name,
                price: row.price,
                image: row.image_url,
                confidence: row.confidence,
                dateAdded: row.date_added,
                condition: row.condition,
                quantity: row.quantity,
                notes: row.notes,
                tags: row.tags ? JSON.parse(row.tags) : [],
              });
            }
            resolve(cards);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error getting cards by set:', error);
    throw error;
  }
};

// Get unique sets in collection
export const getUniqueSets = async (): Promise<string[]> => {
  try {
    await initializeDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT DISTINCT set_name FROM cards ORDER BY set_name',
          [],
          (_, { rows }) => {
            const sets: string[] = [];
            for (let i = 0; i < rows.length; i++) {
              sets.push(rows.item(i).set_name);
            }
            resolve(sets);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  } catch (error) {
    console.error('Error getting unique sets:', error);
    throw error;
  }
};
