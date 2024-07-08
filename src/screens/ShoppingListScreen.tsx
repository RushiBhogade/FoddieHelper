import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const ShoppingListScreen = () => {
    const [shoppingList, setShoppingList] = useState<any[]>([]);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const loadShoppingList = async () => {
                try {
                    const list = await AsyncStorage.getItem('shoppingList');
                    if (list) {
                        setShoppingList(JSON.parse(list));
                    }
                } catch (error) {
                    console.error('Failed to load shopping list', error);
                }
            };

            loadShoppingList();

            // Clean-up function (optional)
            return () => {
                // Any clean-up logic here
            };
        }, [])
    );

    const deleteItem = async (index: number) => {
        try {
            const updatedList = [...shoppingList];
            updatedList.splice(index, 1);
            await AsyncStorage.setItem('shoppingList', JSON.stringify(updatedList));
            setShoppingList(updatedList);
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    const toggleDetails = (index: number) => {
        setExpandedItem(expandedItem === index ? null : index);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={shoppingList}
                renderItem={({ item, index }) => (
                    <View style={styles.itemContainer}>
                        
                        <TouchableOpacity onPress={() => toggleDetails(index)}>
                            <Text style={styles.itemTitle}>{item.name}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteItem(index)} style={styles.deleteButton}>
                            <FontAwesomeIcon icon={faTrashAlt} size={20} color="#fff" />
                        </TouchableOpacity>

                        {expandedItem === index && (
                            <ScrollView style={styles.details}>
                                <Text style={styles.detailTitle}>Ingredients:</Text>
                                {item.ingredients.map((ingredient: string, ingIndex: number) => (
                                    <Text key={ingIndex} style={styles.detailText}>
                                        {ingredient}
                                    </Text>
                                ))}
                                <Text style={styles.detailTitle}>Instructions:</Text>
                                <ScrollView style={styles.instructions}>
                                    <Text style={styles.detailText}>{item.instructions}</Text>
                                </ScrollView>
                            </ScrollView>
                        )}
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No items in shopping list.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    deleteButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#FF6347',
        padding: 5,
        borderRadius: 5,
    },
    deleteText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    details: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        padding:10
    },
    detailTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    detailText: {
        fontSize: 12,
        marginBottom: 5,
        color: '#000',
    },
    instructions: {
        maxHeight: 100,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});
export default ShoppingListScreen;
