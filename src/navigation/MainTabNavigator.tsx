import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ChatbotScreen from '../screens/ChatbotScreen';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRobot, faHistory } from '@fortawesome/free-solid-svg-icons'; // Import faHistory icon for History tab
import HistoryScreen from '../screens/HistoryScreen';

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
                        }

                        // You can return any component that you like here!
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
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{
                        tabBarLabel: 'History',
                        
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default MainTabNavigator;
