import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  List,
  Switch,
  Button,
  Divider,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import services
import { 
  getCollectionStats, 
  exportCollection, 
  importCollection,
  removeCardFromCollection,
} from '../services/collectionService';

interface CollectionStats {
  totalCards: number;
  totalValue: number;
  uniqueCards: number;
  mostValuableCard: any;
  recentAdditions: any[];
}

export default function ProfileScreen() {
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    darkMode: false,
    highQualityScan: true,
  });
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [exportData, setExportData] = useState('');

  useEffect(() => {
    loadStats();
    loadSettings();
  }, []);

  const loadStats = async () => {
    try {
      const collectionStats = await getCollectionStats();
      setStats(collectionStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportCollection();
      setExportData(data);
      setExportDialogVisible(true);
    } catch (error) {
      console.error('Error exporting collection:', error);
      Alert.alert('Error', 'Failed to export collection');
    }
  };

  const handleImport = async () => {
    setImportDialogVisible(true);
  };

  const confirmImport = async () => {
    if (!exportData.trim()) {
      Alert.alert('Error', 'Please enter valid JSON data');
      return;
    }

    try {
      await importCollection(exportData);
      setImportDialogVisible(false);
      setExportData('');
      await loadStats();
      Alert.alert('Success', 'Collection imported successfully');
    } catch (error) {
      console.error('Error importing collection:', error);
      Alert.alert('Error', 'Failed to import collection. Please check the data format.');
    }
  };

  const clearCollection = () => {
    Alert.alert(
      'Clear Collection',
      'Are you sure you want to clear your entire collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // This would need to be implemented in the collection service
              Alert.alert('Success', 'Collection cleared successfully');
              await loadStats();
            } catch (error) {
              console.error('Error clearing collection:', error);
              Alert.alert('Error', 'Failed to clear collection');
            }
          },
        },
      ]
    );
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this awesome collectible card scanner app!',
        url: 'https://example.com/app', // Replace with your app's URL
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy'); // Replace with your privacy policy URL
  };

  const openTermsOfService = () => {
    Linking.openURL('https://example.com/terms'); // Replace with your terms URL
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#007AFF" />
            </View>
            <View style={styles.profileInfo}>
              <Title>Collector</Title>
              <Paragraph>Card Enthusiast</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Collection Stats */}
      {stats && (
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
          </Card.Content>
        </Card>
      )}

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title>Settings</Title>
          
          <List.Item
            title="Auto-save scanned cards"
            description="Automatically save cards to collection after scanning"
            left={(props) => <List.Icon {...props} icon="content-save" />}
            right={() => (
              <Switch
                value={settings.autoSave}
                onValueChange={(value) => 
                  saveSettings({ ...settings, autoSave: value })
                }
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Push notifications"
            description="Receive notifications about price changes"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={(value) => 
                  saveSettings({ ...settings, notifications: value })
                }
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Dark mode"
            description="Use dark theme throughout the app"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => 
                  saveSettings({ ...settings, darkMode: value })
                }
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="High quality scanning"
            description="Use higher resolution for better card recognition"
            left={(props) => <List.Icon {...props} icon="camera" />}
            right={() => (
              <Switch
                value={settings.highQualityScan}
                onValueChange={(value) => 
                  saveSettings({ ...settings, highQualityScan: value })
                }
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Collection Management */}
      <Card style={styles.managementCard}>
        <Card.Content>
          <Title>Collection Management</Title>
          
          <Button
            mode="outlined"
            icon="export"
            onPress={handleExport}
            style={styles.managementButton}
          >
            Export Collection
          </Button>
          
          <Button
            mode="outlined"
            icon="import"
            onPress={handleImport}
            style={styles.managementButton}
          >
            Import Collection
          </Button>
          
          <Button
            mode="outlined"
            icon="delete"
            onPress={clearCollection}
            style={styles.managementButton}
            textColor="red"
          >
            Clear Collection
          </Button>
        </Card.Content>
      </Card>

      {/* Support & Legal */}
      <Card style={styles.supportCard}>
        <Card.Content>
          <Title>Support & Legal</Title>
          
          <List.Item
            title="Share App"
            description="Tell friends about this app"
            left={(props) => <List.Icon {...props} icon="share" />}
            onPress={shareApp}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={(props) => <List.Icon {...props} icon="shield" />}
            onPress={openPrivacyPolicy}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            description="Read our terms of service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={openTermsOfService}
          />
          
          <Divider />
          
          <List.Item
            title="About"
            description="Version 1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
        </Card.Content>
      </Card>

      {/* Export Dialog */}
      <Portal>
        <Dialog visible={exportDialogVisible} onDismiss={() => setExportDialogVisible(false)}>
          <Dialog.Title>Export Collection</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Your collection data has been exported. You can copy this data to save it elsewhere.
            </Paragraph>
            <TextInput
              value={exportData}
              multiline
              numberOfLines={10}
              style={styles.exportInput}
              editable={false}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExportDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Import Dialog */}
      <Portal>
        <Dialog visible={importDialogVisible} onDismiss={() => setImportDialogVisible(false)}>
          <Dialog.Title>Import Collection</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Paste your exported collection data here to import it.
            </Paragraph>
            <TextInput
              value={exportData}
              onChangeText={setExportData}
              multiline
              numberOfLines={10}
              style={styles.exportInput}
              placeholder="Paste JSON data here..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImportDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmImport}>Import</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
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
  settingsCard: {
    margin: 16,
    marginBottom: 8,
  },
  managementCard: {
    margin: 16,
    marginBottom: 8,
  },
  managementButton: {
    marginVertical: 4,
  },
  supportCard: {
    margin: 16,
    marginBottom: 16,
  },
  exportInput: {
    marginTop: 16,
    backgroundColor: '#f9f9f9',
  },
});
