import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRobot, faHistory, faShoppingCart } from '@fortawesome/free-solid-svg-icons'; // Added faShoppingCart icon
import ChatbotScreen from '../screens/ChatbotScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Chatbot') {
                            iconName = faRobot;
                        } else if (route.name === 'History') {
                            iconName = faHistory;
                        } else if (route.name === 'Shopping List') {
                            iconName = faShoppingCart; // Changed to faShoppingCart for Shopping List tab
                        }

                        return <FontAwesomeIcon icon={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#FF6347',
                    tabBarInactiveTintColor: 'gray',
                    tabBarStyle: {
                        display: 'flex',
                    },
                })}
            >
                <Tab.Screen
                    name="Chatbot"
                    component={ChatbotScreen}
                    options={{
                        tabBarLabel: 'Chatbot',
                        headerShown: false,
                    }}
                />
                <Tab.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{
                        tabBarLabel: 'History',
                    }}
                />
                <Tab.Screen
                    name="Shopping List"
                    component={ShoppingListScreen}
                    options={{
                        tabBarLabel: 'Shopping List',
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default MainTabNavigator;
