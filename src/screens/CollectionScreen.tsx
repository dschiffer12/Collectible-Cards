import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Searchbar, 
  FAB, 
  Chip,
  Button,
  Dialog,
  Portal,
  TextInput,
  Menu,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import services
import { 
  getCollection, 
  searchCollection, 
  removeCardFromCollection,
  getCollectionStats,
  getUniqueSets,
  getCardsBySet,
  updateCard,
} from '../services/collectionService';

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

export default function CollectionScreen() {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<CollectionCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [sets, setSets] = useState<string[]>([]);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  // Load collection data
  const loadCollection = async () => {
    try {
      setRefreshing(true);
      const collectionCards = await getCollection();
      const collectionStats = await getCollectionStats();
      const uniqueSets = await getUniqueSets();
      
      setCards(collectionCards);
      setFilteredCards(collectionCards);
      setStats(collectionStats);
      setSets(uniqueSets);
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert('Error', 'Failed to load collection');
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh collection when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCollection();
    }, [])
  );

  // Search functionality
  const onSearchChange = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      if (selectedSet) {
        const setCards = await getCardsBySet(selectedSet);
        setFilteredCards(setCards);
      } else {
        setFilteredCards(cards);
      }
    } else {
      const searchResults = await searchCollection(query);
      setFilteredCards(searchResults);
    }
  };

  // Filter by set
  const filterBySet = async (setName: string | null) => {
    setSelectedSet(setName);
    
    if (setName === null) {
      if (searchQuery.trim() === '') {
        setFilteredCards(cards);
      } else {
        const searchResults = await searchCollection(searchQuery);
        setFilteredCards(searchResults);
      }
    } else {
      const setCards = await getCardsBySet(setName);
      setFilteredCards(setCards);
    }
  };

  // Remove card from collection
  const removeCard = async (cardId: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this card from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCardFromCollection(cardId);
              await loadCollection();
              Alert.alert('Success', 'Card removed from collection');
            } catch (error) {
              console.error('Error removing card:', error);
              Alert.alert('Error', 'Failed to remove card');
            }
          },
        },
      ]
    );
  };

  // Edit card
  const editCard = (card: CollectionCard) => {
    setSelectedCard(card);
    setEditDialogVisible(true);
  };

  // Save card edits
  const saveCardEdit = async () => {
    if (!selectedCard) return;
    
    try {
      await updateCard(selectedCard.id, {
        quantity: selectedCard.quantity,
        ...(selectedCard.condition && { condition: selectedCard.condition }),
        ...(selectedCard.notes && { notes: selectedCard.notes }),
      });
      
      setEditDialogVisible(false);
      setSelectedCard(null);
      await loadCollection();
      Alert.alert('Success', 'Card updated successfully');
    } catch (error) {
      console.error('Error updating card:', error);
      Alert.alert('Error', 'Failed to update card');
    }
  };

  // Render card item
  const renderCardItem = ({ item }: { item: CollectionCard }) => (
    <Card style={styles.cardItem}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.set}</Paragraph>
        <View style={styles.cardDetails}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        </View>
        {item.condition && (
          <Chip style={styles.conditionChip} mode="outlined">
            {item.condition}
          </Chip>
        )}
        {item.notes && (
          <Paragraph style={styles.notes}>{item.notes}</Paragraph>
        )}
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => editCard(item)} mode="outlined">
          Edit
        </Button>
        <Button onPress={() => removeCard(item.id)} mode="outlined" textColor="red">
          Remove
        </Button>
      </Card.Actions>
    </Card>
  );

  // Render stats card
  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Collection Overview</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalCards}</Text>
              <Text style={styles.statLabel}>Total Cards</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.uniqueCards}</Text>
              <Text style={styles.statLabel}>Unique Cards</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>${stats.totalValue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </View>
          {stats.mostValuableCard && (
            <View style={styles.mostValuable}>
              <Text style={styles.mostValuableLabel}>Most Valuable:</Text>
              <Text style={styles.mostValuableCard}>
                {stats.mostValuableCard.name} (${stats.mostValuableCard.price.toFixed(2)})
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search cards..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Set Filter Chips */}
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedSet === null}
          onPress={() => filterBySet(null)}
          style={styles.filterChip}
        >
          All Sets
        </Chip>
        {sets.slice(0, 5).map((setName) => (
          <Chip
            key={setName}
            selected={selectedSet === setName}
            onPress={() => filterBySet(setName)}
            style={styles.filterChip}
          >
            {setName}
          </Chip>
        ))}
      </View>

      {/* Collection List */}
      <FlatList
        data={filteredCards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadCollection} />
        }
        ListHeaderComponent={renderStatsCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No cards in your collection</Text>
            <Text style={styles.emptySubtext}>
              Scan some cards to get started!
            </Text>
          </View>
        }
      />

      {/* Edit Card Dialog */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Card</Dialog.Title>
          <Dialog.Content>
            {selectedCard && (
              <View>
                <TextInput
                  label="Quantity"
                  value={selectedCard.quantity.toString()}
                  onChangeText={(text) => 
                    setSelectedCard({
                      ...selectedCard,
                      quantity: parseInt(text) || 1
                    })
                  }
                  keyboardType="numeric"
                  style={styles.dialogInput}
                />
                <TextInput
                  label="Condition"
                  value={selectedCard.condition || ''}
                  onChangeText={(text) => 
                    setSelectedCard({
                      ...selectedCard,
                      condition: text
                    })
                  }
                  style={styles.dialogInput}
                />
                <TextInput
                  label="Notes"
                  value={selectedCard.notes || ''}
                  onChangeText={(text) => 
                    setSelectedCard({
                      ...selectedCard,
                      notes: text
                    })
                  }
                  multiline
                  numberOfLines={3}
                  style={styles.dialogInput}
                />
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveCardEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  list: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mostValuable: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  mostValuableLabel: {
    fontSize: 14,
    color: '#666',
  },
  mostValuableCard: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cardItem: {
    margin: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  conditionChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  notes: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  dialogInput: {
    marginBottom: 16,
  },
});
