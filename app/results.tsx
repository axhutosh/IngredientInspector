import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const WATCHLIST_STORAGE_KEY = 'my-watchlist';

// === FIX 1: THE ALIAS DICTIONARY ===
// This makes the app smarter. You can add more groups here later.
// keys MUST be lowercase.
const ALIAS_MAP: { [key: string]: string[] } = {
  'palm oil': ['palm oil', 'palmolein', 'palm kernel', 'palm fruit', 'palmitate', 'elaeis guineensis'],
  'sugar': ['sugar', 'high fructose corn syrup', 'corn syrup', 'dextrose', 'fructose', 'sucrose', 'maltose', 'cane juice', 'molasses'],
  'msg': ['msg', 'monosodium glutamate', 'yeast extract', 'glutamate', 'hydrolyzed vegetable protein'],
  'aspartame': ['aspartame', 'nutrasweet', 'equal', 'e951'],
};

const NovaDisplay = ({ score }: { score: string }) => {
  let text = 'NOVA Score Not Found';
  let color = '#888';
  if (score === '1') {
    text = 'NOVA 1: Unprocessed';
    color = '#4CAF50';
  } else if (score === '2') {
    text = 'NOVA 2: Processed';
    color = '#FFC107';
  } else if (score === '3') {
    text = 'NOVA 3: Processed';
    color = '#FF9800';
  } else if (score === '4') {
    text = 'NOVA 4: Ultra-Processed';
    color = '#E53935';
  }
  return (
    <ThemedView style={[styles.novaBadge, { backgroundColor: color }]}>
      <ThemedText style={styles.novaText}>{text}</ThemedText>
    </ThemedView>
  );
};

const AlertBox = ({ alerts }: { alerts: string[] }) => {
  if (alerts.length === 0) {
    return (
      <ThemedView style={[styles.alertBox, { backgroundColor: '#4CAF50' }]}>
        <ThemedText style={styles.alertTitle}>All Clear!</ThemedText>
        <ThemedText style={styles.alertText}>
          This product does not contain any items from your watchlist.
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView style={[styles.alertBox, { backgroundColor: '#E53935' }]}>
      <ThemedText style={styles.alertTitle}>Warning!</ThemedText>
      <ThemedText style={styles.alertText}>
        Found: {alerts.join(', ')}
      </ThemedText>
    </ThemedView>
  );
};

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [foundAlerts, setFoundAlerts] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  const {
    productName = 'Product Not Found',
    imageUrl,
    novaScore = 'N/A',
    ingredients = 'No ingredients listed.',
  } = params;

  useEffect(() => {
    const loadAndCheckWatchlist = async () => {
      const storedList = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
      const loadedWatchlist = storedList ? JSON.parse(storedList) : [];
      setWatchlist(loadedWatchlist);

      if (loadedWatchlist.length > 0) {
        const ingredientsLower = (ingredients as string).toLowerCase();
        const alertsFound: string[] = [];

        // === NEW SMARTER CHECKING LOGIC ===
        for (const userItem of loadedWatchlist) {
           const lowerUserItem = userItem.toLowerCase();
           // Check if this item has aliases in our map, OR just use the item itself
           const searchTerms = ALIAS_MAP[lowerUserItem] || [lowerUserItem];

           // Check ALL search terms for this one item
           for (const term of searchTerms) {
             if (ingredientsLower.includes(term)) {
               alertsFound.push(userItem); // Add the original name to alerts
               break; // Stop checking synonyms if we already found a match
             }
           }
        }
        setFoundAlerts(alertsFound);
      }
      setIsChecking(false);
    };
    loadAndCheckWatchlist();
  }, [ingredients]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!isChecking && <AlertBox alerts={foundAlerts} />}

        {imageUrl ? (
          <Image source={{ uri: imageUrl as string }} style={styles.productImage} />
        ) : (
          <ThemedView style={styles.imagePlaceholder}>
            <ThemedText>No Image</ThemedText>
          </ThemedView>
        )}

        <ThemedText style={styles.title}>{productName}</ThemedText>
        <NovaDisplay score={novaScore as string} />

        <ThemedView style={styles.ingredientsContainer}>
          <ThemedText style={styles.ingredientsTitle}>Ingredients:</ThemedText>
          {/* === FIX 2: BETTER UI FOR INGREDIENTS === */}
          {(ingredients as string).split(',').map((item, index) => (
             <ThemedText key={index} style={styles.ingredientItem}>
               • {item.trim()}
             </ThemedText>
           ))}
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.closeButtonContainer}>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <ThemedText style={styles.buttonText}>Close</ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContainer: { alignItems: 'center', padding: 20, paddingBottom: 100 },
  alertBox: { width: '100%', padding: 16, borderRadius: 12, marginBottom: 20 },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  alertText: { fontSize: 16, color: '#fff' },
  productImage: { width: '100%', aspectRatio: 1, borderRadius: 12, resizeMode: 'contain' },
  imagePlaceholder: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 },
  novaBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginVertical: 16 },
  novaText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  ingredientsContainer: { width: '100%', marginTop: 16, backgroundColor: '#333', padding: 16, borderRadius: 8 },
  ingredientsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  // New style for the list items
  ingredientItem: { fontSize: 14, lineHeight: 22, marginBottom: 4 },
  closeButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, borderColor: '#444' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});