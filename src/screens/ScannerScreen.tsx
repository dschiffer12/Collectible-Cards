import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

// Import services
import { detectCards, recognizeCard } from '../services/aiService';
import { saveCardToCollection } from '../services/collectionService';

const { width, height } = Dimensions.get('window');

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

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCards, setDetectedCards] = useState<DetectedCard[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        // Process the image to detect cards
        await processImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      // Optimize image for AI processing
      const optimizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      // Detect cards in the image
      const detectedCards = await detectCards(optimizedImage.base64!);
      setDetectedCards(detectedCards);

      if (detectedCards.length > 0) {
        setIsScanning(true);
      } else {
        Alert.alert('No Cards Found', 'No collectible cards were detected in the image. Please try again.');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image');
    }
  };

  const saveCard = async (card: DetectedCard) => {
    try {
      await saveCardToCollection(card);
      Alert.alert('Success', `${card.name} has been added to your collection!`);
      
      // Remove the card from detected cards
      setDetectedCards(prev => prev.filter(c => c.id !== card.id));
      
      if (detectedCards.length === 1) {
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('Error', 'Failed to save card to collection');
    }
  };

  const skipCard = (cardId: string) => {
    setDetectedCards(prev => prev.filter(c => c.id !== cardId));
    if (detectedCards.length === 1) {
      setIsScanning(false);
    }
  };

  const flipCamera = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your photo library.');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    if (!(await requestMediaLibraryPermission())) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    } finally {
      setIsProcessing(false);
    }
  };

  const showImageSourceOptions = () => {
    setShowImageSourceModal(true);
  };

  const handleImageSourceSelection = (source: 'camera' | 'gallery') => {
    setShowImageSourceModal(false);
    if (source === 'camera') {
      takePicture();
    } else if (source === 'gallery') {
      pickImageFromGallery();
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  if (isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.scanningHeader}>
          <Title>Detected Cards</Title>
          <Paragraph>{detectedCards.length} card(s) found</Paragraph>
        </View>
        
        <View style={styles.cardsContainer}>
          {detectedCards.map((card) => (
            <Card key={card.id} style={styles.cardItem}>
              <Card.Cover source={{ uri: card.image }} />
              <Card.Content>
                <Title>{card.name}</Title>
                <Paragraph>{card.set}</Paragraph>
                <Paragraph>Estimated Value: ${card.price}</Paragraph>
                <Paragraph>Confidence: {Math.round(card.confidence * 100)}%</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => saveCard(card)} mode="contained">
                  Add to Collection
                </Button>
                <Button onPress={() => skipCard(card.id)} mode="outlined">
                  Skip
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
        
        <Button 
          onPress={() => setIsScanning(false)} 
          mode="outlined" 
          style={styles.backButton}
        >
          Back to Scanner
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        type={cameraType}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          {/* Scanning frame overlay */}
          <View style={styles.scanFrame}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          
          <Text style={styles.instructionText}>
            Position cards within the frame
          </Text>
          <Text style={styles.subtitleText}>
            Tap the center button to choose camera or gallery
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]} 
            onPress={showImageSourceOptions}
            disabled={isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromGallery}>
            <Ionicons name="images" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>

      {/* Image Source Modal */}
      {showImageSourceModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Choose Image Source</Title>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => handleImageSourceSelection('camera')}
              >
                <Ionicons name="camera" size={40} color="#007AFF" />
                <Text style={styles.modalButtonText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => handleImageSourceSelection('gallery')}
              >
                <Ionicons name="images" size={40} color="#007AFF" />
                <Text style={styles.modalButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.6,
    height: height * 0.6,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: '#007AFF',
    top: -2,
    left: -2,
  },
  cornerTopRight: {
    right: -2,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: -2,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    top: 'auto',
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  subtitleText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 50,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    marginBottom: 30,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  modalButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    minWidth: 100,
  },
  modalButtonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#ff3b30',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanningHeader: {
    padding: 20,
    backgroundColor: 'white',
  },
  cardsContainer: {
    flex: 1,
    padding: 20,
  },
  cardItem: {
    marginBottom: 20,
  },
  backButton: {
    margin: 20,
  },
});
