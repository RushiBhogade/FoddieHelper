import React, { useState, useEffect } from 'react';
import { View, Button, Text, ScrollView, PermissionsAndroid, Platform, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-community/voice';
import HTML from 'react-native-render-html';

const { width, height } = Dimensions.get('window');

interface Recipe {
    id: number;
    image: string;
    title: string;
    ingredients: { name: string }[];
    instructions: string;
}

const ChatbotScreen = () => {
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);

    useEffect(() => {
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
                params: {
                    query,
                    apiKey: '65aa3b771c344b8bbe3cf6c4989d39ea',
                }
            });
            const recipesData = await Promise.all(response.data.results.map(async (result: any) => {
                const recipeDetailResponse = await axios.get(`https://api.spoonacular.com/recipes/${result.id}/information`, {
                    params: {
                        apiKey: '65aa3b771c344b8bbe3cf6c4989d39ea',
                    }
                });
                const detailedRecipe: Recipe = {
                    id: result.id,
                    image: result.image,
                    title: result.title,
                    ingredients: recipeDetailResponse.data.extendedIngredients.map((ing: any) => ({ name: ing.original })),
                    instructions: recipeDetailResponse.data.instructions,
                };
                return detailedRecipe;
            }));
            setRecipes(recipesData);
            await AsyncStorage.setItem('searchedRecipes', JSON.stringify(recipesData));
        } catch (error) {
            console.error(error);
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
        setQuery(text);
        setIsListening(false);
        fetchRecipes();
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
            <TextInput
                label="Ask for a recipe..."
                value={query}
                onChangeText={setQuery}
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: '#FF6347' } }}
            />
            <View style={styles.buttonContainer}>
                <Button title="Search" onPress={fetchRecipes} disabled={loading} color="#FF6347" />
                <Button title={isListening ? "Stop Listening" : "Use Voice"} onPress={isListening ? stopListening : startListening} disabled={loading} color="#FF6347" />
            </View>

            {loading && <Text style={styles.loadingText}>Loading recipes...</Text>}

            <ScrollView style={styles.scrollView}>
                {recipes.length > 0 ? (
                    recipes.map((recipe: Recipe, index: number) => (
                        <View key={index} style={styles.recipeContainer}>
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
                                        renderItem={({ item }) => <Text style={styles.ingredientItem}>{item.name}</Text>}
                                    />
                                    <Text style={styles.sectionTitle}>Instructions:</Text>
                                    <HTML source={{ html: preprocessInstructions(recipe.instructions) }} contentWidth={width * 0.9} />
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View style={styles.noRecipesContainer}>
                        <Text style={styles.noRecipesText}>No recipes found. Try searching for something else.</Text>
                        <Image 
                            source={require('../images/foddieHelper.png')}
                            style={styles.chatbotImage}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: width * 0.04,
        backgroundColor: '#fff5e1',
    },
    input: {
        marginBottom: height * 0.02,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height * 0.02,
    },
    scrollView: {
        flex: 1,
    },
    recipeContainer: {
        marginVertical: height * 0.01,
        padding: width * 0.04,
        borderWidth: 1,
        borderColor: '#ff8c00',
        borderRadius: width * 0.02,
        backgroundColor: '#fff',
    },
    recipeTitle: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        marginBottom: height * 0.01,
        color: '#333',
    },
    recipeImage: {
        width: '100%',
        height: height * 0.25,
        resizeMode: 'cover',
        marginBottom: height * 0.01,
        borderRadius: width * 0.02,
    },
    chatbotImage: {
        width: '100%',
        height: height * 0.5,
        resizeMode: 'cover',
    },
    noRecipesContainer: {
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: width * 0.045,
        fontWeight: 'bold',
        marginTop: height * 0.01,
        color: '#FF6347',
    },
    ingredientItem: {
        marginLeft: width * 0.04,
        marginBottom: height * 0.005,
        color: '#333',
    },
    instructions: {
        marginLeft: width * 0.04,
        width: '100%',
        color: '#333',
    },
    loadingText: {
        alignSelf: 'center',
        marginTop: height * 0.02,
        color: '#FF6347',
    },
    noRecipesText: {
        alignSelf: 'center',
        marginTop: height * 0.02,
        fontStyle: 'italic',
        color: '#888',
    },
});

export default ChatbotScreen;
