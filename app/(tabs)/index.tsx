import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
// 1. Import Ionicons for the logo
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setIsLoading(true);
    console.log(`Fetching data for barcode: ${data}`);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${data}.json`
      );
      const json = await response.json();

      if (json.status === 1 && json.product) {
        const product = json.product;
        router.push({
          pathname: '/results',
          params: {
            productName: product.product_name || 'Name not found',
            imageUrl: product.image_front_url || '',
            novaScore: product.nova_group || 'N/A',
            ingredients: product.ingredients_text || 'No ingredients listed.',
          },
        });
      } else {
        alert('Product not found. Try a different item.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while fetching data.');
    }

    setIsLoading(false);
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting for camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>No access to camera</ThemedText>
        <Pressable style={styles.button} onPress={requestPermission}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.subtitle}>Fetching product data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* 2. NEW HEADER SECTION */}
      <ThemedView style={styles.header}>
        <Ionicons name="scan-circle-outline" size={40} color="#007AFF" />
        <ThemedText style={styles.appName}>Ingredient Inspector</ThemedText>
      </ThemedView>

      <ThemedText style={styles.subtitle}>
        Scan a barcode to see what&apos;s inside.
      </ThemedText>

      <ThemedView style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'upc_a', 'qr'],
          }}
        />
      </ThemedView>

      {scanned && (
        <Pressable style={styles.button} onPress={() => setScanned(false)}>
          <ThemedText style={styles.buttonText}>Tap to Scan Again</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // 3. NEW STYLES FOR HEADER
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#007AFF', // Matches our button color
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 20, // Slightly rounder corners
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});