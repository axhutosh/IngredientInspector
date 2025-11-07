// 1. Import useEffect and the new AsyncStorage library
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    TextInput,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// 2. A constant for our storage key
const WATCHLIST_STORAGE_KEY = 'my-watchlist';

export default function WatchlistScreen() {
  const [text, setText] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  // 3. Add a loading state
  const [isLoading, setIsLoading] = useState(true);

  // 4. NEW: useEffect to LOAD data when the app starts
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const storedList = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (storedList !== null) {
          setWatchlist(JSON.parse(storedList)); // Parse the stored JSON string
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load the watchlist.');
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    loadWatchlist();
  }, []); // The empty array [] means this runs only once on mount

  // 5. NEW: useEffect to SAVE data when the watchlist changes
  useEffect(() => {
    const saveWatchlist = async () => {
      try {
        const jsonList = JSON.stringify(watchlist); // Convert the array to a JSON string
        await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, jsonList);
      } catch (e) {
        Alert.alert('Error', 'Failed to save the watchlist.');
      }
    };

    // Only save if we are NOT in the initial loading state
    if (!isLoading) {
      saveWatchlist();
    }
  }, [watchlist, isLoading]); // This runs every time 'watchlist' or 'isLoading' changes

  const handleAddItem = () => {
    if (text.trim().length > 0) {
      setWatchlist((prevList) => [text.trim(), ...prevList]);
      setText('');
    }
  };

  const handleDeleteItem = (indexToDelete: number) => {
    setWatchlist((prevList) =>
      prevList.filter((_, index) => index !== indexToDelete)
    );
  };

  // 6. Show a loading message
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Loading Watchlist...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>My Watchlist</ThemedText>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Palm Oil"
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
          />
          <Pressable style={styles.addButton} onPress={handleAddItem}>
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
          </Pressable>
        </ThemedView>

        <FlatList
          style={styles.list}
          data={watchlist}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item, index }) => (
            <ThemedView style={styles.listItem}>
              <ThemedText style={styles.listItemText}>{item}</ThemedText>
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteItem(index)}
              >
                <ThemedText style={styles.deleteButtonText}>X</ThemedText>
              </Pressable>
            </ThemedView>
          )}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

// ... your styles object remains exactly the same ...
// (Make sure to paste your full styles object at the bottom)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    width: '100%',
  },
  listItem: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 16,
    color: '#fff',
    flex: 1, 
  },
  deleteButton: {
    backgroundColor: '#E53935', 
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});