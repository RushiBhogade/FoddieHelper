import React, { useState, useEffect } from 'react';
import { View, Button, Text, ScrollView, PermissionsAndroid, Platform, StyleSheet, Image, FlatList, Dimensions, useWindowDimensions, TouchableOpacity, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-community/voice';
import HTML from 'react-native-render-html';
import Sidebar from './MenuComponent';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Example icon import, adjust as per your library and icon name

interface Recipe {
    id: number;
    image: string;
    title: string;
    ingredients: { name: string }[];
    instructions: string;
}

const ChatbotScreen = () => {
    const { width, height } = useWindowDimensions(); // Using height for full-screen TextInput
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false); // State to manage sidebar visibility

    useEffect(() => {
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar); // Toggle sidebar state
    };

    const closeSidebar = () => {
        setShowSidebar(false); // Close sidebar
    };

    const onSelectCategory = (category: string) => {
        setQuery(category); // Update query based on selected category
        fetchRecipes(); // Fetch recipes based on the new query (category)
    };

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null); // Reset the error state before fetching

            // Fetch recipes based on the current query
            const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
                params: {
                    query,
                    apiKey: 'c0c0882cd3614847ab06e54f92b1f859',
                }
            });

            if (response.status === 402) {
                Alert.alert(
                    'Free credits exhausted',
                    'Sorry, the free credits for this API have been exhausted. Please try again later or upgrade your plan.',
                );
                return;
            }

            if (response.data.results.length === 0) {
                setError('No recipes found.');
            } else {
                // Fetch detailed information for each recipe
                const recipesData = await Promise.all(response.data.results.map(async (result: any) => {
                    const recipeDetailResponse = await axios.get(`https://api.spoonacular.com/recipes/${result.id}/information`, {
                        params: {
                            apiKey: 'c0c0882cd3614847ab06e54f92b1f859',
                        }
                    });

                    // Create a detailed recipe object
                    const detailedRecipe: Recipe = {
                        id: result.id,
                        image: result.image,
                        title: result.title,
                        ingredients: recipeDetailResponse.data.extendedIngredients.map((ing: any) => ({ name: ing.original })),
                        instructions: recipeDetailResponse.data.instructions,
                    };
                    return detailedRecipe;
                }));

                setRecipes(recipesData); // Update recipes state
                await AsyncStorage.setItem('searchedRecipes', JSON.stringify(recipesData)); // Store recipes in AsyncStorage
            }
        } catch (error) {
            if (error.response && error.response.status === 402) {
                Alert.alert(
                    'Free credits exhausted',
                    'Sorry, the free credits for this API have been exhausted. Please try again later or upgrade your plan.',
                );
            } else {
                setError('An error occurred while fetching recipes.');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const startListening = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: "Voice Recognition Permission",
                        message: "App needs access to your microphone to recognize speech",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.error("Microphone permission denied");
                    return;
                }
            } catch (err) {
                console.error(err);
                return;
            }
        }
        setIsListening(true);
        try {
            await Voice.start('en-US');
        } catch (error) {
            console.error(error);
        }
    };

    const stopListening = async () => {
        setIsListening(false);
        try {
            await Voice.stop();
        } catch (error) {
            console.error(error);
        }
    };

    const onSpeechResults = (event: any) => {
        const text = event.value[0];
        setQuery(text); // Set recognized text as query
        setIsListening(false); // Stop listening
        fetchRecipes(); // Fetch recipes based on recognized text
    };

    const onSpeechError = (event: any) => {
        console.error(event.error);
        setIsListening(false);
    };

    const toggleRecipeDetails = (index: number) => {
        setExpandedRecipe(expandedRecipe === index ? null : index);
    };

    const preprocessInstructions = (instructions: string) => {
        return instructions.replace(/<\/li><li>/g, '</li>\n<li>');
    };

    return (
        <View style={styles.container}>
            <Sidebar show={showSidebar} onClose={closeSidebar} onSelectCategory={onSelectCategory} />
    <View style={styles.header}>
                    <TouchableOpacity onPress={toggleSidebar} style={styles.sidebarToggle}>
                        <Image
                            source={require('../images/main-menu.png')}
                            style={styles.sidebarToggleImage}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Foodie Helper</Text>
                </View>
            <View style={styles.mainContent}>
            

                <View style={styles.inputContainer}>
                    <TextInput
                        label="Ask for a recipe..."
                        value={query}
                        onChangeText={setQuery}
                        style={styles.input}
                        mode="outlined"
                        theme={{ colors: { primary: '#FF6347' } }}
                    />
                    <TouchableOpacity
                        style={styles.voiceButton}
                        onPress={isListening ? stopListening : startListening}
                    >
                        <Icon
                            name={isListening ? 'mic' : 'mic-none'}
                            size={30}
                            color="#FF6347"
                        />
                    </TouchableOpacity>
                    <Button title="Search" onPress={fetchRecipes} disabled={loading} color="#FF6347" />
                </View>

                {/* <View style={styles.buttonContainer}>
                    <Button title={isListening ? "Stop Listening" : "Use Voice"} onPress={isListening ? stopListening : startListening} color="#FF6347" />
                </View> */}

                {loading && <Text style={styles.loadingText}>Loading recipes...</Text>}
                {error && <Text style={styles.errorText}>{error}</Text>}

                <ScrollView>
                    {recipes.length > 0 ? (
                        recipes.map((recipe: Recipe, index: number) => (
                            <View key={index} style={styles.recipeCard}>
                                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                                <Image
                                    source={{ uri: recipe.image }}
                                    style={styles.recipeImage}
                                />
                                <Button
                                    title={expandedRecipe === index ? "Hide Details" : "View Details"}
                                    onPress={() => toggleRecipeDetails(index)}
                                    color="#FFA500"
                                />
                                {expandedRecipe === index && (
                                    <View>
                                        <Text style={styles.sectionTitle}>Ingredients:</Text>
                                        <FlatList
                                            data={recipe.ingredients}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            renderItem={({ item }) => <Text style={styles.ingredient}>{item.name}</Text>}
                                        />
                                        <Text style={styles.sectionTitle}>Instructions:</Text>
                                        <HTML
                                            source={{ html: preprocessInstructions(recipe.instructions) }}
                                            contentWidth={width * 0.9}
                                            tagsStyles={{ p: { color: '#333', fontSize: 16 }, li: { color: '#333', fontSize: 16 } }}
                                        />
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        !loading && !error && (
                            <View style={styles.noRecipesContainer}>
                                  <Text style={styles.noRecipesText}>Ask for a recipe using the search bar or voice input!</Text>
                                <Image
                                    source={require('../images/foddieHelper.png')}
                                    style={styles.chatbotImage}
                                />
                              
                            </View>
                        )
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff5e1',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 20,
   
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding:10
    },
    sidebarToggle: {
        marginRight: 10,
    },
    sidebarToggleImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6347',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        marginVertical: 10,
        marginRight: 10,
    },
    voiceButton: {
        padding: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    recipeCard: {
        borderWidth: 1,
        borderColor: '#ff8c00',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginVertical: 10,
        padding: 10,
    },
    recipeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    recipeImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#FF6347',
    },
    ingredient: {
        marginLeft: 10,
        marginBottom: 5,
        color: '#333',
    },
    loadingText: {
        alignSelf: 'center',
        marginTop: 20,
        color: '#FF6347',
    },
    errorText: {
        alignSelf: 'center',
        marginTop: 20,
        color: 'red',
        fontStyle: 'italic',
    },
    noRecipesContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    chatbotImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    noRecipesText: {
        marginTop: 20,
        fontStyle: 'italic',
        color: '#888',
    },
});

export default ChatbotScreen;
