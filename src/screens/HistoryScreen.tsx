import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
const HistoryScreen = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Failed to load search history", error);
    }
  };

  const clearHistoryItem = async (index: number) => {
    try {
      const updatedHistory = [...searchHistory];
      updatedHistory.splice(index, 1);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
      Alert.alert('History Item Cleared', 'Search history item has been cleared successfully.');
    } catch (error) {
      console.error("Failed to clear search history item", error);
      Alert.alert('Failed to Clear History Item', 'An error occurred while clearing search history item.');
    }
  };

  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem('searchHistory');
      setSearchHistory([]);
      Alert.alert('History Cleared', 'Search history has been cleared successfully.');
    } catch (error) {
      console.error("Failed to clear search history", error);
      Alert.alert('Failed to Clear History', 'An error occurred while clearing search history.');
    }
  };

  const renderHistoryItem = ({ item, index }: { item: string, index: number }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => clearHistoryItem(index)}
    >
      <Text style={styles.historyText}>{item}</Text>
       <FontAwesomeIcon icon={faTrashAlt} size={20} color="#FF6347" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={searchHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderHistoryItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No search history available.</Text>}
      />
      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: '#FF6347', marginTop: 20 }]}
        onPress={clearAllHistory}
      >
        <Text style={styles.clearButtonText}>Clear All History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  historyText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
