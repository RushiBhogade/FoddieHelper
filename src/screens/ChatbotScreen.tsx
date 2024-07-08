import React, { useState, useEffect } from 'react';
import { View, Button, Text, ScrollView, PermissionsAndroid, Platform, StyleSheet, Image, FlatList, Dimensions, useWindowDimensions, TouchableOpacity, Alert, Appearance } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-community/voice';
import HTML from 'react-native-render-html';
import Sidebar from './MenuComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

interface Recipe {
    id: number;
    image: string;
    title: string;
    ingredients: { name: string }[];
    instructions: string;
}

const ChatbotScreen = () => {
    const { width } = useWindowDimensions(); // Using width for contentWidth in HTML
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false); // State to manage sidebar visibility
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        loadSearchHistory();
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    useEffect(() => {
        const appearanceListener = Appearance.addChangeListener(({ colorScheme }) => {
            // Handle appearance change here (if needed)
        });
        return () => {
            appearanceListener.remove();
        };
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

    const saveSearchHistory = async (newHistory: string[]) => {
        try {
            await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
        } catch (error) {
            console.error("Failed to save search history", error);
        }
    };

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
                    apiKey: 'a87f8a7cac31436c8f940478f73c325a',
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
                            apiKey: 'a87f8a7cac31436c8f940478f73c325a',
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

                // Save the query to search history
                const newHistory = [query, ...searchHistory.filter(item => item !== query)];
                setSearchHistory(newHistory);
                saveSearchHistory(newHistory);
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
        setQuery(text); // Update query state with the recognized speech text
        setIsListening(false); // Turn off listening mode
        fetchRecipes(); // Fetch recipes based on the recognized query
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

    const handleSuggestionSelect = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        fetchRecipes();
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
                        onChangeText={(text) => {
                            setQuery(text);
                            setShowSuggestions(text.length > 0);
                        }}
                        style={styles.input}
                        mode="outlined"
                        theme={{ colors: { primary: '#FF6347', background: '#fff' } }}
                        onFocus={() => setShowSuggestions(query.length > 0)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                    />
                    <TouchableOpacity
                        style={styles.voiceButton}
                        onPress={isListening ? stopListening : startListening}
                    >
                        <FontAwesomeIcon
                            icon={isListening ? faMicrophone : faMicrophoneSlash}
                            size={24}
                            color="#FF6347"
                        />
                    </TouchableOpacity>
                    <Button title="Search" onPress={fetchRecipes} disabled={loading} color="#FF6347" />
                </View>

                {showSuggestions && (
                    <View style={styles.suggestionsContainer}>
                        <FlatList
                            data={searchHistory.filter(item => item.includes(query))}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSuggestionSelect(item)}>
                                    <Text style={styles.suggestionItem}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

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
                                    title={expandedRecipe === index ? "Hide Details" : "Show Details"}
                                    onPress={() => toggleRecipeDetails(index)}
                                    color="#FF6347"
                                />
                                {expandedRecipe === index && (
                                    <View style={styles.recipeDetails}>
                                        <Text style={styles.recipeSectionTitle}>Ingredients:</Text>
                                        {recipe.ingredients.map((ingredient, ingIndex) => (
                                            <Text key={ingIndex} style={styles.recipeText}>{ingredient.name}</Text>
                                        ))}
                                        <Text style={styles.recipeSectionTitle}>Instructions:</Text>
                                        <HTML
                                            source={{ html: preprocessInstructions(recipe.instructions) }}
                                            contentWidth={width}
                                            tagsStyles={{ p: styles.recipeText }}
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
        backgroundColor: '#f2f2f2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6347',
        padding: 10,
    },
    sidebarToggle: {
        padding: 5,
    },
    sidebarToggleImage: {
        width: 25,
        height: 25,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    mainContent: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        marginRight: 10,
    },
    voiceButton: {
        padding: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        textAlign: 'center',
        color: '#FF6347',
        marginBottom: 20,
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
        marginBottom: 20,
    },
    recipeCard: {
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
    recipeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    recipeImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    recipeDetails: {
        marginTop: 10,
    },
    recipeSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    recipeText: {
        fontSize: 14,
        marginBottom: 5,
    },
    noRecipesContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    chatbotImage: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
    },
    noRecipesText: {
        marginTop: 20,
        fontStyle: 'italic',
        color: '#888',
    },
    suggestionsContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    suggestionItem: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#333',
    },
});

export default ChatbotScreen;
